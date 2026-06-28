const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const JWT_SECRET = process.env.JWT_SECRET || 'mais-studio-jwt-secret-2026-secure';
const JWT_EXPIRES = '8h';

// ── Upload dir ──────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, 'uploads');
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
const credFile = path.join(__dirname, 'staff_credentials.json');
let staffCredentials = [];
if (fs.existsSync(credFile)) {
  try { staffCredentials = JSON.parse(fs.readFileSync(credFile, 'utf8')); } catch(e) {}
}
function saveCredentials() {
  fs.writeFileSync(credFile, JSON.stringify(staffCredentials, null, 2), 'utf8');
}

const submissionsFile = path.join(__dirname, 'submissions_data.json');
let submissionsData = [];
if (fs.existsSync(submissionsFile)) {
  try { submissionsData = JSON.parse(fs.readFileSync(submissionsFile, 'utf8')); } catch(e) {}
}
function saveSubmissionsData() {
  fs.writeFileSync(submissionsFile, JSON.stringify(submissionsData, null, 2), 'utf8');
}

// ── IP Rate Limit Storage ────────────────────────────────────────────────────
const ipLimitsFile = path.join(__dirname, 'ip_limits.json');
let ipLimits = {}; // { 'ip': lastSubmissionTimestamp }
if (fs.existsSync(ipLimitsFile)) {
  try { ipLimits = JSON.parse(fs.readFileSync(ipLimitsFile, 'utf8')); } catch(e) {}
}
function saveIpLimits() {
  fs.writeFileSync(ipLimitsFile, JSON.stringify(ipLimits, null, 2), 'utf8');
}

// ── Quota System Storage ─────────────────────────────────────────────────────
const statsFile = path.join(__dirname, 'stats.json');
let systemStats = { maxQuota: 200, usedQuota: 0 };
if (fs.existsSync(statsFile)) {
  try { systemStats = JSON.parse(fs.readFileSync(statsFile, 'utf8')); } catch(e) {}
}
function saveStats() {
  fs.writeFileSync(statsFile, JSON.stringify(systemStats, null, 2), 'utf8');
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
    quota: systemStats
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

app.get('/api/stream-audio', async (req, res) => {
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
      return res.status(429).json({ error: 'Bu hafta bu IP adresinden zaten bir parça gönderildi.', days: ipLimit.days, hours: ipLimit.hours });
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

    const fileName = date + ' - ' + cleanStr(fullName) + ' - ' + cleanStr(trackName) + '.mp3';
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
    res.status(500).json({ error: err.message || 'Bir hata oluştu.' });
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
app.post('/api/staff/verify', verifyStaffToken, (req, res) => {
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
    submissions: submissionsData,
    accounts: staffCredentials.map(u => ({ username: u.username, role: u.role }))
  });
});

app.post('/api/admin/update-status', verifyStaffToken, (req, res) => {
  const { id, status, publishDate } = req.body;
  const item = submissionsData.find(s => s.id === id);
  if (!item) return res.status(404).json({ error: 'Parça bulunamadı.' });
  item.status = status;
  if (publishDate) item.publishDate = publishDate;
  if (status === 'published' && !item.publishDate) item.publishDate = new Date().toISOString();
  saveSubmissionsData();
  res.json({ success: true });
});

app.post('/api/admin/reset-user', verifyStaffToken, (req, res) => {
  const { targetEmail } = req.body;
  const emailLower = targetEmail.toLowerCase();
  submissionsData = submissionsData.filter(s => s.email.toLowerCase() !== emailLower);
  saveSubmissionsData();
  res.json({ success: true });
});

// Legacy Google-token based reset (kept for backwards compat)
app.get('/reset-submissions', (req, res) => {
  const secret = req.query.secret;
  const adminSecret = process.env.ADMIN_SECRET || 'mais-studio-reset-secret-2026';
  if (secret === adminSecret) {
    submissionsData = [];
    saveSubmissionsData();
    return res.send('Tüm başvuru limitleri ve kayıtları başarıyla sıfırlandı!');
  }
  return res.status(403).send('Yetkisiz erişim.');
});

// Google OAuth flow (for Drive auth setup)
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
      res.send(`<html><body style="font-family:sans-serif;background:#080706;color:#f5f4f2;padding:40px;text-align:center;"><h1 style="color:#fbbf24;">Yetkilendirme Başarılı!</h1><p>Refresh Token:</p><textarea style="width:100%;max-width:600px;height:80px;background:#12100e;color:#fbbf24;border:1px solid #333;border-radius:8px;padding:10px;font-family:monospace;" readonly>${tokens.refresh_token}</textarea></body></html>`);
    } else {
      res.send('refresh_token dönmedi.');
    }
  } catch (err) {
    res.status(500).send('Hata: ' + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
