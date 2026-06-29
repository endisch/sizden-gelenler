const fs = require('fs');

let html = fs.readFileSync('generate_index.js', 'utf8');

// Replace opening tags
html = html.replace(
  /<div class="modal-overlay" id="panel-modal">\s*<div class="modal-box">/g,
  '<div id="admin-dashboard" class="admin-dashboard" style="display:none;">'
);

// We need to replace the two closing `</div>` tags before SUCCESS MODAL
// The structure was:
//       </div>
//     </div>
//   </div>
//   <!-- ═══ SUCCESS MODAL
html = html.replace(
  /      <\/div>\s*<\/div>\s*<\/div>\s*<!-- ═══ SUCCESS MODAL/g,
  '      </div>\n  </div>\n\n\n\n  <!-- ═══ SUCCESS MODAL'
);

// Remove the close modal button
html = html.replace(/<button class="modal-close" onclick="closeModal\('panel-modal'\)">×<\/button>/g, '');

// Update logout button
html = html.replace(/onclick="clearStaff\(\); closeModal\('panel-modal'\)"/g, 'onclick="clearStaff()"');

fs.writeFileSync('generate_index.js', html, 'utf8');
console.log('Done HTML fixes');
