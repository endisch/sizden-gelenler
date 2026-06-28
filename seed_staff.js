// seed_staff.js — Creates staff_credentials.json with pre-hashed passwords
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const credFile = path.join(__dirname, 'staff_credentials.json');

const accounts = [
  { username: 'thendisch',   password: '30212711qq', role: 'owner' },
  { username: 'mustafaince', password: 'mstfince123', role: 'owner' },
  { username: 'maisstudio',  password: 'mais123',     role: 'staff' },
];

(async () => {
  const hashed = [];
  for (const acc of accounts) {
    const passwordHash = await bcrypt.hash(acc.password, 12);
    hashed.push({ username: acc.username, passwordHash, role: acc.role });
    console.log(`✓ ${acc.username} (${acc.role}) hashed`);
  }
  fs.writeFileSync(credFile, JSON.stringify(hashed, null, 2), 'utf8');
  console.log('\nstaff_credentials.json yazıldı:', credFile);
})();
