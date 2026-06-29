const fs = require('fs');
const c = fs.readFileSync('generate_index.js', 'utf8');
const lines = c.split('\n');
const s = lines.findIndex(l => l.includes('id="panel-modal"'));
if (s !== -1) {
  for(let i=Math.max(0, s-5); i<Math.min(lines.length, s+150); i++) {
    console.log((i+1) + ': ' + lines[i]);
  }
}
