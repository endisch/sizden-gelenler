const cp = require('child_process');
const fs = require('fs');
try {
  const oldHtml = cp.execSync('git show 7244b92:public/index.html').toString();
  const match = oldHtml.match(/src="(data:image\/jpeg;base64,[^"]+)"\s+alt="Mustafa/);
  if (match) {
    // Write out the base64 part
    const b64Data = match[1].replace(/^data:image\/jpeg;base64,/, '');
    fs.writeFileSync('public/host.jpg', Buffer.from(b64Data, 'base64'));
    console.log('Saved host.jpg');
  } else {
    console.log('No match found');
  }
} catch (e) {
  console.log('Error:', e.message);
}
