const fs = require('fs');

let html = fs.readFileSync('generate_index.js', 'utf8');

// 1. Modify HTML structure
// Change `<div class="modal-overlay" id="panel-modal">` and `<div class="modal-box">`
// to `<div id="admin-dashboard" class="admin-dashboard" style="display:none;">`
html = html.replace(
  '<div class="modal-overlay" id="panel-modal">\n    <div class="modal-box">',
  '<div id="admin-dashboard" class="admin-dashboard" style="display:none;">'
);

// We need to replace the two closing `</div>` tags for panel-modal.
// Since it's right before `<!-- ═══ SUCCESS MODAL`, we can target that.
html = html.replace(
  '      </div>\n    </div>\n  </div>\n\n\n\n  <!-- ═══ SUCCESS MODAL',
  '      </div>\n  </div>\n\n\n\n  <!-- ═══ SUCCESS MODAL'
);

// Remove the close modal button `×` in the header
html = html.replace('<button class="modal-close" onclick="closeModal(\\\'panel-modal\\\')">×</button>', '');

// Update logout button onclick
html = html.replace('onclick="clearStaff(); closeModal(\\\'panel-modal\\\')"', 'onclick="clearStaff()"');

// Update openModal('panel-modal') to showAdminDashboard()
html = html.replace(/openModal\('panel-modal'\)/g, 'showAdminDashboard()');

// Update logout() function
html = html.replace('function logout() { clearStaff(); closeModal(\'panel-modal\'); }', 'function logout() { clearStaff(); }');


// 2. Add new CSS for .admin-dashboard
const newCss = `
    .admin-dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px 100px 20px;
      animation: fadeUp 0.3s ease;
    }
    .admin-dashboard .modal-header { border-bottom:1px solid var(--border); padding-bottom:15px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; }
    .admin-dashboard .modal-title { font-size:1.3rem; font-weight:600; color:#fff; display:flex; align-items:center; }
    .admin-dashboard .tab-bar { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; }
    .admin-dashboard .table-wrap { overflow-x:auto; background:var(--bg2); border:1px solid var(--border); border-radius:12px; }
    .admin-dashboard .data-table th, .admin-dashboard .data-table td { padding:14px 16px; font-size:0.9rem; }
    .admin-dashboard .pane-desc { font-size:0.85rem; color:var(--txt2); margin-bottom:15px; }
`;

html = html.replace('</style>', newCss + '\n  </style>');

// 3. Add JS functions for showing/hiding dashboard
const jsFunctions = `
    function showAdminDashboard() {
      document.querySelector('.wrap').style.display = 'none';
      document.getElementById('admin-dashboard').style.display = 'block';
    }
    function hideAdminDashboard() {
      document.querySelector('.wrap').style.display = 'block';
      document.getElementById('admin-dashboard').style.display = 'none';
    }
`;

html = html.replace('function openModal(id)', jsFunctions + '\n    function openModal(id)');

// Also call hideAdminDashboard in clearStaff
html = html.replace('btn.classList.remove(\\\'active\\\');', 'btn.classList.remove(\\\'active\\\');\n      hideAdminDashboard();');

fs.writeFileSync('generate_index.js', html, 'utf8');
console.log('Done modifying generate_index.js');
