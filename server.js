require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const submissions = {};

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
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
}

async function uploadToDrive(filePath, fileName) {
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: 'audio/mpeg',
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
  try {
    const { fullName, email, social, aiTool, trackName, note, consent } = req.body;
    if (!fullName || !email || !social || !aiTool || !trackName || !note || !consent) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'MP3 dosyası yüklenmedi.' });
    }
    
    const limit = checkRateLimit(email.toLowerCase());
    if (!limit.allowed) {
      fs.unlinkSync(req.file.path);
      return res.status(429).json({ error: 'Bu hafta zaten bir parça gönderdin.', days: limit.days, hours: limit.hours });
    }
    
    const date = new Date().toISOString().slice(0, 10);
    const safeName = (str) => str.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g, '').replace(/\s+/g, '_');
    const fileName = `${date}_${safeName(fullName)}_${safeName(trackName)}.mp3`;
    
    await uploadToDrive(req.file.path, fileName);
    
    // Clean up local temp file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    submissions[email.toLowerCase()] = Date.now();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message || 'Bir hata oluştu, lütfen tekrar dene.' });
  }
});

app.post('/check-limit', (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ allowed: true });
  const limit = checkRateLimit(email.toLowerCase());
  res.json(limit);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
