const fs = require('fs');

let f = fs.readFileSync('generate_index.js', 'utf8');

// Normalize line endings for matching
f = f.replace(/\r\n/g, '\n');

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 1: Add special + settings tab buttons in tab-bar
// ═══════════════════════════════════════════════════════════════════════════
const p1old = `<button class="tab-btn" onclick="switchTab('accounts')">👤 Hesaplar</button>\n        </div>`;
const p1new = `<button class="tab-btn" onclick="switchTab('accounts')">👤 Hesaplar</button>\n          <button class="tab-btn" id="special-tab-btn" onclick="switchTab('special')" style="display:none;">🌟 Özel Gelenler</button>\n          <button class="tab-btn" id="settings-tab-btn" onclick="switchTab('settings')" style="display:none;">⚙️ Sistem Ayarları</button>\n        </div>`;

if (f.includes(p1old)) { f = f.replace(p1old, p1new); console.log('PATCH 1 OK'); }
else console.log('PATCH 1 FAIL');

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 2: Add special + settings tab panes after accounts tab
// ═══════════════════════════════════════════════════════════════════════════
const p2old = `<div id="pw-change-ok" style="display:none; color:#4ade80; font-size:0.78rem; margin-top:8px;">✓ Şifre başarıyla güncellendi.</div>\n          </div>\n        </div>\n\n      </div>\n    </div>\n  </div>`;
const p2new = `<div id="pw-change-ok" style="display:none; color:#4ade80; font-size:0.78rem; margin-top:8px;">✓ Şifre başarıyla güncellendi.</div>
          </div>
        </div>

        <!-- SPECIAL -->
        <div class="tab-pane" id="tab-special">
          <p class="pane-desc">Özel bölümden gelen parçalar. Normal gelen kutusundan ayrıdır.</p>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Parça / Sanatçı</th><th style="text-align:right;">İşlem</th></tr></thead>
              <tbody id="special-body"><tr><td colspan="2" class="empty-state">Yükleniyor...</td></tr></tbody>
            </table>
          </div>
        </div>

        <!-- SETTINGS -->
        <div class="tab-pane" id="tab-settings">
          <p class="pane-desc">Özel bölüm ayarları. Sadece kurucu (owner) görebilir.</p>
          <div style="display:flex; flex-direction:column; gap:14px; margin-top:10px;">
            <div class="panel-input-row">
              <label style="font-size:0.78rem; color:var(--txt2); min-width:100px;">Durum:</label>
              <select class="panel-input" id="cfg-active" style="max-width:140px;">
                <option value="true">Açık</option>
                <option value="false">Kapalı</option>
              </select>
            </div>
            <div class="panel-input-row">
              <label style="font-size:0.78rem; color:var(--txt2); min-width:100px;">Başlık:</label>
              <input type="text" class="panel-input" id="cfg-title" placeholder="Özel Konsept" />
            </div>
            <div class="panel-input-row">
              <label style="font-size:0.78rem; color:var(--txt2); min-width:100px;">Max Kota:</label>
              <input type="number" class="panel-input" id="cfg-quota" value="50" style="max-width:100px;" />
            </div>
            <div style="display:flex; gap:10px; margin-top:6px;">
              <button class="panel-btn" onclick="saveSpecialCfg()">💾 Kaydet</button>
              <button class="panel-btn" style="background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.3);color:#f87171;" onclick="resetSpecialQuota()">🔄 Kotayı Sıfırla</button>
            </div>
            <div id="cfg-msg" style="display:none; font-size:0.78rem; color:#4ade80; margin-top:6px;">✓ Ayarlar kaydedildi.</div>
          </div>
        </div>

      </div>
    </div>
  </div>`;

if (f.includes(p2old)) { f = f.replace(p2old, p2new); console.log('PATCH 2 OK'); }
else console.log('PATCH 2 FAIL');

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 3: Upgrade audio-bar with prev/next/skip buttons
// ═══════════════════════════════════════════════════════════════════════════
const p3old = `<div class="ab-controls">\n      <button class="ab-play" id="ab-play" onclick="togglePlay()">▶</button>\n      <div class="ab-seek-row">`;
const p3new = `<div class="ab-controls">\n      <div class="ab-btns-row">\n        <button class="ab-btn" onclick="skipBackward()" title="10s Geri">⏪</button>\n        <button class="ab-btn" onclick="prevTrack()" title="Önceki Parça">⏮</button>\n        <button class="ab-play" id="ab-play" onclick="togglePlay()">▶</button>\n        <button class="ab-btn" onclick="nextTrack()" title="Sonraki Parça">⏭</button>\n        <button class="ab-btn" onclick="skipForward()" title="10s İleri">⏩</button>\n      </div>\n      <div class="ab-seek-row">`;

if (f.includes(p3old)) { f = f.replace(p3old, p3new); console.log('PATCH 3 OK'); }
else console.log('PATCH 3 FAIL');

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 4: Add CSS for new audio buttons
// ═══════════════════════════════════════════════════════════════════════════
const p4old = `    .ab-close:hover { color: var(--txt); }\n  </style>`;
const p4new = `    .ab-close:hover { color: var(--txt); }\n    .ab-btns-row { display: flex; align-items: center; gap: 8px; }\n    .ab-btn { background: none; border: none; color: var(--txt2); font-size: 1.1rem; cursor: pointer; padding: 4px; transition: all 0.15s ease; border-radius: 50%; }\n    .ab-btn:hover { color: var(--gold); transform: scale(1.15); }\n    @media (max-width: 600px) {\n      #audio-bar { flex-wrap: wrap; padding: 10px 14px; gap: 10px; }\n      .ab-controls { max-width: 100%; flex: unset; width: 100%; }\n      .ab-info { flex: 1; }\n    }\n  </style>`;

if (f.includes(p4old)) { f = f.replace(p4old, p4new); console.log('PATCH 4 OK'); }
else console.log('PATCH 4 FAIL');

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 5: Add ALL missing JS functions (before PLAYLIST MODAL section)
// ═══════════════════════════════════════════════════════════════════════════
const pm = '    // ═══ PLAYLIST MODAL ══════════════════════════════════════════════════════';
const mf = `    // ═══ MISSING FUNCTION DEFINITIONS (AUTO-PATCHED) ════════════════════════
    let currentInboxList = [];
    let currentReviewedList = [];
    let currentSpecialList = [];

    function esc(str) {
      if (!str) return '';
      return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function fmt(dateStr) {
      if (!dateStr) return '';
      try { return new Date(dateStr).toLocaleDateString('tr-TR'); } catch(e) { return dateStr; }
    }

    function switchTab(name) {
      document.querySelectorAll('.tab-pane').forEach(function(p) { p.classList.remove('active'); });
      document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      var pane = document.getElementById('tab-' + name);
      if (pane) pane.classList.add('active');
      var keywords = { inbox: 'gelen', reviewed: 'incelen', limits: 'bekleme', accounts: 'hesap', special: 'özel', settings: 'ayar' };
      var kw = keywords[name] || '---';
      document.querySelectorAll('.tab-btn').forEach(function(b) {
        if (b.textContent.toLowerCase().indexOf(kw) !== -1) b.classList.add('active');
      });
    }

    function logout() { clearStaff(); closeModal('panel-modal'); }

    async function updateStatus(id, status) {
      try { await authFetch('/api/admin/update-status', { id: id, status: status }); loadPanelData(); }
      catch(e) { alert(e.message); }
    }

    async function updateSpecialStatus(id, status) {
      try { await authFetch('/api/admin/update-special-status', { id: id, status: status }); loadPanelData(); }
      catch(e) { alert(e.message); }
    }

    async function deleteAccount(username) {
      if (!confirm(username + ' hesabini silmek istediginize emin misiniz?')) return;
      try {
        var data = await authFetch('/api/staff/remove-account', { username: username });
        if (data.error) { alert(data.error); return; }
        loadPanelData();
      } catch(e) { alert(e.message); }
    }

    async function saveSpecialCfg() {
      try {
        var active = document.getElementById('cfg-active').value === 'true';
        var title = document.getElementById('cfg-title').value;
        var maxQuota = document.getElementById('cfg-quota').value;
        await authFetch('/api/admin/save-special-config', { active: active, title: title, maxQuota: maxQuota });
        var msg = document.getElementById('cfg-msg');
        msg.textContent = '\\u2713 Ayarlar kaydedildi.';
        msg.style.display = 'block';
        setTimeout(function() { msg.style.display = 'none'; }, 3000);
      } catch(e) { alert(e.message); }
    }

    async function resetSpecialQuota() {
      if (!confirm('Ozel bolum kotasini sifirlamak istediginize emin misiniz?')) return;
      try {
        await authFetch('/api/admin/save-special-config', { resetQuota: true });
        var msg = document.getElementById('cfg-msg');
        msg.textContent = '\\u2713 Kota sifirlandi.';
        msg.style.display = 'block';
        setTimeout(function() { msg.style.display = 'none'; }, 3000);
      } catch(e) { alert(e.message); }
    }

    function renderAccounts() { loadPanelData(); }

    // ═══ PLAYLIST QUEUE & ADVANCED AUDIO ═════════════════════════════════════
    var playlist = [];
    var playlistIndex = -1;

    function playFromList(listName, idx) {
      var srcList = listName === 'inbox' ? currentInboxList : listName === 'reviewed' ? currentReviewedList : currentSpecialList;
      playlist = srcList.map(function(s) {
        return { audioUrl: '/api/stream-audio?fileId=' + s.fileId, title: s.trackName, artist: s.fullName || '\\u2014', aiTool: s.aiTool || '' };
      });
      playlistIndex = idx;
      playCurrent();
    }

    function playCurrent() {
      if (playlistIndex < 0 || playlistIndex >= playlist.length) return;
      var track = playlist[playlistIndex];
      playTrack(track.audioUrl, track.title, track.artist, track.aiTool);
    }

    function nextTrack() {
      if (playlistIndex + 1 < playlist.length) { playlistIndex++; playCurrent(); }
    }

    function prevTrack() {
      if (playerEl.currentTime > 3) { playerEl.currentTime = 0; return; }
      if (playlistIndex > 0) { playlistIndex--; playCurrent(); }
    }

    function skipForward() {
      if (playerEl.duration) playerEl.currentTime = Math.min(playerEl.duration, playerEl.currentTime + 10);
    }

    function skipBackward() {
      playerEl.currentTime = Math.max(0, playerEl.currentTime - 10);
    }

    ` + pm;

if (f.includes(pm)) { f = f.replace(pm, mf); console.log('PATCH 5 OK'); }
else console.log('PATCH 5 FAIL');

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 6: Fix ended event for auto-next
// ═══════════════════════════════════════════════════════════════════════════
const p6old = "playerEl.addEventListener('ended', () => { document.getElementById('ab-play').textContent = '▶'; });";
const p6new = "playerEl.addEventListener('ended', function() { if (playlistIndex + 1 < playlist.length) { nextTrack(); } else { document.getElementById('ab-play').textContent = '\\u25b6'; } });";

if (f.includes(p6old)) { f = f.replace(p6old, p6new); console.log('PATCH 6 OK'); }
else console.log('PATCH 6 FAIL');

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 7: Show special-tab-btn for all staff in loadPanelData
// ═══════════════════════════════════════════════════════════════════════════
const p7old = `      if (staffRole === 'owner') {\n        document.getElementById('settings-tab-btn').style.display = 'inline-block';`;
const p7new = `      document.getElementById('special-tab-btn').style.display = 'inline-block';\n      if (staffRole === 'owner') {\n        document.getElementById('settings-tab-btn').style.display = 'inline-block';`;

if (f.includes(p7old)) { f = f.replace(p7old, p7new); console.log('PATCH 7 OK'); }
else console.log('PATCH 7 FAIL');

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 8: Fix currentInboxList reassignment 
// ═══════════════════════════════════════════════════════════════════════════
if (f.includes('currentInboxList = []; currentReviewedList = [];')) {
  f = f.replace('currentInboxList = []; currentReviewedList = [];', 'currentInboxList.length = 0; currentReviewedList.length = 0;');
  console.log('PATCH 8 OK');
} else console.log('PATCH 8 SKIP');

// Restore Windows line endings
f = f.replace(/\n/g, '\r\n');

fs.writeFileSync('generate_index.js', f, 'utf8');
console.log('\\n=== ALL PATCHES COMPLETE ===');
