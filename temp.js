
    // ═══ STATE ═══════════════════════════════════════════════════════════════
    let googleToken = '';
    let consentChecked = false;
    let googleClientId = '';
    let gsiReady = false;
    let staffToken = localStorage.getItem('staff_token') || '';
    let staffUsername = localStorage.getItem('staff_username') || '';
    let staffRole = localStorage.getItem('staff_role') || '';

    // ═══ INIT ════════════════════════════════════════════════════════════════
    (async function init() {
      try {
        const cfg = await fetch('/config').then(r => r.json());
        googleClientId = cfg.googleClientId;
        
        // Quota
        if (cfg.quota) {
          const remain = Math.max(0, cfg.quota.maxQuota - cfg.quota.usedQuota);
          const txt = remain + ' / ' + cfg.quota.maxQuota;
          document.getElementById('main-quota').textContent = txt;
          document.getElementById('welcome-quota-val').textContent = txt;
        }

        if (!staffToken) {
          setTimeout(() => openModal('welcome-overlay'), 300);
        }

      } catch(e) {
        showErr('err-email', 'Sunucu bağlantısı kurulamadı.');
        return;
      }

      // Verify staff session
      if (staffToken) {
        try {
          const vr = await authFetch('/api/staff/verify', null);
          if (vr.valid) {
            setStaffLoggedIn(vr.username, staffRole);
          } else {
            clearStaff();
          }
        } catch(e) { clearStaff(); }
      }

      // Start GSI polling
      startGSI();
    })();

    // ═══ GSI (Google Sign-In) ════════════════════════════════════════════════
    function startGSI() {
      if (tryGSI()) return;
      let n = 0;
      const iv = setInterval(() => {
        n++;
        if (tryGSI()) {
          clearInterval(iv);
        } else if (n > 80) {
          clearInterval(iv);
          if (!googleClientId) {
            showErr('err-email', 'Sistem Hatası: Google Client ID ayarlanmamış.');
          } else {
            showErr('err-email', 'Google Sign-in yüklenemedi. Adblocker kullanıyorsanız devre dışı bırakın.');
          }
        }
      }, 200);
    }

    function tryGSI() {
      if (gsiReady) return true;
      if (!googleClientId || typeof google === 'undefined' || !google.accounts) return false;
      gsiReady = true;
      try {
        google.accounts.id.initialize({ client_id: googleClientId, callback: onGoogleLogin });
        google.accounts.id.renderButton(
          document.getElementById('gsi-btn'),
          { theme: 'filled_black', size: 'large', width: 280, locale: 'tr' }
        );
        return true;
      } catch (e) {
        console.error("GSI render error:", e);
        return false;
      }
    }

    function onGoogleLogin(resp) {
      googleToken = resp.credential;
      document.getElementById('gsi-loading').style.display = 'block';
      document.getElementById('gsi-btn').style.opacity = '0.5';
      document.getElementById('gsi-btn').style.pointerEvents = 'none';
      fetch('/check-limit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken })
      })
      .then(r => r.json())
      .then(data => {
        document.getElementById('gsi-loading').style.display = 'none';
        document.getElementById('gsi-btn').style.opacity = '1';
        document.getElementById('gsi-btn').style.pointerEvents = 'auto';
        if (data.error) { showErr('err-email', data.error); return; }
        if (!data.allowed) {
          document.getElementById('countdown').textContent = data.days + ' gün ' + data.hours + ' saat kaldı';
          showStep('step-blocked');
        } else {
          if (data.name) document.getElementById('fullName').value = data.name;
          showStep('step-form');
        }
      })
      .catch(() => { showErr('err-email', 'Bağlantı hatası.'); });
    }

    // ═══ STEP NAVIGATION ════════════════════════════════════════════════════
    function showStep(id) {
      document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      const map = { 'step-email': 0, 'step-form': 1 };
      const cur = map[id] ?? -1;
      ['email', 'form'].forEach((name, i) => {
        const d = document.getElementById('dot-' + name);
        if (!d) return;
        d.classList.remove('active', 'done');
        if (i < cur) d.classList.add('done');
        else if (i === cur) d.classList.add('active');
      });
      if (id === 'step-blocked') document.getElementById('dots').style.display = 'none';
      else document.getElementById('dots').style.display = 'flex';
    }

    function goBack() { googleToken = ''; showStep('step-email'); }
    function showErr(id, msg) { const e = document.getElementById(id); e.textContent = msg; e.style.display = 'block'; }
    function hideErr(id) { document.getElementById(id).style.display = 'none'; }

    // ═══ UPLOAD / FORM ══════════════════════════════════════════════════════
    function handleFile(input) {
      const file = input.files[0];
      if (!file) return;
      if (file.size > 20 * 1024 * 1024) { showErr('err-form', 'Dosya 20 MB sınırını aşıyor.'); input.value = ''; return; }
      hideErr('err-form');
      document.getElementById('file-name').textContent = '✓ ' + file.name;
      document.getElementById('upload-zone').style.borderColor = 'var(--gold)';
    }

    const uz = document.getElementById('upload-zone');
    uz.addEventListener('dragover', e => { e.preventDefault(); uz.classList.add('over'); });
    uz.addEventListener('dragleave', () => uz.classList.remove('over'));
    uz.addEventListener('drop', e => {
      e.preventDefault(); uz.classList.remove('over');
      const f = e.dataTransfer.files[0];
      if (f) { document.getElementById('mp3file').files = e.dataTransfer.files; handleFile(document.getElementById('mp3file')); }
    });

    function toggleConsent() {
      consentChecked = !consentChecked;
      document.getElementById('chk').classList.toggle('checked', consentChecked);
    }

    function updateCharCount(el) {
      const len = el.value.length;
      const countEl = document.getElementById('note-count');
      countEl.textContent = len + ' / 210';
      if (len >= 200) countEl.classList.add('warn');
      else countEl.classList.remove('warn');
    }

    async function submitForm() {
      const fullName = document.getElementById('fullName').value.trim();
      const social = document.getElementById('social').value.trim();
      const aiTool = document.getElementById('aiTool').value;
      const trackName = document.getElementById('trackName').value.trim();
      const note = document.getElementById('note').value.trim();
      const mp3 = document.getElementById('mp3file').files[0];
      hideErr('err-form');

      if (!fullName || !social || !aiTool || !trackName || !note) return showErr('err-form', 'Lütfen tüm alanları doldurun.');
      if (note.length < 30) return showErr('err-form', 'Parça notu en az 30 karakter olmalıdır.');
      if (note.length > 210) return showErr('err-form', 'Parça notu en fazla 210 karakter olabilir.');
      if (!mp3) return showErr('err-form', 'Lütfen bir MP3 dosyası seçin.');
      if (!consentChecked) return showErr('err-form', 'Gönderim koşullarını onaylamanız gerekmektedir.');

      const btn = document.getElementById('btn-submit');
      btn.disabled = true;
      btn.innerHTML = '<span class="spin"></span>Gönderiliyor...';

      const fd = new FormData();
      fd.append('token', googleToken);
      fd.append('fullName', fullName);
      fd.append('social', social);
      fd.append('aiTool', aiTool);
      fd.append('trackName', trackName);
      fd.append('note', note);
      fd.append('consent', 'true');
      fd.append('mp3', mp3);

      try {
        const res = await fetch('/submit', { method: 'POST', body: fd });
        const data = await res.json();
        
        if (res.status === 403) {
          showErr('err-form', data.error);
          return;
        }
        if (res.status === 429) {
          document.getElementById('countdown').textContent = data.days + ' gün ' + data.hours + ' saat kaldı';
          showStep('step-blocked'); return;
        }
        if (!res.ok) { showErr('err-form', data.error || 'Bir hata oluştu.'); return; }
        
        // Reset form completely
        document.getElementById('fullName').value = '';
        document.getElementById('social').value = '';
        document.getElementById('aiTool').value = '';
        document.getElementById('trackName').value = '';
        document.getElementById('note').value = '';
        document.getElementById('note-count').textContent = '0 / 210';
        document.getElementById('mp3file').value = '';
        document.getElementById('file-name').textContent = '';
        document.getElementById('upload-zone').style.borderColor = 'var(--border2)';
        if(consentChecked) toggleConsent();
        
        // Update quota visually
        fetch('/config').then(r=>r.json()).then(cfg => {
          if (cfg.quota) {
            const remain = Math.max(0, cfg.quota.maxQuota - cfg.quota.usedQuota);
            document.getElementById('main-quota').textContent = remain + ' / ' + cfg.quota.maxQuota;
          }
        });

        openModal('success-modal');
      } catch(e) { showErr('err-form', 'Bağlantı hatası. Tekrar deneyin.'); }
      finally { btn.disabled = false; btn.textContent = 'Başvuruyu Tamamla'; }
    }

    // ═══ MODAL HELPERS ══════════════════════════════════════════════════════
    function openModal(id) { document.getElementById(id).classList.add('open'); }
    function closeModal(id) { document.getElementById(id).classList.remove('open'); }

    // ═══ STAFF AUTH ══════════════════════════════════════════════════════════
    function handleStaffBtnClick() {
      if (staffToken) {
        openPanelModal();
      } else {
        document.getElementById('login-err').style.display = 'none';
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        openModal('login-modal');
        setTimeout(() => document.getElementById('login-username').focus(), 100);
      }
    }

    async function doLogin() {
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      const btn = document.getElementById('login-btn');
      const err = document.getElementById('login-err');
      err.style.display = 'none';
      if (!username || !password) { err.textContent = 'Kullanıcı adı ve şifre gereklidir.'; err.style.display = 'block'; return; }
      btn.disabled = true; btn.textContent = 'Giriş yapılıyor...';
      try {
        const res = await fetch('/api/staff/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) { err.textContent = data.error || 'Giriş başarısız.'; err.style.display = 'block'; return; }
        staffToken = data.token;
        staffUsername = data.username;
        staffRole = data.role;
        localStorage.setItem('staff_token', staffToken);
        localStorage.setItem('staff_username', staffUsername);
        localStorage.setItem('staff_role', staffRole);
        setStaffLoggedIn(staffUsername, staffRole);
        closeModal('login-modal');
        openPanelModal();
      } catch(e) { err.textContent = 'Bağlantı hatası.'; err.style.display = 'block'; }
      finally { btn.disabled = false; btn.textContent = 'Giriş Yap'; }
    }

    function setStaffLoggedIn(username, role) {
      const btn = document.getElementById('staff-btn');
      btn.textContent = '⚙️ ' + username;
      btn.classList.add('active');
      document.getElementById('playlist-btn').style.display = 'flex';
    }

    function clearStaff() {
      staffToken = ''; staffUsername = ''; staffRole = '';
      localStorage.removeItem('staff_token');
      localStorage.removeItem('staff_username');
      localStorage.removeItem('staff_role');
      const btn = document.getElementById('staff-btn');
      btn.textContent = '🔑 Yetkili Girişi';
      btn.classList.remove('active');
      document.getElementById('playlist-btn').style.display = 'none';
    }

    // ═══ STAFF PANEL ═════════════════════════════════════════════════════════
    async function authFetch(url, body) {
      const res = await fetch(url, {
        method: body !== null ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + staffToken },
        body: body !== null ? JSON.stringify(body) : undefined
      });
      if (res.status === 401) { clearStaff(); throw new Error('Oturum sona erdi. Lütfen tekrar giriş yapın.'); }
      return res.json();
    }

    function openPanelModal() {
      document.getElementById('panel-username').textContent = staffUsername + (staffRole === 'owner' ? ' (Kurucu)' : '');
      document.getElementById('accounts-owner-section').style.display = staffRole === 'owner' ? 'block' : 'none';
      openModal('panel-modal');
      loadPanelData();
    }

    let panelData = { submissions: [], accounts: [] };

    
  async function loadPanelData() {
    try {
      const res = await fetch('/api/admin/submissions', { headers: { 'Authorization': 'Bearer '+staffToken }});
      if(res.status === 401 || res.status === 403) { logout(); return; }
      const data = await res.json();

      const ab = document.getElementById('accounts-body');
      ab.innerHTML = '';
      if(data.accounts && data.accounts.length > 0) {
        data.accounts.forEach(function(acc) {
          let act = acc.role !== 'owner' && staffRole === 'owner' ? '<button class="action-btn red" onclick="deleteAccount('' + acc.username + '')">Sil</button>' : '-';
          let role = acc.role === 'owner' ? 'Kurucu' : 'Çalışan';
          ab.innerHTML += '<tr><td>' + acc.username + '</td><td>' + role + '</td><td style="text-align:right;">' + act + '</td></tr>';
        });
      } else {
        ab.innerHTML = '<tr><td colspan="3" class="empty-state">Hesap bulunamadı.</td></tr>';
      }

      document.getElementById('special-tab-btn').style.display = 'inline-block';
      if (staffRole === 'owner') {
        document.getElementById('settings-tab-btn').style.display = 'inline-block';
        if (data.specialConfig) {
          document.getElementById('cfg-active').value = data.specialConfig.active ? 'true' : 'false';
          document.getElementById('cfg-title').value = data.specialConfig.title || '';
          document.getElementById('cfg-quota').value = data.specialConfig.maxQuota || 50;
        }
      }

      
      const ib = document.getElementById('inbox-body');
      const rb = document.getElementById('reviewed-body');
      ib.innerHTML = ''; rb.innerHTML = '';
      currentInboxList.length = 0; currentReviewedList.length = 0;
      data.submissions.forEach(function(s) {
        if(s.status === 'pending') currentInboxList.push(s);
        else currentReviewedList.push(s);
      });

      if (currentInboxList.length === 0) ib.innerHTML = '<tr><td colspan="2" class="empty-state">Yeni parça yok.</td></tr>';
      else {
        currentInboxList.forEach(function(s, idx) {
          let link = '<a href="#" onclick="playFromList('inbox', ' + idx + '); return false;" style="color:var(--gold);text-decoration:none;font-weight:600;">' + s.trackName + ' <span style="font-size:0.7rem; color:var(--txt3);">▶ Dinle</span></a>';
          let action = '<button class="action-btn" onclick="updateStatus('' + s.id + '','reviewed')">İncelendi</button>';
          let info = '<div style="font-size:0.85rem;margin-bottom:4px;">' + link + ' <span style="color:var(--txt2);font-size:0.7rem;margin-left:6px;">' + new Date(s.timestamp).toLocaleDateString() + '</span></div>' +
                      '<div style="font-size:0.75rem;color:var(--txt2);">' + s.fullName + ' · ' + s.aiTool + '</div>' +
                      '<div style="font-size:0.75rem;color:var(--txt2);margin-top:2px;">' + s.email + '</div>' +
                      '<div style="font-size:0.75rem;color:var(--txt3);margin-top:6px;padding:6px;background:#151515;border-radius:6px;border:1px dashed var(--border2);">' + s.note + '</div>';
          ib.innerHTML += '<tr><td>' + info + '</td><td style="text-align:right;vertical-align:middle;">' + action + '</td></tr>';
        });
      }

      if (currentReviewedList.length === 0) rb.innerHTML = '<tr><td colspan="2" class="empty-state">İncelenmiş parça yok.</td></tr>';
      else {
        currentReviewedList.forEach(function(s, idx) {
          let link = '<a href="#" onclick="playFromList('reviewed', ' + idx + '); return false;" style="color:var(--gold);text-decoration:none;font-weight:600;">' + s.trackName + ' <span style="font-size:0.7rem; color:var(--txt3);">▶ Dinle</span></a>';
          let action = '<button class="action-btn red" onclick="updateStatus('' + s.id + '','pending')">Geri Al</button>';
          let info = '<div style="font-size:0.85rem;margin-bottom:4px;">' + link + ' <span style="color:var(--txt2);font-size:0.7rem;margin-left:6px;">' + new Date(s.timestamp).toLocaleDateString() + '</span></div>' +
                      '<div style="font-size:0.75rem;color:var(--txt2);">' + s.fullName + ' · ' + s.aiTool + '</div>' +
                      '<div style="font-size:0.75rem;color:var(--txt2);margin-top:2px;">' + s.email + '</div>' +
                      '<div style="font-size:0.75rem;color:var(--txt3);margin-top:6px;padding:6px;background:#151515;border-radius:6px;border:1px dashed var(--border2);">' + s.note + '</div>';
          rb.innerHTML += '<tr><td>' + info + '</td><td style="text-align:right;vertical-align:middle;">' + action + '</td></tr>';
        });
      }

      const spb = document.getElementById('special-body');
      spb.innerHTML = '';
      currentSpecialList = data.specialSubmissions || [];
      if(currentSpecialList.length > 0) {
        currentSpecialList.forEach(function(s, idx) {
          let link = '<a href="#" onclick="playFromList('special', ' + idx + '); return false;" style="color:var(--gold);text-decoration:none;font-weight:600;">' + s.trackName + ' <span style="font-size:0.7rem; color:var(--txt3);">▶ Dinle</span></a>';
          let action = s.status === 'pending'
            ? '<button class="action-btn" onclick="updateSpecialStatus('' + s.id + '','reviewed')">İncelendi</button>'
            : '<button class="action-btn red" onclick="updateSpecialStatus('' + s.id + '','pending')">Geri Al</button>';
          
          let info = '<div style="font-size:0.85rem;margin-bottom:4px;">' + link + ' <span style="color:var(--txt2);font-size:0.7rem;margin-left:6px;">' + new Date(s.timestamp).toLocaleDateString() + '</span></div>' +
                        '<div style="font-size:0.75rem;color:var(--txt2);">' + s.fullName + ' · ' + s.aiTool + '</div>' +
                        '<div style="font-size:0.75rem;color:var(--txt2);margin-top:2px;">' + s.email + '</div>' +
                        '<div style="font-size:0.75rem;color:var(--gold);margin-top:6px;padding:6px;background:rgba(251,191,36,0.05);border-radius:6px;border:1px dashed rgba(251,191,36,0.3);">' + s.note + '</div>';

          spb.innerHTML += '<tr><td>' + info + '</td><td style="text-align:right;vertical-align:middle;">' + action + '</td></tr>';
        });
      } else {
        spb.innerHTML = '<tr><td colspan="2" class="empty-state">Özel bölümde gönderilmiş parça yok.</td></tr>';
      }

    } catch(e) {
      console.error(e);
    }
  }


  async function addAccount() {
      const username = document.getElementById('new-username').value.trim();
      const password = document.getElementById('new-password').value;
      if (!username || !password) { alert('Kullanıcı adı ve şifre gereklidir.'); return; }
      try {
        const data = await authFetch('/api/staff/add-account', { username, password });
        if (data.error) { alert(data.error); return; }
        panelData.accounts = data.accounts;
        document.getElementById('new-username').value = '';
        document.getElementById('new-password').value = '';
        renderAccounts();
      } catch(e) { alert(e.message); }
    }

    async function removeAccount(username) {
      if (!confirm(username + ' hesabını kaldırmak istediğinize emin misiniz?')) return;
      try {
        const data = await authFetch('/api/staff/remove-account', { username });
        if (data.error) { alert(data.error); return; }
        panelData.accounts = data.accounts;
        renderAccounts();
      } catch(e) { alert(e.message); }
    }

    async function changePassword() {
      const cur = document.getElementById('cur-pw').value;
      const nw = document.getElementById('new-pw').value;
      const err = document.getElementById('pw-change-err');
      const ok = document.getElementById('pw-change-ok');
      err.style.display = 'none'; ok.style.display = 'none';
      if (!cur || !nw) { err.textContent = 'Her iki alanı da doldurun.'; err.style.display = 'block'; return; }
      try {
        const data = await authFetch('/api/staff/change-password', { currentPassword: cur, newPassword: nw });
        if (data.error) { err.textContent = data.error; err.style.display = 'block'; return; }
        ok.style.display = 'block';
        document.getElementById('cur-pw').value = '';
        document.getElementById('new-pw').value = '';
      } catch(e) { err.textContent = e.message; err.style.display = 'block'; }
    }

    // ═══ MISSING FUNCTION DEFINITIONS (AUTO-PATCHED) ════════════════════════
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
        msg.textContent = '✓ Ayarlar kaydedildi.';
        msg.style.display = 'block';
        setTimeout(function() { msg.style.display = 'none'; }, 3000);
      } catch(e) { alert(e.message); }
    }

    async function resetSpecialQuota() {
      if (!confirm('Ozel bolum kotasini sifirlamak istediginize emin misiniz?')) return;
      try {
        await authFetch('/api/admin/save-special-config', { resetQuota: true });
        var msg = document.getElementById('cfg-msg');
        msg.textContent = '✓ Kota sifirlandi.';
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
        return { audioUrl: '/api/stream-audio?fileId=' + s.fileId, title: s.trackName, artist: s.fullName || '—', aiTool: s.aiTool || '' };
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

        // ═══ PLAYLIST MODAL ══════════════════════════════════════════════════════
    async function openPlaylistModal() {
      openModal('playlist-modal');
      const container = document.getElementById('playlist-container');
      container.innerHTML = '<div class="empty-state">Yükleniyor...</div>';
      try {
        const tracks = await authFetch('/api/playlist', null);
        if (!tracks.length) { container.innerHTML = '<div class="empty-state">Arşivde incelenmiş parça bulunmuyor.</div>'; return; }
        container.innerHTML = tracks.map((t, i) => `
          <div class="playlist-item" onclick="playTrack('${esc(t.audioUrl)}','${esc(t.title)}','${esc(t.artist)}','${esc(t.aiTool)}')">
            <div class="pl-num">${i+1}</div>
            <div class="pl-info">
              <div class="pl-title">${esc(t.title)}</div>
              <div class="pl-artist">${esc(t.artist)} · <span style="color:var(--gold);">${esc(t.aiTool)}</span></div>
            </div>
            <div style="font-size:0.7rem; color:var(--txt3); margin-right:6px;">${fmt(t.publishDate)}</div>
            <div class="pl-play">▶</div>
          </div>
        `).join('');
      } catch(e) { container.innerHTML = '<div class="empty-state">Playlist yüklenemedi. Yetkinizi kontrol edin.</div>'; }
    }

    // ═══ AUDIO PLAYER ════════════════════════════════════════════════════════
    const playerEl = document.getElementById('player');

    function playTrack(url, title, artist, aiTool) {
      document.getElementById('ab-title').textContent = title;
      document.getElementById('ab-artist').textContent = artist;
      document.getElementById('ab-tag').textContent = aiTool;
      playerEl.src = url;
      playerEl.load();
      playerEl.play().then(() => {
        document.getElementById('ab-play').textContent = '⏸';
        document.getElementById('audio-bar').classList.add('visible');
      }).catch(() => alert('Ses dosyası oynatılamadı.'));
    }

    function playTrackById(fileId, title, artist, aiTool) {
      playTrack('/api/stream-audio?fileId=' + fileId, title, artist, aiTool);
    }

    function togglePlay() {
      if (playerEl.paused) { playerEl.play(); document.getElementById('ab-play').textContent = '⏸'; }
      else { playerEl.pause(); document.getElementById('ab-play').textContent = '▶'; }
    }

    function seek(val) {
      if (playerEl.duration) playerEl.currentTime = (val / 100) * playerEl.duration;
    }

    function closePlayer() {
      playerEl.pause();
      document.getElementById('audio-bar').classList.remove('visible');
    }

    function fmtTime(s) {
      const m = Math.floor(s / 60), sec = Math.floor(s % 60);
      return m + ':' + String(sec).padStart(2, '0');
    }

    playerEl.addEventListener('timeupdate', () => {
      if (playerEl.duration) {
        document.getElementById('ab-seek').value = (playerEl.currentTime / playerEl.duration) * 100;
        document.getElementById('ab-cur').textContent = fmtTime(playerEl.currentTime);
        document.getElementById('ab-dur').textContent = fmtTime(playerEl.duration);
      }
    });
    playerEl.addEventListener('ended', function() { if (playlistIndex + 1 < playlist.length) { nextTrack(); } else { document.getElementById('ab-play').textContent = '▶'; } });

    // ═══ MISC ════════════════════════════════════════════════════════════════
    function togglePw(inputId, btn) {
      const input = document.getElementById(inputId);
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁' : '🙈';
    }

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay && overlay.id !== 'welcome-overlay') overlay.classList.remove('open');
      });
    });
  