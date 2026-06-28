const fs = require('fs');
let file = fs.readFileSync('generate_index.js', 'utf8');

// 1. Update Audio Bar HTML
const newAudioBar = `
  <!-- ═══ GLOBAL AUDIO BAR ══════════════════════════════════════════════ -->
  <div id="audio-bar">
    <div class="ab-art" id="ab-art">🎵</div>
    <div class="ab-info">
      <div class="ab-title" id="ab-title">—</div>
      <div class="ab-artist" id="ab-artist">—</div>
      <div class="ab-tag" id="ab-tag"></div>
    </div>
    <div class="ab-controls">
      <button class="ab-btn" onclick="playPrev()" title="Önceki Şarkı">⏮</button>
      <button class="ab-btn" onclick="skipAudio(-10)" title="10 Saniye Geri">⏪</button>
      <button class="ab-play" id="ab-play" onclick="togglePlay()" style="margin: 0 10px;">▶</button>
      <button class="ab-btn" onclick="skipAudio(10)" title="10 Saniye İleri">⏩</button>
      <button class="ab-btn" onclick="playNext()" title="Sonraki Şarkı">⏭</button>
      <div class="ab-seek-row" style="margin-left: 14px;">
        <span class="ab-time" id="ab-cur">0:00</span>
        <input type="range" class="ab-seek" id="ab-seek" min="0" max="100" value="0" oninput="seek(this.value)" />
        <span class="ab-dur" id="ab-dur">0:00</span>
      </div>
    </div>
    <button class="ab-close" onclick="closePlayer()">×</button>
  </div>`;

file = file.replace(/<!-- ═══ GLOBAL AUDIO BAR[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, newAudioBar);

// 2. Add Audio logic JS
const newAudioJS = `
    // ── AUDIO PLAYER LOGIC ──
    const playerEl = document.createElement('audio');
    let currentPlaylist = [];
    let currentIndex = -1;

    function playTrackById(fileId, title, artist, aiTool) {
      document.getElementById('ab-title').textContent = title;
      document.getElementById('ab-artist').textContent = artist;
      document.getElementById('ab-tag').textContent = aiTool;
      playerEl.src = '/api/stream-audio?fileId=' + fileId;
      playerEl.load();
      playerEl.play().then(function() {
        document.getElementById('ab-play').textContent = '⏸';
        document.getElementById('audio-bar').classList.add('visible');
      }).catch(function() { alert('Ses dosyası oynatılamadı. Google Drive izni eksik olabilir.'); });
    }

    function togglePlay() {
      if (playerEl.paused) { playerEl.play(); document.getElementById('ab-play').textContent = '⏸'; }
      else { playerEl.pause(); document.getElementById('ab-play').textContent = '▶'; }
    }

    function seek(val) {
      if (playerEl.duration) playerEl.currentTime = (val / 100) * playerEl.duration;
    }

    function skipAudio(seconds) {
      if (playerEl.duration) playerEl.currentTime += seconds;
    }

    function closePlayer() {
      playerEl.pause();
      document.getElementById('audio-bar').classList.remove('visible');
    }

    function fmtTime(s) {
      const m = Math.floor(s / 60), sec = Math.floor(s % 60);
      return m + ':' + String(sec).padStart(2, '0');
    }

    playerEl.addEventListener('timeupdate', function() {
      if (playerEl.duration) {
        document.getElementById('ab-seek').value = (playerEl.currentTime / playerEl.duration) * 100;
        document.getElementById('ab-cur').textContent = fmtTime(playerEl.currentTime);
        document.getElementById('ab-dur').textContent = fmtTime(playerEl.duration);
      }
    });
    playerEl.addEventListener('ended', function() {
      document.getElementById('ab-play').textContent = '▶';
      playNext(); // Auto-play next song
    });

    let currentInboxList = [], currentReviewedList = [], currentSpecialList = [];

    function playFromList(listType, index) {
      let list = [];
      if (listType === 'inbox') list = currentInboxList;
      else if (listType === 'reviewed') list = currentReviewedList;
      else if (listType === 'special') list = currentSpecialList;

      if (list.length > 0 && list[index]) {
        currentPlaylist = list;
        currentIndex = index;
        const track = list[index];
        playTrackById(track.fileId, track.trackName, track.fullName, track.aiTool);
      }
    }

    function playNext() {
      if (currentPlaylist.length > 0 && currentIndex < currentPlaylist.length - 1) {
        currentIndex++;
        const track = currentPlaylist[currentIndex];
        playTrackById(track.fileId, track.trackName, track.fullName, track.aiTool);
      }
    }

    function playPrev() {
      if (currentPlaylist.length > 0 && currentIndex > 0) {
        currentIndex--;
        const track = currentPlaylist[currentIndex];
        playTrackById(track.fileId, track.trackName, track.fullName, track.aiTool);
      }
    }
`;

file = file.replace(/\/\/ ── AUDIO PLAYER LOGIC ──[\s\S]*?\/\/ ═══ MISC ═══/, newAudioJS + '\n\n    // ═══ MISC ═══');

// 3. Update loadPanelData to populate the global lists and use playFromList instead of drive links
const oldLoadPanelDataPattern = /const ib = document\.getElementById\('inbox-body'\);[\s\S]*?console\.error\(e\);\s*\}\s*\}/;

const newLoadPanelDataSnippet = `
      const ib = document.getElementById('inbox-body');
      const rb = document.getElementById('reviewed-body');
      ib.innerHTML = ''; rb.innerHTML = '';
      currentInboxList = []; currentReviewedList = [];
      data.submissions.forEach(function(s) {
        if(s.status === 'pending') currentInboxList.push(s);
        else currentReviewedList.push(s);
      });

      if (currentInboxList.length === 0) ib.innerHTML = '<tr><td colspan="2" class="empty-state">Yeni parça yok.</td></tr>';
      else {
        currentInboxList.forEach(function(s, idx) {
          let link = '<a href="#" onclick="playFromList(\\'inbox\\', ' + idx + '); return false;" style="color:var(--gold);text-decoration:none;font-weight:600;">' + s.trackName + ' <span style="font-size:0.7rem; color:var(--txt3);">▶ Dinle</span></a>';
          let action = '<button class="action-btn" onclick="updateStatus(\\'' + s.id + '\\',\\'reviewed\\')">İncelendi</button>';
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
          let link = '<a href="#" onclick="playFromList(\\'reviewed\\', ' + idx + '); return false;" style="color:var(--gold);text-decoration:none;font-weight:600;">' + s.trackName + ' <span style="font-size:0.7rem; color:var(--txt3);">▶ Dinle</span></a>';
          let action = '<button class="action-btn red" onclick="updateStatus(\\'' + s.id + '\\',\\'pending\\')">Geri Al</button>';
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
          let link = '<a href="#" onclick="playFromList(\\'special\\', ' + idx + '); return false;" style="color:var(--gold);text-decoration:none;font-weight:600;">' + s.trackName + ' <span style="font-size:0.7rem; color:var(--txt3);">▶ Dinle</span></a>';
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
  }
`;

file = file.replace(oldLoadPanelDataPattern, newLoadPanelDataSnippet);

// 4. Add CSS for new buttons
const cssPattern = /\.ab-play \{/;
const cssReplacement = `.ab-btn { background: none; border: none; color: var(--txt2); font-size: 1rem; cursor: pointer; transition: 0.2s; }
    .ab-btn:hover { color: var(--gold); transform: scale(1.1); }
    .ab-play {`;
file = file.replace(cssPattern, cssReplacement);

fs.writeFileSync('generate_index.js', file);
console.log("Audio player updated.");
