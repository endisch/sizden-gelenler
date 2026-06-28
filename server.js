const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.originalname.endsWith('.mp3')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece MP3 dosyası kabul edilmektedir.'));
    }
  }
});

// Load persistences
const staffFile = path.join(__dirname, 'staff_list.json');
let staffList = [];
if (fs.existsSync(staffFile)) {
  try { staffList = JSON.parse(fs.readFileSync(staffFile, 'utf8')); } catch(e) {}
}
function saveStaffList() {
  fs.writeFileSync(staffFile, JSON.stringify(staffList, null, 2), 'utf8');
}

const submissionsFile = path.join(__dirname, 'submissions_data.json');
let submissionsData = [];
if (fs.existsSync(submissionsFile)) {
  try { submissionsData = JSON.parse(fs.readFileSync(submissionsFile, 'utf8')); } catch(e) {}
}
function saveSubmissionsData() {
  fs.writeFileSync(submissionsFile, JSON.stringify(submissionsData, null, 2), 'utf8');
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

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
    requestBody: {
      name: fileName,
      parents: [folderId],
      description: description
    },
    media: {
      mimeType: mimeType,
      body: fs.createReadStream(filePath),
    },
    fields: 'id',
  });
  
  const fileId = response.data.id;
  const ownerEmail = process.env.DRIVE_OWNER_EMAIL;
  if (ownerEmail) {
    try {
      await drive.permissions.create({
        fileId,
        transferOwnership: true,
        requestBody: {
          role: 'owner',
          type: 'user',
          emailAddress: ownerEmail,
        },
      });
    } catch (e) {}
  }
  return fileId;
}

function isAuthorizedStaff(email) {
  const superAdmin = (process.env.DRIVE_OWNER_EMAIL || 'endischoffical@gmail.com').toLowerCase();
  const checkEmail = email.toLowerCase();
  return checkEmail === superAdmin || staffList.includes(checkEmail);
}

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

// REST endpoints
app.get('/api/playlist', (req, res) => {
  const published = submissionsData.filter(s => s.status === 'published').map(s => ({
    id: s.id,
    title: s.trackName,
    artist: s.fullName,
    aiTool: s.aiTool,
    audioUrl: '/api/stream-audio?fileId=' + s.fileId
  }));
  res.json(published);
});

app.get('/api/stream-audio', async (req, res) => {
  const { fileId } = req.query;
  if (!fileId) return res.status(400).send('File ID missing');
  try {
    const drive = getDriveClient();
    const file = await drive.files.get({
      fileId: fileId,
      alt: 'media'
    }, {
      responseType: 'stream'
    });
    res.setHeader('Content-Type', 'audio/mpeg');
    file.data.pipe(res);
  } catch (err) {
    res.status(500).send('Error streaming audio');
  }
});

app.post('/submit', upload.single('mp3'), async (req, res) => {
  try {
    const { token, fullName, social, aiTool, trackName, note, consent } = req.body;
    if (!token || !fullName || !social || !aiTool || !trackName || !note || !consent) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'MP3 dosyası yüklenmedi.' });
    }
    const payload = await verifyGoogleToken(token);
    const email = payload.email.toLowerCase();
    
    const limit = checkRateLimit(email);
    if (!limit.allowed) {
      fs.unlinkSync(req.file.path);
      return res.status(429).json({ error: 'Bu hafta zaten bir parça gönderdiniz.', days: limit.days, hours: limit.hours });
    }
    
    const date = new Date().toISOString().slice(0, 10);
    const cleanStr = (str) => {
      return str
        .replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s-]/g, '')
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };
    
    const formattedFullName = cleanStr(fullName);
    const formattedTrackName = cleanStr(trackName);
    const fileName = date + ' - ' + formattedFullName + ' - ' + formattedTrackName + '.mp3';
    const description = 'Gönderen: ' + fullName + '\nE-posta: ' + email + '\nSosyal Medya: ' + social + '\nYapay Zeka Aracı: ' + aiTool + '\nParça Adı: ' + trackName + '\nTarih: ' + date + '\n\nParça Notu:\n' + note;

    const fileId = await uploadToDrive(req.file.path, fileName, 'audio/mpeg', description);
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    // Add to submission_data
    submissionsData.push({
      id: Date.now().toString(),
      fullName,
      email,
      social,
      aiTool,
      trackName,
      note,
      fileId,
      timestamp: new Date().toISOString(),
      status: 'pending' // requires review
    });
    saveSubmissionsData();
    
    res.json({ success: true });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message || 'Bir hata oluştu.' });
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

app.get('/config', (req, res) => {
  res.json({ 
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    adminEmail: process.env.DRIVE_OWNER_EMAIL || 'endischoffical@gmail.com',
    staffList: staffList
  });
});

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
      res.send('<html><body style="font-family:sans-serif; background:#080706; color:#f5f4f2; padding:40px; text-align:center;"><h1 style="color:#f5c518;">Google Yetkilendirme Başarılı!</h1><p>Lütfen bu Refresh Token değerini kopyalayıp Railway üzerinde <b>GOOGLE_REFRESH_TOKEN</b> olarak tanımlayın:</p><textarea style="width:100%; max-width:600px; height:80px; background:#12100e; color:#fbbf24; border:1px solid #5e5c58; border-radius:8px; padding:10px; font-family:monospace; font-size:1rem;" readonly>' + tokens.refresh_token + '</textarea><p style="margin-top:20px; color:#a3a19d;">Ayrıca Railway' + "'" + 'de <b>GOOGLE_CLIENT_SECRET</b> değerini de girdiğinizden emin olun.</p></body></html>');
    } else {
      res.send('Kimlik doğrulama başarılı fakat refresh_token dönmedi.');
    }
  } catch (err) {
    res.status(500).send('Kod çevrim hatası: ' + err.message);
  }
});

// Admin management APIs
app.post('/api/admin/submissions', async (req, res) => {
  const { token } = req.body;
  try {
    const payload = await verifyGoogleToken(token);
    if (!isAuthorizedStaff(payload.email)) {
      return res.status(403).json({ error: 'Yetkisiz erişim.' });
    }
    res.json({ submissions: submissionsData, staffList });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.post('/api/admin/update-status', async (req, res) => {
  const { token, id, status } = req.body;
  try {
    const payload = await verifyGoogleToken(token);
    if (!isAuthorizedStaff(payload.email)) {
      return res.status(403).json({ error: 'Yetkisiz erişim.' });
    }
    const item = submissionsData.find(s => s.id === id);
    if (item) {
      item.status = status;
      saveSubmissionsData();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.post('/api/admin/reset-user', async (req, res) => {
  const { token, targetEmail } = req.body;
  try {
    const payload = await verifyGoogleToken(token);
    if (!isAuthorizedStaff(payload.email)) {
      return res.status(403).json({ error: 'Yetkisiz erişim.' });
    }
    const emailLower = targetEmail.toLowerCase();
    submissionsData = submissionsData.filter(s => s.email.toLowerCase() !== emailLower);
    saveSubmissionsData();
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.post('/api/admin/add-staff', async (req, res) => {
  const { token, targetEmail } = req.body;
  try {
    const payload = await verifyGoogleToken(token);
    const superAdmin = (process.env.DRIVE_OWNER_EMAIL || 'endischoffical@gmail.com').toLowerCase();
    if (payload.email.toLowerCase() !== superAdmin) {
      return res.status(403).json({ error: 'Yalnızca kurucu yönetici stüdyo çalışanı ekleyebilir.' });
    }
    const emailLower = targetEmail.toLowerCase().trim();
    if (emailLower && !staffList.includes(emailLower)) {
      staffList.push(emailLower);
      saveStaffList();
    }
    res.json({ success: true, staffList });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.post('/api/admin/remove-staff', async (req, res) => {
  const { token, targetEmail } = req.body;
  try {
    const payload = await verifyGoogleToken(token);
    const superAdmin = (process.env.DRIVE_OWNER_EMAIL || 'endischoffical@gmail.com').toLowerCase();
    if (payload.email.toLowerCase() !== superAdmin) {
      return res.status(403).json({ error: 'Yalnızca kurucu yönetici stüdyo çalışanı kaldırabilir.' });
    }
    const emailLower = targetEmail.toLowerCase().trim();
    staffList = staffList.filter(e => e !== emailLower);
    saveStaffList();
    res.json({ success: true, staffList });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
