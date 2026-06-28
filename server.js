require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const submissions = {};

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const oauthClient = googleClientId ? new OAuth2Client(googleClientId) : null;

async function verifyGoogleToken(token) {
  if (!oauthClient) {
    throw new Error('Google Client ID configuration is missing on the server.');
  }
  const ticket = await oauthClient.verifyIdToken({
    idToken: token,
    audience: googleClientId,
  });
  return ticket.getPayload();
}

// Ensure local uploads directory exists
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

async function uploadToDrive(filePath, fileName, mimeType = 'audio/mpeg') {
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
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
      console.log(`Ownership transferred to: ${ownerEmail}`);
    } catch (e) {
      console.log('Ownership transfer skipped or failed:', e.message);
    }
  }
  return fileId;
}

function checkRateLimit(email) {
  const last = submissions[email];
  if (!last) return { allowed: true };
  const diff = Date.now() - last;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (diff < sevenDays) {
    const remaining = sevenDays - diff;
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { allowed: false, days, hours };
  }
  return { allowed: true };
}

app.post('/submit', upload.single('mp3'), async (req, res) => {
  let tempTxtPath = null;
  try {
    const { token, fullName, social, aiTool, trackName, note, consent } = req.body;
    if (!token || !fullName || !social || !aiTool || !trackName || !note || !consent) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'MP3 dosyası yüklenmedi.' });
    }
    
    // Verify token and extract email
    const payload = await verifyGoogleToken(token);
    const email = payload.email.toLowerCase();
    
    const limit = checkRateLimit(email);
    if (!limit.allowed) {
      fs.unlinkSync(req.file.path);
      return res.status(429).json({ error: 'Bu hafta zaten bir parça gönderdin.', days: limit.days, hours: limit.hours });
    }
    
    const date = new Date().toISOString().slice(0, 10);
    const safeName = (str) => str.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g, '').replace(/\s+/g, '_');
    const baseName = `${date}_${safeName(fullName)}_${safeName(trackName)}`;
    const fileName = `${baseName}.mp3`;
    const txtFileName = `${baseName}.txt`;
    
    // Upload MP3
    await uploadToDrive(req.file.path, fileName, 'audio/mpeg');
    
    // Create companion text file with metadata
    const txtFilePath = path.join(uploadDir, txtFileName);
    tempTxtPath = txtFilePath;
    
    const txtContent = `Gönderen: ${fullName}
E-posta: ${email}
Sosyal Medya: ${social}
Yapay Zeka Aracı: ${aiTool}
Parça Adı: ${trackName}
Tarih: ${date}

Parça Notu:
${note}
`;
    fs.writeFileSync(txtFilePath, txtContent, 'utf8');
    
    // Upload companion text file
    await uploadToDrive(txtFilePath, txtFileName, 'text/plain');
    
    // Clean up local temp files
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (fs.existsSync(txtFilePath)) {
      fs.unlinkSync(txtFilePath);
    }
    
    submissions[email] = Date.now();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (tempTxtPath && fs.existsSync(tempTxtPath)) {
      fs.unlinkSync(tempTxtPath);
    }
    res.status(500).json({ error: err.message || 'Bir hata oluştu, lütfen tekrar dene.' });
  }
});

app.post('/check-limit', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token zorunludur.' });
  try {
    const payload = await verifyGoogleToken(token);
    const email = payload.email.toLowerCase();
    const limit = checkRateLimit(email);
    res.json({ ...limit, email, name: payload.name });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Google kimlik doğrulaması başarısız: ' + err.message });
  }
});

app.get('/config', (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || '' });
});

app.get('/auth', (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `https://${req.headers.host}/oauth2callback`
  );
  
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive'],
    prompt: 'consent'
  });
  
  res.redirect(authorizeUrl);
});

app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.send('Auth code missing');
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `https://${req.headers.host}/oauth2callback`
    );
    const { tokens } = await oauth2Client.getToken(code);
    
    if (tokens.refresh_token) {
      res.send(`
        <html>
          <body style="font-family:sans-serif; background:#080706; color:#f5f4f2; padding:40px; text-align:center;">
            <h1 style="color:#f5c518;">Google Yetkilendirme Başarılı!</h1>
            <p>Lütfen bu Refresh Token değerini kopyalayıp Railway üzerinde <b>GOOGLE_REFRESH_TOKEN</b> olarak tanımlayın:</p>
            <textarea style="width:100%; max-width:600px; height:80px; background:#12100e; color:#fbbf24; border:1px solid #5e5c58; border-radius:8px; padding:10px; font-family:monospace; font-size:1rem;" readonly>${tokens.refresh_token}</textarea>
            <p style="margin-top:20px; color:#a3a19d;">Ayrıca Railway'de <b>GOOGLE_CLIENT_SECRET</b> değerini de girdiğinizden emin olun.</p>
          </body>
        </html>
      `);
    } else {
      res.send('Kimlik doğrulama başarılı fakat refresh_token dönmedi. Lütfen tekrar /auth sayfasına gidip deneyin.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Kod çevrim hatası: ' + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
