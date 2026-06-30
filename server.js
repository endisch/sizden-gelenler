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
      frameSrc: ["https://accounts.google.com", "https://challenges.cloudflare.com"],
      connectSrc: ["'self'", "https://accounts.google.com", "https://static.cloudflareinsights.com"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "blob:"],
    }
  },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// ── JWT Config ──────────────────────────────────────────────────────────────
// Fallback secret: generate once and persist so it survives restarts
function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  return 'MAIS_STUDIO_STATIC_SECURE_SECRET_2026_DO_NOT_CHANGE_998877';
}
const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES = '8h';

// ── Upload dir ──────────────────────────────────────────────────────────────
const dataDir = fs.existsSync('/app/data') ? '/app/data' : __dirname;
const uploadDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.originalname.endsWith('.mp3')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece MP3 dosyası kabul edilmektedir.'));
    }
  }
});

// ── Data files ──────────────────────────────────────────────────────────────
const credFile = path.join(dataDir, 'staff_credentials.json');
let staffCredentials = [];
if (fs.existsSync(credFile)) {
  try { staffCredentials = JSON.parse(fs.readFileSync(credFile, 'utf8')); } catch(e) {}
}
function saveCredentials() {
  fs.writeFileSync(credFile, JSON.stringify(staffCredentials, null, 2), 'utf8');
}

// Auto-seed if credentials are empty (e.g. fresh deployment without volume)
if (staffCredentials.length === 0) {
  const bcrypt = require('bcryptjs');
  staffCredentials.push({ username: 'thendisch', passwordHash: bcrypt.hashSync('Th3nd!Schr$2026', 12), role: 'owner' });
  staffCredentials.push({ username: 'mustafaince', passwordHash: bcrypt.hashSync('Mstf!nc3$Mais26', 12), role: 'owner' });
  staffCredentials.push({ username: 'maisstudio', passwordHash: bcrypt.hashSync('Ma!sStd$2026x', 12), role: 'staff' });
  saveCredentials();
  console.log('Admin accounts auto-seeded!');
}

const submissionsFile = path.join(dataDir, 'submissions_data.json');
let submissionsData = [];
if (fs.existsSync(submissionsFile)) {
  try { submissionsData = JSON.parse(fs.readFileSync(submissionsFile, 'utf8')); } catch(e) {}
}
function saveSubmissionsData() {
  fs.writeFileSync(submissionsFile, JSON.stringify(submissionsData, null, 2), 'utf8');
}

// ── IP Rate Limit Storage ────────────────────────────────────────────────────
const ipLimitsFile = path.join(dataDir, 'ip_limits.json');
let ipLimits = {}; // { 'ip': lastSubmissionTimestamp }
if (fs.existsSync(ipLimitsFile)) {
  try { ipLimits = JSON.parse(fs.readFileSync(ipLimitsFile, 'utf8')); } catch(e) {}
}
function saveIpLimits() {
  fs.writeFileSync(ipLimitsFile, JSON.stringify(ipLimits, null, 2), 'utf8');
}

// ── Quota System Storage ─────────────────────────────────────────────────────
const statsFile = path.join(dataDir, 'stats.json');
let systemStats = { maxQuota: 200, usedQuota: 0 };
if (fs.existsSync(statsFile)) {
  try { systemStats = JSON.parse(fs.readFileSync(statsFile, 'utf8')); } catch(e) {}
}
function saveStats() {
  fs.writeFileSync(statsFile, JSON.stringify(systemStats, null, 2), 'utf8');
}

// ── Special System Storage ───────────────────────────────────────────────────
const specialConfigFile = path.join(dataDir, 'special_config.json');
let specialConfig = { active: false, title: 'Özel Konsept', maxQuota: 50, usedQuota: 0 };
if (fs.existsSync(specialConfigFile)) {
  try { specialConfig = JSON.parse(fs.readFileSync(specialConfigFile, 'utf8')); } catch(e) {}
}
function saveSpecialConfig() {
  fs.writeFileSync(specialConfigFile, JSON.stringify(specialConfig, null, 2), 'utf8');
}

const specialSubmissionsFile = path.join(dataDir, 'special_submissions_data.json');
let specialSubmissionsData = [];
if (fs.existsSync(specialSubmissionsFile)) {
  try { specialSubmissionsData = JSON.parse(fs.readFileSync(specialSubmissionsFile, 'utf8')); } catch(e) {}
}
function saveSpecialSubmissionsData() {
  fs.writeFileSync(specialSubmissionsFile, JSON.stringify(specialSubmissionsData, null, 2), 'utf8');
}

const specialIpLimitsFile = path.join(dataDir, 'special_ip_limits.json');
let specialIpLimits = {}; // { 'ip': lastSubmissionTimestamp }
if (fs.existsSync(specialIpLimitsFile)) {
  try { specialIpLimits = JSON.parse(fs.readFileSync(specialIpLimitsFile, 'utf8')); } catch(e) {}
}
function saveSpecialIpLimits() {
  fs.writeFileSync(specialIpLimitsFile, JSON.stringify(specialIpLimits, null, 2), 'utf8');
}

function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
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

async function uploadToDrive(filePath, fileName, mimeType = 'audio/mpeg', description = '') {
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const response = await drive.files.create({
    requestBody: { name: fileName, parents: [folderId], description },
    media: { mimeType, body: fs.createReadStream(filePath) },
    fields: 'id',
  });
  const fileId = response.data.id;
  const ownerEmail = process.env.DRIVE_OWNER_EMAIL;
  if (ownerEmail) {
    try {
      await drive.permissions.create({
        fileId,
        transferOwnership: true,
        requestBody: { role: 'owner', type: 'user', emailAddress: ownerEmail },
      });
    } catch (e) {}
  }
  return fileId;
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
    quota: systemStats,
    specialConfig: specialConfig
  });
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

app.post('/check-limit', async (req, res) => {
  try {
    const { token } = req.body;
    const payload = await verifyGoogleToken(token);
    const email = payload.email.toLowerCase();
    const limit = checkRateLimit(email);
    res.json({ ...limit, email, name: payload.name });
  } catch (err) {
    res.status(401).json({ error: 'Google kimlik doğrulaması başarısız: ' + err.message });
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

    const fileId = await uploadToDrive(req.file.path, fileName, 'audio/mpeg', description);
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

    const fileId = await uploadToDrive(req.file.path, fileName, 'audio/mpeg', description);
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

// First-time setup — only works when no accounts exist
app.post('/api/staff/setup', async (req, res) => {
  if (staffCredentials.length > 0) {
    return res.status(403).json({ error: 'Sistem zaten yapılandırılmış.' });
  }
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir.' });
  if (password.length < 6) return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır.' });

  const passwordHash = await bcrypt.hash(password, 12);
  staffCredentials.push({ username: username.toLowerCase().trim(), passwordHash, role: 'owner' });
  saveCredentials();

  const token = jwt.sign({ username: username.toLowerCase().trim(), role: 'owner' }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ success: true, token, username: username.toLowerCase().trim(), role: 'owner' });
});

// Login
app.post('/api/staff/login', async (req, res) => {
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

// Add account (owner only)
app.post('/api/staff/add-account', verifyStaffToken, requireOwner, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir.' });
  if (password.length < 6) return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır.' });

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
  if (newPassword.length < 6) return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalıdır.' });

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

app.get('/api/admin/submissions', verifyStaffToken, (req, res) => {
  res.json({
    submissions: submissionsData.map(s => ({ ...s, audioUrl: '/api/stream-audio?fileId=' + s.fileId })),
    accounts: staffCredentials.map(c => ({ username: c.username, role: c.role })),
    specialConfig: specialConfig,
    specialSubmissions: specialSubmissionsData.map(s => ({ ...s, audioUrl: '/api/stream-audio?fileId=' + s.fileId }))
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
    saveSubmissions();
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
    saveSubmissions();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Kayıt bulunamadı.' });
  }
});

app.post('/api/admin/reset-user', verifyStaffToken, (req, res) => {
  const { targetEmail } = req.body;
  const emailLower = targetEmail.toLowerCase();
  submissionsData = submissionsData.filter(s => s.email.toLowerCase() !== emailLower);
  saveSubmissionsData();
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
      return res.status(400).json({ error: 'Dosya boyutu çok büyük. Maksimum 20MB.' });
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
app.listen(PORT, () => console.log('Server running on port ' + PORT));
