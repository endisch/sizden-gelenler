const express = require('express');
const multer = require('multer');
const helmet = require('helmet');
const crypto = require('crypto');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Keep mutable state outside the application directory so deployments can
// mount a persistent volume and move the app without baking user data into code.
const defaultDataDir = fs.existsSync('/app/data') ? '/app/data' : path.join(__dirname, 'data');
const dataDir = path.resolve(process.env.DATA_DIR || defaultDataDir);
fs.mkdirSync(dataDir, { recursive: true });

const maxUploadMbValue = process.env.MAX_UPLOAD_MB === undefined
  ? 10
  : Number(process.env.MAX_UPLOAD_MB);
const MAX_UPLOAD_MB = Number.isInteger(maxUploadMbValue) && maxUploadMbValue >= 1 && maxUploadMbValue <= 10
  ? maxUploadMbValue
  : 10;
if (process.env.MAX_UPLOAD_MB !== undefined && MAX_UPLOAD_MB !== maxUploadMbValue) {
  console.warn('MAX_UPLOAD_MB must be a whole number between 1 and 10; using 10 MB.');
}
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

// ── Security Middleware ─────────────────────────────────────────────────────
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com", "https://apis.google.com", "https://static.cloudflareinsights.com", "https://challenges.cloudflare.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://accounts.google.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["https://accounts.google.com", "https://challenges.cloudflare.com", "https://www.youtube.com", "https://youtube.com"],
      connectSrc: ["'self'", "https://accounts.google.com", "https://static.cloudflareinsights.com"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "blob:"],
    }
  },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(express.json({ limit: '1mb' }));

const requestDurationBuckets = [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
const requestMetrics = new Map();
function getMetricRoute(req) {
  if (req.route && req.route.path) return String(req.baseUrl || '') + String(req.route.path);
  if (/^\/(?:index|admin|privacy|terms|404)\.html$/.test(req.path)) return req.path;
  if (req.path === '/' || req.path === '/healthz' || req.path === '/readyz') return req.path;
  if (req.path.startsWith('/assets/')) return '/assets/*';
  return 'unmatched';
}
function escapePrometheusLabel(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/"/g, '\\"');
}
app.use((req, res, next) => {
  if (req.path === '/metrics') return next();
  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    const elapsed = Number(process.hrtime.bigint() - startedAt) / 1e9;
    const labels = {
      method: req.method,
      route: getMetricRoute(req),
      status: `${Math.floor(res.statusCode / 100)}xx`
    };
    const key = `${labels.method}|${labels.route}|${labels.status}`;
    let metric = requestMetrics.get(key);
    if (!metric) {
      // Keep metric cardinality bounded even if callers request random paths.
      if (requestMetrics.size >= 200) return;
      metric = { ...labels, count: 0, duration: 0, buckets: requestDurationBuckets.map(() => 0) };
      requestMetrics.set(key, metric);
    }
    metric.count += 1;
    metric.duration += elapsed;
    requestDurationBuckets.forEach((bound, index) => {
      if (elapsed <= bound) metric.buckets[index] += 1;
    });
  });
  next();
});

function cacheStaticFile(res, filePath) {
  if (/\.(?:avif|css|gif|ico|jpe?g|js|png|svg|webp|woff2?)$/i.test(filePath)) {
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
  } else if (/\.html?$/i.test(filePath)) {
    res.setHeader('Cache-Control', 'no-cache');
  }
}
app.use(express.static(path.join(__dirname, 'public'), { etag: true, setHeaders: cacheStaticFile }));

// ── JWT Config ──────────────────────────────────────────────────────────────
// Generate a private persistent secret when one is not supplied by the host.
// Keep the data volume when migrating or all existing staff sessions will expire.
const jwtSecretFile = path.join(dataDir, '.jwt_secret');
function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  try {
    const existingSecret = fs.readFileSync(jwtSecretFile, 'utf8').trim();
    if (existingSecret) return existingSecret;
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  const generatedSecret = crypto.randomBytes(64).toString('hex');
  try {
    fs.writeFileSync(jwtSecretFile, generatedSecret, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    return generatedSecret;
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
    return fs.readFileSync(jwtSecretFile, 'utf8').trim();
  }
}
const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES = '8h';

// ── Upload dir ──────────────────────────────────────────────────────────────
const uploadDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 1,
    fields: 10,
    parts: 11,
    fieldNameSize: 100,
    fieldSize: 16 * 1024,
    fieldNestingDepth: 0,
    fieldArrayIndexLimit: 0
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || /\.mp3$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Sadece MP3 dosyası kabul edilmektedir.'));
    }
  }
});

// ── Data files ──────────────────────────────────────────────────────────────
function readJsonFile(filePath, fallback) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }

  let value;
  try {
    value = JSON.parse(content);
  } catch (err) {
    throw new Error(`Cannot load persisted data file ${path.basename(filePath)}: invalid JSON.`, { cause: err });
  }
  const expectedArray = Array.isArray(fallback);
  if (expectedArray ? !Array.isArray(value) : !value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Cannot load persisted data file ${path.basename(filePath)}: unexpected data shape.`);
  }
  return value;
}

function saveJsonFile(filePath, value) {
  const temporaryPath = `${filePath}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, JSON.stringify(value, null, 2), {
      encoding: 'utf8',
      flag: 'wx',
      mode: 0o600
    });
    fs.renameSync(temporaryPath, filePath);
  } catch (err) {
    try { fs.unlinkSync(temporaryPath); } catch (cleanupError) {
      if (cleanupError.code !== 'ENOENT') console.error('Could not remove temporary state file:', cleanupError.message);
    }
    throw err;
  }
}

const credFile = path.join(dataDir, 'staff_credentials.json');
let staffCredentials = readJsonFile(credFile, []);
function saveCredentials() {
  saveJsonFile(credFile, staffCredentials);
}

// Bootstrap only from deployment secrets; never ship default passwords in source.
if (staffCredentials.length === 0) {
  const initialOwnerUsername = (process.env.INITIAL_OWNER_USERNAME || '').trim().toLowerCase();
  const initialOwnerPassword = process.env.INITIAL_OWNER_PASSWORD || '';
  if (initialOwnerUsername || initialOwnerPassword) {
    if (!initialOwnerUsername || initialOwnerPassword.length < 14) {
      throw new Error('Set both INITIAL_OWNER_USERNAME and an INITIAL_OWNER_PASSWORD of at least 14 characters.');
    }
    staffCredentials.push({
      username: initialOwnerUsername,
      passwordHash: bcrypt.hashSync(initialOwnerPassword, 12),
      role: 'owner'
    });
    saveCredentials();
    console.log('Initial owner account created from environment configuration.');
  }
}

const submissionsFile = path.join(dataDir, 'submissions_data.json');
let submissionsData = readJsonFile(submissionsFile, []);
function saveSubmissionsData() {
  saveJsonFile(submissionsFile, submissionsData);
}

// ── IP Rate Limit Storage ────────────────────────────────────────────────────
const ipLimitsFile = path.join(dataDir, 'ip_limits.json');
let ipLimits = readJsonFile(ipLimitsFile, {}); // { 'ip': lastSubmissionTimestamp }
function saveIpLimits() {
  saveJsonFile(ipLimitsFile, ipLimits);
}

// ── Quota System Storage ─────────────────────────────────────────────────────
const statsFile = path.join(dataDir, 'stats.json');
let systemStats = readJsonFile(statsFile, { maxQuota: 200, usedQuota: 0 });
function saveStats() {
  saveJsonFile(statsFile, systemStats);
}

// ── Special System Storage ───────────────────────────────────────────────────
const specialConfigFile = path.join(dataDir, 'special_config.json');
let specialConfig = readJsonFile(specialConfigFile, { active: false, title: 'Özel Konsept', maxQuota: 50, usedQuota: 0 });
function saveSpecialConfig() {
  saveJsonFile(specialConfigFile, specialConfig);
}

const specialSubmissionsFile = path.join(dataDir, 'special_submissions_data.json');
let specialSubmissionsData = readJsonFile(specialSubmissionsFile, []);
function saveSpecialSubmissionsData() {
  saveJsonFile(specialSubmissionsFile, specialSubmissionsData);
}

const specialIpLimitsFile = path.join(dataDir, 'special_ip_limits.json');
let specialIpLimits = readJsonFile(specialIpLimitsFile, {}); // { 'ip': lastSubmissionTimestamp }
function saveSpecialIpLimits() {
  saveJsonFile(specialIpLimitsFile, specialIpLimits);
}

function getClientIp(req) {
  return req.ip || req.socket.remoteAddress || '';
}

function checkIpLimit(ip) {
  const lastSub = ipLimits[ip];
  if (!lastSub) return { allowed: true };
  const diff = Date.now() - lastSub;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (diff < sevenDays) {
    const remaining = sevenDays - diff;
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { allowed: false, days, hours };
  }
  return { allowed: true };
}

function checkSpecialIpLimit(ip) {
  const lastSub = specialIpLimits[ip];
  if (!lastSub) return { allowed: true };
  const diff = Date.now() - lastSub;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (diff < sevenDays) {
    const remaining = sevenDays - diff;
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { allowed: false, days, hours };
  }
  return { allowed: true };
}

// ── Google OAuth (for public submission form only) ──────────────────────────
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

async function makeUploadRequestId(filePath, details) {
  const fileHash = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(filePath)) fileHash.update(chunk);
  return crypto.createHash('sha256')
    .update(JSON.stringify({ ...details, contentHash: fileHash.digest('hex') }))
    .digest('hex');
}

// ── Staff JWT middleware ─────────────────────────────────────────────────────
function verifyStaffToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Oturum bulunamadı.' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.staffUser = payload;
    next();
  } catch(e) {
    return res.status(401).json({ error: 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.' });
  }
}

function requireOwner(req, res, next) {
  if (req.staffUser.role !== 'owner') {
    return res.status(403).json({ error: 'Bu işlem için kurucu yetkisi gereklidir.' });
  }
  next();
}

// ── Google Drive helpers ─────────────────────────────────────────────────────
function getDriveClient() {
  const refresh_token = process.env.GOOGLE_REFRESH_TOKEN;
  if (refresh_token) {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ refresh_token });
    return google.drive({ version: 'v3', auth });
  }
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
}

async function uploadToDrive(filePath, fileName, mimeType = 'audio/mpeg', description = '', requestId = crypto.randomUUID()) {
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) throw new Error('GOOGLE_DRIVE_FOLDER_ID is not configured.');

  // The same request ID is attached to each attempt. If Drive stored the file
  // but the response was lost, find it before retrying to avoid duplicates.
  const escapedFolderId = folderId.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const escapedRequestId = requestId.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const findPriorAttempt = async () => {
    const result = await drive.files.list({
      q: `'${escapedFolderId}' in parents and appProperties has { key='maisUploadRequestId' and value='${escapedRequestId}' } and trashed = false`,
      pageSize: 1,
      fields: 'files(id)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });
    return result.data.files && result.data.files[0] ? result.data.files[0].id : null;
  };
  const isRetryable = (err) => {
    const status = Number(err.response && err.response.status || err.status || 0);
    return status === 408 || status === 429 || status >= 500 ||
      ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ECONNREFUSED'].includes(err.code);
  };

  let fileId;
  try {
    fileId = await findPriorAttempt();
  } catch (lookupError) {
    console.warn('Drive idempotency lookup failed; proceeding with upload:', lookupError.message);
  }
  for (let attempt = 1; !fileId && attempt <= 4; attempt += 1) {
    try {
      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [folderId],
          description,
          appProperties: { maisUploadRequestId: requestId }
        },
        media: { mimeType, body: fs.createReadStream(filePath) },
        fields: 'id',
        supportsAllDrives: true
      });
      fileId = response.data.id;
      if (!fileId) throw new Error('Google Drive did not return a file ID.');
    } catch (err) {
      if (!isRetryable(err) || attempt === 4) throw err;
      try {
        fileId = await findPriorAttempt();
        if (fileId) break;
      } catch (lookupError) {
        console.warn('Drive retry lookup failed:', lookupError.message);
      }
      const delay = Math.min(4000, 250 * (2 ** (attempt - 1))) + Math.floor(Math.random() * 200);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  const ownerEmail = process.env.DRIVE_OWNER_EMAIL;
  if (ownerEmail) {
    try {
      await drive.permissions.create({
        fileId,
        transferOwnership: true,
        requestBody: { role: 'owner', type: 'user', emailAddress: ownerEmail },
      });
    } catch (e) {
      console.warn('Drive owner transfer failed:', e.message);
    }
  }
  return fileId;
}

const transientRequestLimits = new Map();
function limitByClientIp(bucket, maximum, windowMs) {
  return (req, res, next) => {
    const key = `${bucket}:${getClientIp(req)}`;
    const now = Date.now();
    const current = transientRequestLimits.get(key);
    if (!current || now >= current.resetAt) {
      transientRequestLimits.set(key, { count: 1, resetAt: now + windowMs });
    } else if (current.count >= maximum) {
      const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Çok sık istek gönderildi. Lütfen biraz bekleyin.' });
    } else {
      current.count += 1;
    }

    if (transientRequestLimits.size > 5000) {
      for (const [storedKey, value] of transientRequestLimits) {
        if (now >= value.resetAt) transientRequestLimits.delete(storedKey);
      }
      while (transientRequestLimits.size > 5000) {
        transientRequestLimits.delete(transientRequestLimits.keys().next().value);
      }
    }
    next();
  };
}

// ── Rate limit helper ────────────────────────────────────────────────────────
function checkRateLimit(email) {
  const emailLower = email.toLowerCase();
  const userSubs = submissionsData.filter(s => s.email.toLowerCase() === emailLower);
  if (userSubs.length === 0) return { allowed: true };
  const latestSub = Math.max(...userSubs.map(s => new Date(s.timestamp).getTime()));
  const diff = Date.now() - latestSub;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (diff < sevenDays) {
    const remaining = sevenDays - diff;
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { allowed: false, days, hours };
  }
  return { allowed: true };
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ════════════════════════════════════════════════════════════════════════════

app.get('/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    setupRequired: staffCredentials.length === 0,
    maxUploadMb: MAX_UPLOAD_MB,
    quota: systemStats,
    specialConfig: specialConfig
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/readyz', async (req, res) => {
  try {
    await fs.promises.access(dataDir, fs.constants.R_OK | fs.constants.W_OK);
    res.status(200).json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'not-ready' });
  }
});

app.get('/metrics', (req, res) => {
  const configuredToken = process.env.METRICS_TOKEN || '';
  const presentedToken = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const configured = Buffer.from(configuredToken);
  const presented = Buffer.from(presentedToken);
  if (configured.length < 32 || configured.length !== presented.length || !crypto.timingSafeEqual(configured, presented)) {
    return res.sendStatus(404);
  }

  const lines = [
    '# HELP mais_http_requests_total Completed HTTP requests.',
    '# TYPE mais_http_requests_total counter',
    '# HELP mais_http_request_duration_seconds Request duration in seconds.',
    '# TYPE mais_http_request_duration_seconds histogram',
    '# HELP mais_process_uptime_seconds Process uptime in seconds.',
    '# TYPE mais_process_uptime_seconds gauge',
    '# HELP mais_process_resident_memory_bytes Resident process memory in bytes.',
    '# TYPE mais_process_resident_memory_bytes gauge'
  ];
  for (const metric of requestMetrics.values()) {
    const label = `method="${escapePrometheusLabel(metric.method)}",route="${escapePrometheusLabel(metric.route)}",status="${metric.status}"`;
    lines.push(`mais_http_requests_total{${label}} ${metric.count}`);
    lines.push(`mais_http_request_duration_seconds_sum{${label}} ${metric.duration}`);
    lines.push(`mais_http_request_duration_seconds_count{${label}} ${metric.count}`);
    requestDurationBuckets.forEach((bound, index) => {
      lines.push(`mais_http_request_duration_seconds_bucket{${label},le="${bound}"} ${metric.buckets[index]}`);
    });
    lines.push(`mais_http_request_duration_seconds_bucket{${label},le="+Inf"} ${metric.count}`);
  }
  lines.push(`mais_process_uptime_seconds ${process.uptime()}`);
  lines.push(`mais_process_resident_memory_bytes ${process.memoryUsage().rss}`);
  res.type('text/plain; version=0.0.4; charset=utf-8').send(lines.join('\n') + '\n');
});

app.get('/api/playlist', verifyStaffToken, (req, res) => {
  const published = submissionsData
    .filter(s => s.status === 'published')
    .sort((a, b) => new Date(b.publishDate || b.timestamp) - new Date(a.publishDate || a.timestamp))
    .map(s => ({
      id: s.id,
      title: s.trackName,
      artist: s.fullName,
      aiTool: s.aiTool,
      publishDate: s.publishDate || s.timestamp,
      audioUrl: '/api/stream-audio?fileId=' + s.fileId
    }));
  res.json(published);
});

app.get('/api/stream-audio', verifyStaffToken, async (req, res) => {
  const { fileId } = req.query;
  if (!fileId) return res.status(400).send('File ID missing');
  try {
    const drive = getDriveClient();
    const file = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    res.setHeader('Content-Type', 'audio/mpeg');
    file.data.pipe(res);
  } catch (err) {
    res.status(500).send('Error streaming audio');
  }
});

app.post('/check-limit', limitByClientIp('google-check', 30, 10 * 60 * 1000), async (req, res) => {
  try {
    const { token } = req.body;
    const clientIp = getClientIp(req);
    const ipLimit = checkIpLimit(clientIp);
    if (!ipLimit.allowed) return res.json({ allowed: false, days: ipLimit.days, hours: ipLimit.hours });

    const payload = await verifyGoogleToken(token);
    const email = payload.email.toLowerCase();
    const limit = checkRateLimit(email);
    res.json({ ...limit, email, name: payload.name });
  } catch (err) {
    res.status(401).json({ error: 'Google kimlik doğrulaması başarısız: ' + err.message });
  }
});

app.post('/check-special-limit', limitByClientIp('special-google-check', 30, 10 * 60 * 1000), async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token eksik.' });

    if (!specialConfig.active) {
       return res.status(403).json({ error: 'Özel bölüm kapalıdır.' });
    }

    const clientIp = getClientIp(req);
    const ipLimit = checkSpecialIpLimit(clientIp);
    if (!ipLimit.allowed) return res.json({ allowed: false, days: ipLimit.days, hours: ipLimit.hours });

    const payload = await verifyGoogleToken(token);
    const email = payload.email.toLowerCase();

    const userSubs = specialSubmissionsData.filter(s => s.email.toLowerCase() === email);
    if (userSubs.length > 0) {
      const latestSub = Math.max(...userSubs.map(s => new Date(s.timestamp).getTime()));
      const diff = Date.now() - latestSub;
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (diff < sevenDays) {
        const remaining = sevenDays - diff;
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return res.json({ allowed: false, days, hours });
      }
    }
    res.json({ allowed: true, name: payload.name });
  } catch (err) {
    res.status(401).json({ error: 'Geçersiz token.' });
  }
});

app.post('/submit', upload.single('mp3'), async (req, res) => {
  try {
    const { token, fullName, social, aiTool, trackName, note, consent } = req.body;
    if (!token || !fullName || !social || !aiTool || !trackName || !note || !consent) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
    }
    if (!req.file) return res.status(400).json({ error: 'MP3 dosyası yüklenmedi.' });

    // Note character limit: 210
    if (note.length > 210) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Parça notu en fazla 210 karakter olabilir.' });
    }

    // Check global quota
    if (systemStats.usedQuota >= systemStats.maxQuota) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Sistem kotası dolmuştur. Yeni başvuru kabul edilmemektedir.' });
    }

    const clientIp = getClientIp(req);

    // Check IP rate limit first
    const ipLimit = checkIpLimit(clientIp);
    if (!ipLimit.allowed) {
      fs.unlinkSync(req.file.path);
      return res.status(429).json({ error: 'Sistem limitlerine ulaşıldı. Bu hafta zaten bir başvuru gerçekleştirdiniz.', days: ipLimit.days, hours: ipLimit.hours });
    }

    const googlePayload = await verifyGoogleToken(token);
    const email = googlePayload.email.toLowerCase();

    // Check email rate limit
    const limit = checkRateLimit(email);
    if (!limit.allowed) {
      fs.unlinkSync(req.file.path);
      return res.status(429).json({ error: 'Bu hafta zaten bir parça gönderdiniz.', days: limit.days, hours: limit.hours });
    }

    const date = new Date().toISOString().slice(0, 10);
    const cleanStr = (str) => str.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s-]/g, '').trim()
      .split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    const fileName = cleanStr(fullName) + ' - ' + cleanStr(trackName) + ' - ' + date + '.mp3';
    const description = `Gönderen: ${fullName}\nE-posta: ${email}\nSosyal Medya: ${social}\nYapay Zeka Aracı: ${aiTool}\nParça Adı: ${trackName}\nTarih: ${date}\n\nParça Notu:\n${note}`;

    const uploadRequestId = await makeUploadRequestId(req.file.path, {
      type: 'standard', fullName, email, social, aiTool, trackName, note, date
    });
    const fileId = await uploadToDrive(req.file.path, fileName, 'audio/mpeg', description, uploadRequestId);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    submissionsData.push({
      id: Date.now().toString(),
      fullName, email, social, aiTool, trackName, note, fileId,
      submittedIp: clientIp,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
    saveSubmissionsData();

    // Record IP limit
    ipLimits[clientIp] = Date.now();
    saveIpLimits();

    // Increment quota
    systemStats.usedQuota += 1;
    saveStats();

    res.json({ success: true });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Gönderim sırasında bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

app.post('/submit-special', upload.single('mp3'), async (req, res) => {
  try {
    if (!specialConfig.active) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Özel bölüm şu anda aktif değildir.' });
    }

    const { token, fullName, social, aiTool, trackName, note, consent } = req.body;
    if (!token || !fullName || !social || !aiTool || !trackName || !note || !consent) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
    }
    if (!req.file) return res.status(400).json({ error: 'MP3 dosyası yüklenmedi.' });

    if (note.length > 210) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Parça notu en fazla 210 karakter olabilir.' });
    }

    if (specialConfig.usedQuota >= specialConfig.maxQuota) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Özel bölüm kotası dolmuştur.' });
    }

    const clientIp = getClientIp(req);
    const ipLimit = checkSpecialIpLimit(clientIp);
    if (!ipLimit.allowed) {
      fs.unlinkSync(req.file.path);
      return res.status(429).json({ error: 'Her katılımcıdan haftalık yalnızca 1 başvuru kabul edilmektedir.', days: ipLimit.days, hours: ipLimit.hours });
    }

    const googlePayload = await verifyGoogleToken(token);
    const email = googlePayload.email.toLowerCase();

    // Special limit via email
    const userSubs = specialSubmissionsData.filter(s => s.email.toLowerCase() === email);
    if (userSubs.length > 0) {
      const latestSub = Math.max(...userSubs.map(s => new Date(s.timestamp).getTime()));
      const diff = Date.now() - latestSub;
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (diff < sevenDays) {
        fs.unlinkSync(req.file.path);
        const remaining = sevenDays - diff;
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return res.status(429).json({ error: 'Özel bölüme bu hafta zaten parça gönderdiniz.', days, hours });
      }
    }

    const date = new Date().toISOString().slice(0, 10);
    const cleanStr = (str) => str.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s-]/g, '').trim()
      .split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    const fileName = 'SPECIAL - ' + cleanStr(fullName) + ' - ' + cleanStr(trackName) + ' - ' + date + '.mp3';
    const description = `ÖZEL BÖLÜM: ${specialConfig.title}\nGönderen: ${fullName}\nE-posta: ${email}\nSosyal Medya: ${social}\nYapay Zeka Aracı: ${aiTool}\nParça Adı: ${trackName}\nTarih: ${date}\n\nParça Notu:\n${note}`;

    const uploadRequestId = await makeUploadRequestId(req.file.path, {
      type: 'special', fullName, email, social, aiTool, trackName, note, date
    });
    const fileId = await uploadToDrive(req.file.path, fileName, 'audio/mpeg', description, uploadRequestId);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    specialSubmissionsData.push({
      id: Date.now().toString(),
      fullName, email, social, aiTool, trackName, note, fileId,
      submittedIp: clientIp,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
    saveSpecialSubmissionsData();

    specialIpLimits[clientIp] = Date.now();
    saveSpecialIpLimits();

    specialConfig.usedQuota += 1;
    saveSpecialConfig();

    res.json({ success: true });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Special submit error:', err);
    res.status(500).json({ error: 'Gönderim sırasında bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// STAFF AUTH ROUTES
// ════════════════════════════════════════════════════════════════════════════

// Public self-service owner setup is intentionally disabled. On a new host,
// create the first owner with INITIAL_OWNER_USERNAME/PASSWORD environment vars.
app.post('/api/staff/setup', (req, res) => {
  res.status(403).json({ error: 'İlk yönetici hesabı sunucu ortam değişkenleriyle oluşturulmalıdır.' });
});

// Login
app.post('/api/staff/login', limitByClientIp('staff-login', 10, 15 * 60 * 1000), async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir.' });

  const user = staffCredentials.find(u => u.username === username.toLowerCase().trim());
  if (!user) return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });

  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ success: true, token, username: user.username, role: user.role });
});

// Verify session
app.get('/api/staff/verify', verifyStaffToken, (req, res) => {
  res.json({ valid: true, username: req.staffUser.username, role: req.staffUser.role });
});

// Allow each signed-in staff member to update their own login name. The current
// password is required, and a fresh token is returned with the new username.
app.post('/api/staff/update-username', verifyStaffToken, async (req, res) => {
  const currentPassword = String(req.body.currentPassword || '');
  const newUsername = String(req.body.newUsername || '').trim().toLowerCase();
  if (!currentPassword || !/^[a-z0-9._-]{3,32}$/.test(newUsername)) {
    return res.status(400).json({ error: 'Kullanıcı adı 3–32 karakter olmalı; harf, sayı, nokta, tire ve alt çizgi kullanılabilir.' });
  }
  const user = staffCredentials.find(u => u.username === req.staffUser.username);
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return res.status(401).json({ error: 'Mevcut şifre hatalı.' });
  }
  if (staffCredentials.some(u => u.username === newUsername && u !== user)) {
    return res.status(409).json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' });
  }
  user.username = newUsername;
  saveCredentials();
  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ success: true, username: user.username, role: user.role, token });
});

// Add account (owner only)
app.post('/api/staff/add-account', verifyStaffToken, requireOwner, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir.' });
  if (password.length < 14) return res.status(400).json({ error: 'Şifre en az 14 karakter olmalıdır.' });

  const exists = staffCredentials.find(u => u.username === username.toLowerCase().trim());
  if (exists) return res.status(400).json({ error: 'Bu kullanıcı adı zaten mevcut.' });

  const passwordHash = await bcrypt.hash(password, 12);
  staffCredentials.push({ username: username.toLowerCase().trim(), passwordHash, role: 'staff' });
  saveCredentials();
  res.json({ success: true, accounts: staffCredentials.map(u => ({ username: u.username, role: u.role })) });
});

// Remove account (owner only)
app.post('/api/staff/remove-account', verifyStaffToken, requireOwner, (req, res) => {
  const { username } = req.body;
  if (username === req.staffUser.username) return res.status(400).json({ error: 'Kendi hesabınızı silemezsiniz.' });
  staffCredentials = staffCredentials.filter(u => u.username !== username.toLowerCase().trim());
  saveCredentials();
  res.json({ success: true, accounts: staffCredentials.map(u => ({ username: u.username, role: u.role })) });
});

// Change password
app.post('/api/staff/change-password', verifyStaffToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Tüm alanları doldurun.' });
  if (newPassword.length < 14) return res.status(400).json({ error: 'Yeni şifre en az 14 karakter olmalıdır.' });

  const user = staffCredentials.find(u => u.username === req.staffUser.username);
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Mevcut şifre hatalı.' });

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  saveCredentials();
  res.json({ success: true });
});

// ════════════════════════════════════════════════════════════════════════════
// STAFF MANAGEMENT ROUTES (JWT protected)
// ════════════════════════════════════════════════════════════════════════════


function getLimitsArray() {
  const limitsList = [];
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  
  const ipToEmail = {};
  submissionsData.forEach(s => { if (s.submittedIp) ipToEmail[s.submittedIp] = s.email; });
  specialSubmissionsData.forEach(s => { if (s.submittedIp) ipToEmail[s.submittedIp] = s.email; });

  const addedEmails = new Set();

  for (const [ip, ts] of Object.entries(ipLimits)) {
    if (Date.now() - ts < sevenDays) {
      const email = ipToEmail[ip] || ip;
      limitsList.push({ ip: ip, email: email, timestamp: ts, type: 'Normal' });
      if (email !== ip) addedEmails.add(email.toLowerCase());
    }
  }
  for (const [ip, ts] of Object.entries(specialIpLimits)) {
    if (Date.now() - ts < sevenDays) {
      const email = ipToEmail[ip] || ip;
      limitsList.push({ ip: ip, email: email, timestamp: ts, type: 'Özel' });
      if (email !== ip) addedEmails.add(email.toLowerCase());
    }
  }
  submissionsData.forEach(s => {
    if (s.email && !addedEmails.has(s.email.toLowerCase())) {
      const ts = new Date(s.timestamp).getTime();
      if (Date.now() - ts < sevenDays) {
        limitsList.push({ ip: s.submittedIp || '', email: s.email, timestamp: ts, type: 'Normal' });
        addedEmails.add(s.email.toLowerCase());
      }
    }
  });
  specialSubmissionsData.forEach(s => {
    if (s.email && !addedEmails.has(s.email.toLowerCase())) {
      const ts = new Date(s.timestamp).getTime();
      if (Date.now() - ts < sevenDays) {
        limitsList.push({ ip: s.submittedIp || '', email: s.email, timestamp: ts, type: 'Özel' });
        addedEmails.add(s.email.toLowerCase());
      }
    }
  });

  limitsList.sort((a,b) => b.timestamp - a.timestamp);
  return limitsList;
}

app.get('/api/admin/submissions', verifyStaffToken, (req, res) => {
  res.json({
    submissions: submissionsData.map(s => ({ ...s, audioUrl: '/api/stream-audio?fileId=' + s.fileId })),
    accounts: staffCredentials.map(c => ({ username: c.username, role: c.role })),
    specialConfig: specialConfig,
    specialSubmissions: specialSubmissionsData.map(s => ({ ...s, audioUrl: '/api/stream-audio?fileId=' + s.fileId })),
    limits: getLimitsArray()
  });
});

app.post('/api/admin/save-special-config', verifyStaffToken, (req, res) => {
  if (req.staffUser.role !== 'owner') return res.status(403).json({ error: 'Yetkisiz erişim.' });
  const { active, title, maxQuota, resetQuota } = req.body;
  if (typeof active !== 'undefined') specialConfig.active = active;
  if (title) specialConfig.title = title;
  if (maxQuota) specialConfig.maxQuota = parseInt(maxQuota) || 50;
  if (resetQuota) specialConfig.usedQuota = 0;
  saveSpecialConfig();
  res.json({ success: true, specialConfig });
});

app.post('/api/admin/sync-drive', verifyStaffToken, async (req, res) => {
  if (req.staffUser.role !== 'owner') return res.status(403).json({ error: 'Yetkisiz erişim.' });
  try {
    const drive = getDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) return res.status(400).json({ error: 'Drive folder ID missing' });
    
    let pageToken = null;
    let addedCount = 0;
    do {
      const response = await drive.files.list({
        q: "'" + folderId + "' in parents and trashed = false",
        fields: 'nextPageToken, files(id, name, createdTime, mimeType)',
        pageToken: pageToken
      });
      const files = response.data.files;
      if (files) {
        for (const f of files) {
          if (f.mimeType === 'application/vnd.google-apps.folder') continue;
          const exists = submissionsData.some(s => s.fileId === f.id) || specialSubmissionsData.some(s => s.fileId === f.id);
          if (!exists) {
            submissionsData.unshift({
              id: 'sub_' + Date.now() + Math.random().toString(36).substr(2,5),
              fullName: 'Eski Gönderim (Drive)',
              email: 'Bilinmiyor',
              trackName: f.name.replace(/\.[^/.]+$/, ""),
              aiTool: 'Bilinmiyor',
              timestamp: f.createdTime || new Date().toISOString(),
              fileId: f.id,
              status: 'pending'
            });
            systemStats.usedQuota += 1;
            addedCount++;
          }
        }
      }
      pageToken = response.data.nextPageToken;
    } while (pageToken);
    
    if (addedCount > 0) {
      saveSubmissionsData();
      saveStats();
    }
    
    res.json({ success: true, count: addedCount, usedQuota: systemStats.usedQuota });
  } catch (err) {
    console.error('Drive sync error:', err);
    res.status(500).json({ error: 'Drive eşitleme hatası.' });
  }
});

// Remove only stale app records whose Drive file IDs are absent from the
// configured folder. This never deletes or modifies files in Google Drive.
app.post('/api/admin/clean-missing-drive-records', verifyStaffToken, requireOwner, async (req, res) => {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) return res.status(400).json({ error: 'Google Drive klasörü yapılandırılmamış.' });
    const drive = getDriveClient();
    const driveIds = new Set();
    let pageToken;
    do {
      const response = await drive.files.list({
        q: `'${folderId.replace(/'/g, "\\'")}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, mimeType)',
        pageToken,
        pageSize: 1000
      });
      for (const file of response.data.files || []) {
        if (file.mimeType !== 'application/vnd.google-apps.folder') driveIds.add(file.id);
      }
      pageToken = response.data.nextPageToken;
    } while (pageToken);

    const beforeRegular = submissionsData.length;
    const beforeSpecial = specialSubmissionsData.length;
    const removedTracks = [
      ...submissionsData.filter(s => !s.fileId || !driveIds.has(s.fileId)),
      ...specialSubmissionsData.filter(s => !s.fileId || !driveIds.has(s.fileId))
    ].map(s => ({ title: s.trackName || 'İsimsiz parça', artist: s.fullName || 'Bilinmiyor' }));
    submissionsData = submissionsData.filter(s => s.fileId && driveIds.has(s.fileId));
    specialSubmissionsData = specialSubmissionsData.filter(s => s.fileId && driveIds.has(s.fileId));
    const removedRegular = beforeRegular - submissionsData.length;
    const removedSpecial = beforeSpecial - specialSubmissionsData.length;
    if (removedRegular) saveSubmissionsData();
    if (removedSpecial) saveSpecialSubmissionsData();
    res.json({ success: true, removed: removedRegular + removedSpecial, removedRegular, removedSpecial, driveFiles: driveIds.size, removedTracks });
  } catch (err) {
    console.error('Drive cleanup failed:', err);
    res.status(502).json({ error: 'Drive doğrulanamadı; hiçbir kayıt silinmedi. Bağlantı ve yetkileri kontrol edin.' });
  }
});

app.post('/api/admin/update-special-status', verifyStaffToken, (req, res) => {
  const { id, status } = req.body;
  const sub = specialSubmissionsData.find(s => s.id === id);
  if (!sub) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
  sub.status = status;
  if (status === 'published' || status === 'reviewed') sub.publishDate = new Date().toISOString();
  saveSpecialSubmissionsData();
  res.json({ success: true });
});

app.post('/api/admin/update-status', verifyStaffToken, (req, res) => {
  const { fileId, status } = req.body;
  const idx = submissionsData.findIndex(s => s.id === fileId);
  if (idx !== -1) {
    submissionsData[idx].status = status;
    saveSubmissionsData();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Kayıt bulunamadı.' });
  }
});

app.post('/api/admin/unreview', verifyStaffToken, (req, res) => {
  const { fileId } = req.body;
  const idx = submissionsData.findIndex(s => s.id === fileId);
  if (idx !== -1) {
    submissionsData[idx].status = 'pending';
    saveSubmissionsData();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Kayıt bulunamadı.' });
  }
});

app.post('/api/admin/reset-user', verifyStaffToken, (req, res) => {
  const { targetEmail, targetIp } = req.body;
  if (targetEmail) {
    const emailLower = targetEmail.toLowerCase();
    const oldTs = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    submissionsData.forEach(s => { if (s.email && s.email.toLowerCase() === emailLower) s.timestamp = oldTs; });
    saveSubmissionsData();
    specialSubmissionsData.forEach(s => { if (s.email && s.email.toLowerCase() === emailLower) s.timestamp = oldTs; });
    saveSpecialSubmissionsData();
  }
  if (targetIp) {
    if (ipLimits[targetIp]) delete ipLimits[targetIp];
    if (specialIpLimits[targetIp]) delete specialIpLimits[targetIp];
    saveIpLimits();
    saveSpecialIpLimits();
  }
  res.json({ success: true });
});

app.post('/api/admin/reset-all-limits', verifyStaffToken, (req, res) => {
  ipLimits = {};
  saveIpLimits();
  specialIpLimits = {};
  saveSpecialIpLimits();

  const oldTs = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
  submissionsData.forEach(s => { s.timestamp = oldTs; });
  saveSubmissionsData();
  
  specialSubmissionsData.forEach(s => { s.timestamp = oldTs; });
  saveSpecialSubmissionsData();

  specialConfig.usedQuota = 0;
  saveSpecialConfig();

  res.json({ success: true });
});

// Legacy reset endpoint REMOVED for security

// Google OAuth flow — only available when ENABLE_AUTH_SETUP=true
if (process.env.ENABLE_AUTH_SETUP === 'true') {
  app.get('/auth', (req, res) => {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://' + req.headers.host + '/oauth2callback'
    );
    res.redirect(oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive'],
      prompt: 'consent'
    }));
  });

  app.get('/oauth2callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.send('Auth code missing');
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'https://' + req.headers.host + '/oauth2callback'
      );
      const { tokens } = await oauth2Client.getToken(code);
      if (tokens.refresh_token) {
        res.send('Yetkilendirme basarili. Token alindi. Railway env degiskenlerine ekleyin.');
      } else {
        res.send('refresh_token dönmedi.');
      }
    } catch (err) {
      res.status(500).send('Yetkilendirme hatası oluştu.');
    }
  });
}

// ── Multer Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: `Dosya boyutu çok büyük. Maksimum ${MAX_UPLOAD_MB} MB.` });
    }
    return res.status(400).json({ error: 'Dosya yükleme hatası.' });
  }
  if (err) {
    console.error('Unhandled error:', err);
    return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
  next();
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log('Server running on port ' + PORT));

function shutdown(signal) {
  console.log(`${signal} received; closing HTTP server.`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
