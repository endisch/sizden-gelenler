const fs = require('fs');

let file = fs.readFileSync('generate_index.js', 'utf8');

// Update fetchConfig to handle specialConfig
file = file.replace(/function fetchConfig\(\) \{([\s\S]*?)function loadGoogleClient\(\) \{/, `function fetchConfig() {
    fetch('/config').then(function(r){return r.json()}).then(function(data) {
      systemStats = data.quota || { maxQuota:200, usedQuota:0 };
      updateQuotaUI();
      if(data.setupRequired) {
        openModal('setup-modal');
        setupRequired = true;
      }
      if (data.specialConfig) {
        if (data.specialConfig.active) {
          document.getElementById('special-concept-btn').style.display = 'flex';
          document.getElementById('special-btn-txt').textContent = data.specialConfig.title || 'Özel Konsept';
          document.getElementById('sm-title').textContent = data.specialConfig.title || 'Özel Konsept';
        } else {
          document.getElementById('special-concept-btn').style.display = 'none';
        }
      }
    });
  }

  function loadGoogleClient() {`);

// Inject the JS functions for special modal before </script>
const newJS = `

  // ── SPECIAL MODAL LOGIC ──
  let spToken = null, spFile = null, spConsent = false, spResetQuota = false;
  function openSpecialModal() {
    spToken = null; spFile = null; spConsent = false;
    document.getElementById('sp-chk').classList.remove('active');
    document.getElementById('sp-email-ok').style.display = 'none';
    document.getElementById('err-special').style.display = 'none';
    document.getElementById('sp-fullName').value = '';
    document.getElementById('sp-social').value = '';
    document.getElementById('sp-aiTool').value = '';
    document.getElementById('sp-trackName').value = '';
    document.getElementById('sp-note').value = '';
    document.getElementById('sp-note-count').textContent = '0 / 210';
    document.getElementById('sp-file-name').textContent = '';
    
    openModal('special-modal');

    if(window.google && google.accounts) {
      google.accounts.id.renderButton(
        document.getElementById("gsi-special-btn"),
        { theme: "outline", size: "large", width: 280, text: "continue_with" }
      );
    }
  }

  function handleCredentialResponseSpecial(response) {
    document.getElementById('sp-gsi-loading').style.display = 'block';
    spToken = response.credential;
    try {
      const base64Url = spToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); }).join(''));
      const payload = JSON.parse(jsonPayload);
      document.getElementById('sp-email-val').textContent = payload.email;
      document.getElementById('sp-email-ok').style.display = 'block';
      document.getElementById('sp-gsi-loading').style.display = 'none';
    } catch(e) {
      document.getElementById('sp-gsi-loading').style.display = 'none';
    }
  }

  const oldCallback = window.handleCredentialResponse;
  window.handleCredentialResponse = function(response) {
    if (document.getElementById('special-modal').style.display === 'flex') {
      handleCredentialResponseSpecial(response);
    } else {
      if (oldCallback) oldCallback(response);
    }
  };

  function toggleConsentSp() {
    spConsent = !spConsent;
    if(spConsent) document.getElementById('sp-chk').classList.add('active');
    else document.getElementById('sp-chk').classList.remove('active');
  }

  function handleFileSp(input) {
    if(input.files && input.files[0]) {
      if(!input.files[0].name.endsWith('.mp3') && input.files[0].type !== 'audio/mpeg') {
        alert('Sadece MP3 dosyası kabul edilir.');
        return;
      }
      if(input.files[0].size > 20*1024*1024) {
        alert('Dosya boyutu 20MB\\'den büyük olamaz.');
        return;
      }
      spFile = input.files[0];
      document.getElementById('sp-file-name').textContent = spFile.name;
      document.getElementById('sp-upload-zone').style.borderColor = 'var(--gold)';
    }
  }

  function updateCharCountSp(el) {
    document.getElementById('sp-note-count').textContent = el.value.length + ' / 210';
  }

  async function submitSpecialForm() {
    const err = document.getElementById('err-special');
    err.style.display = 'none';
    
    if(!spToken) { err.textContent = 'Google hesabı doğrulaması zorunludur.'; err.style.display='block'; return; }
    const fullName = document.getElementById('sp-fullName').value.trim();
    const social = document.getElementById('sp-social').value.trim();
    const aiTool = document.getElementById('sp-aiTool').value.trim();
    const trackName = document.getElementById('sp-trackName').value.trim();
    const note = document.getElementById('sp-note').value.trim();

    if(!fullName || !social || !aiTool || !trackName || !note) { err.textContent = 'Lütfen tüm alanları doldurun.'; err.style.display='block'; return; }
    if(note.length > 210) { err.textContent = 'Parça notu 210 karakteri aşamaz.'; err.style.display='block'; return; }
    if(!spFile) { err.textContent = 'Lütfen MP3 dosyasını seçin.'; err.style.display='block'; return; }
    if(!spConsent) { err.textContent = 'Telif hakkı beyanını onaylamalısınız.'; err.style.display='block'; return; }

    const btn = document.getElementById('btn-submit-special');
    btn.disabled = true; btn.textContent = 'Gönderiliyor...';

    const formData = new FormData();
    formData.append('token', spToken);
    formData.append('fullName', fullName);
    formData.append('social', social);
    formData.append('aiTool', aiTool);
    formData.append('trackName', trackName);
    formData.append('note', note);
    formData.append('consent', 'true');
    formData.append('mp3', spFile);

    try {
      const res = await fetch('/submit-special', { method: 'POST', body: formData });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'Gönderim başarısız.');
      
      closeModal('special-modal');
      openModal('success-modal');
    } catch(e) {
      err.textContent = e.message;
      err.style.display = 'block';
    } finally {
      btn.disabled = false; btn.textContent = 'Gönder';
    }
  }

  function toggleResetQuota() {
    spResetQuota = !spResetQuota;
    if(spResetQuota) document.getElementById('cfg-reset-chk').classList.add('active');
    else document.getElementById('cfg-reset-chk').classList.remove('active');
  }

  async function saveSpecialConfig() {
    const active = document.getElementById('cfg-active').value === 'true';
    const title = document.getElementById('cfg-title').value.trim();
    const maxQuota = document.getElementById('cfg-quota').value;
    
    try {
      const res = await fetch('/api/admin/save-special-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + staffToken },
        body: JSON.stringify({ active: active, title: title, maxQuota: maxQuota, resetQuota: spResetQuota })
      });
      const data = await res.json();
      if(!res.ok) { alert(data.error); return; }
      
      document.getElementById('cfg-msg').style.display = 'block';
      setTimeout(function(){ document.getElementById('cfg-msg').style.display='none'; }, 3000);
      spResetQuota = false;
      document.getElementById('cfg-reset-chk').classList.remove('active');
      fetchConfig();
    } catch(e) {
      alert(e.message);
    }
  }

  async function updateSpecialStatus(id, status) {
    if(!confirm('Bu işlemin yapıldığını onaylıyor musunuz?')) return;
    try {
      const res = await fetch('/api/admin/update-special-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + staffToken },
        body: JSON.stringify({ id: id, status: status })
      });
      if(!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      loadPanelData();
    } catch(e) {
      alert(e.message);
    }
  }

`;

file = file.replace(/<\/script>/, newJS + '\n</script>');

// Rewrite loadPanelData safely
file = file.replace(/app\.get\('\\\/api\\\/admin\\\/submissions'/g, `app.get('/api/admin/submissions'`);

const loadPanelReplacement = `
  async function loadPanelData() {
    try {
      const res = await fetch('/api/admin/submissions', { headers: { 'Authorization': 'Bearer '+staffToken }});
      if(res.status === 401 || res.status === 403) { logout(); return; }
      const data = await res.json();

      const ab = document.getElementById('accounts-body');
      ab.innerHTML = '';
      if(data.accounts && data.accounts.length > 0) {
        data.accounts.forEach(function(acc) {
          let act = acc.role !== 'owner' && staffRole === 'owner' ? '<button class="action-btn red" onclick="deleteAccount(\\'' + acc.username + '\\')">Sil</button>' : '-';
          let role = acc.role === 'owner' ? 'Kurucu' : 'Çalışan';
          ab.innerHTML += '<tr><td>' + acc.username + '</td><td>' + role + '</td><td style="text-align:right;">' + act + '</td></tr>';
        });
      } else {
        ab.innerHTML = '<tr><td colspan="3" class="empty-state">Hesap bulunamadı.</td></tr>';
      }

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
      let iC=0, rC=0;
      data.submissions.forEach(function(s) {
        let link = '<a href="https://drive.google.com/file/d/' + s.fileId + '/view" target="_blank" style="color:var(--gold);text-decoration:none;font-weight:600;">' + s.trackName + '</a>';
        let action = s.status === 'pending'
          ? '<button class="action-btn" onclick="updateStatus(\\'' + s.id + '\\',\\'reviewed\\')">İncelendi</button>'
          : '<button class="action-btn red" onclick="updateStatus(\\'' + s.id + '\\',\\'pending\\')">Geri Al</button>';
        
        let info = '<div style="font-size:0.85rem;margin-bottom:4px;">' + link + ' <span style="color:var(--txt2);font-size:0.7rem;margin-left:6px;">' + new Date(s.timestamp).toLocaleDateString() + '</span></div>' +
                      '<div style="font-size:0.75rem;color:var(--txt2);">' + s.fullName + ' · ' + s.aiTool + '</div>' +
                      '<div style="font-size:0.75rem;color:var(--txt2);margin-top:2px;">' + s.email + '</div>' +
                      '<div style="font-size:0.75rem;color:var(--txt3);margin-top:6px;padding:6px;background:#151515;border-radius:6px;border:1px dashed var(--border2);">' + s.note + '</div>';

        if(s.status === 'pending') {
          ib.innerHTML += '<tr><td>' + info + '</td><td style="text-align:right;vertical-align:middle;">' + action + '</td></tr>';
          iC++;
        } else {
          rb.innerHTML += '<tr><td>' + info + '</td><td style="text-align:right;vertical-align:middle;">' + action + '</td></tr>';
          rC++;
        }
      });
      if(iC===0) ib.innerHTML = '<tr><td colspan="2" class="empty-state">Yeni parça yok.</td></tr>';
      if(rC===0) rb.innerHTML = '<tr><td colspan="2" class="empty-state">İncelenmiş parça yok.</td></tr>';

      const spb = document.getElementById('special-body');
      spb.innerHTML = '';
      if(data.specialSubmissions && data.specialSubmissions.length > 0) {
        data.specialSubmissions.forEach(function(s) {
          let link = '<a href="https://drive.google.com/file/d/' + s.fileId + '/view" target="_blank" style="color:var(--gold);text-decoration:none;font-weight:600;">' + s.trackName + '</a>';
          let action = s.status === 'pending'
            ? '<button class="action-btn" onclick="updateSpecialStatus(\\'' + s.id + '\\',\\'reviewed\\')">İncelendi</button>'
            : '<button class="action-btn red" onclick="updateSpecialStatus(\\'' + s.id + '\\',\\'pending\\')">Geri Al</button>';
          
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
  }`;

file = file.replace(/async function loadPanelData\(\) \{[\s\S]*?async function addAccount/, loadPanelReplacement + '\n\n  async function addAccount');

fs.writeFileSync('generate_index.js', file);
console.log('Successfully patched generate_index.js');
