const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, 'public', 'index.html');

const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sizden Gelenler — Mustafa İnce</title>
  <script src="https://accounts.google.com/gsi/client" async defer><\/script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #080706;
      --card: #0f0e0c;
      --border: #1e1c17;
      --border2: #2a271f;
      --txt: #f5f4f2;
      --txt2: #9e9b96;
      --txt3: #5e5b55;
      --gold: #fbbf24;
      --gold2: #f59e0b;
      --glow: rgba(251,191,36,0.06);
      --font: 'Plus Jakarta Sans', system-ui, sans-serif;
      --radius: 16px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--txt);  font-family: var(--font); min-height: 100vh; padding: 24px 20px 80px; display: flex; flex-direction: column; align-items: center;  position: relative; }
    body::before {
      content: ''; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      
      background-image: 
        linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(8, 7, 6, 0.75), rgba(8, 7, 6, 0.98)), 
        url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop');
      background-size: 40px 40px, 40px 40px, cover, cover;

      background-size: cover; background-position: center; background-attachment: fixed;
      z-index: -1; pointer-events: none;
    }

    /* ── NAVBAR ── */
    .navbar {
      width: 100%; max-width: 960px; display: flex; align-items: center; justify-content: space-between;
      padding: 0 4px; margin-bottom: 24px;
    }
    .navbar-brand { font-size: 0.72rem; font-weight: 800; color: var(--txt3); letter-spacing: 0.18em; text-transform: uppercase; }
    .navbar-actions { display: flex; align-items: center; gap: 10px; }

    .nav-btn {
      display: flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.04); border: 1px solid var(--border2);
      color: var(--txt2); padding: 8px 16px; border-radius: 10px;
      font-weight: 600; font-size: 0.78rem; cursor: pointer;
      transition: all 0.2s ease; white-space: nowrap;
    }
    .nav-btn:hover { background: rgba(255,255,255,0.07); border-color: var(--txt3); color: var(--txt); }
    .nav-btn.gold { background: rgba(251,191,36,0.08); border-color: rgba(251,191,36,0.3); color: var(--gold); }
    .nav-btn.gold:hover { background: rgba(251,191,36,0.15); border-color: var(--gold); }
    .nav-btn.gold.active { background: var(--gold); color: #080706; border-color: var(--gold); }

    /* ── CONTAINER ── */
    .wrap { width: 100%; max-width: 540px; }

    /* ── LOGO (Sleek Text Version) ── */
    .logo-wrap { text-align: center; margin-bottom: 24px; padding: 10px 0; }
    .logo-main { font-size: 2.4rem; font-weight: 800; color: var(--gold); letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 6px; }
    .logo-main span { color: var(--txt); }
    .logo-sub { font-size: 0.85rem; color: var(--txt2); font-weight: 500; letter-spacing: 0.05em; }

    /* ── QUOTA BADGE ── */
    .quota-badge { background: rgba(255,255,255,0.03); border: 1px solid var(--border2); padding: 6px 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 600; color: var(--txt2); margin-bottom: 20px; display: inline-flex; align-items: center; gap: 6px; }
    .quota-badge .val { color: var(--gold); font-weight: 800; font-size: 0.8rem; }

    /* ── CARD ── */
    .card { background: rgba(15,14,12,0.6); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);  border: 1.5px solid var(--border); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 60px var(--glow); }

    /* ── HOST BAR ── */
    .host-bar { display: flex; align-items: center; gap: 14px; padding: 18px 24px; border-bottom: 1.5px solid var(--border); background: rgba(0,0,0,0.2); }
    .host-avatar { width: 48px; height: 48px; border-radius: 50%; border: 2px solid var(--border); box-shadow: 0 0 12px rgba(251,191,36,0.15); object-fit: cover; }
    .host-name { font-size: 0.92rem; font-weight: 700; color: var(--txt); }
    .host-sub { font-size: 0.7rem; color: var(--txt2); margin-top: 2px; }
    .host-badge { margin-left: auto; background: var(--border); color: var(--gold); font-size: 0.62rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.08em; text-transform: uppercase; border: 1px solid rgba(251,191,36,0.12); }

    /* ── BODY ── */
    .body { padding: 28px 24px; }
    .dots { display: flex; justify-content: center; gap: 7px; margin-bottom: 20px; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border2); transition: all 0.3s; }
    .dot.active { background: var(--gold); box-shadow: 0 0 6px var(--gold); transform: scale(1.3); }
    .dot.done { background: var(--txt3); }
    .step-lbl { font-size: 0.68rem; text-transform: uppercase; font-weight: 800; color: var(--txt2); text-align: center; margin-bottom: 20px; letter-spacing: 0.12em; }

    /* ── ERROR BOX ── */
    .err { background: rgba(239,68,68,0.07); border: 1px dashed rgba(239,68,68,0.25); border-radius: 10px; color: #f87171; padding: 10px 14px; font-size: 0.78rem; margin-bottom: 16px; line-height: 1.5; display: none; }

    /* ── FIELDS ── */
    .field { margin-bottom: 18px; }
    .field label { display: block; font-size: 0.73rem; font-weight: 700; color: var(--txt); margin-bottom: 7px; }
    .field label .req { color: var(--gold); margin-left: 2px; }
    .field label .hint { font-size: 0.65rem; color: var(--txt3); font-weight: 400; float: right; }
    .field input, .field textarea, .field select {
      width: 100%; background: #0a0908; border: 1.5px solid var(--border); border-radius: 11px;
      padding: 12px 14px; color: var(--txt); font-family: var(--font); font-size: 0.86rem;
      outline: none; transition: all 0.2s;
    }
    .field input:focus, .field textarea:focus, .field select:focus { border-color: var(--gold); box-shadow: 0 0 8px rgba(251,191,36,0.07); }
    .field textarea { height: 96px; resize: none; line-height: 1.6; }
    .field select { appearance: none; cursor: pointer; }
    .char-count { font-size: 0.65rem; color: var(--txt3); text-align: right; margin-top: 5px; font-weight: 600; }
    .char-count.warn { color: #f87171; }

    /* ── UPLOAD ZONE ── */
    .upload-zone {
      border: 1.5px dashed var(--border2); border-radius: 11px; padding: 22px; text-align: center;
      background: rgba(10,9,8,0.4); cursor: pointer; position: relative; transition: all 0.2s;
    }
    .upload-zone:hover, .upload-zone.over { border-color: var(--gold); background: rgba(251,191,36,0.01); }
    .upload-zone input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
    .upload-zone .uz-icon { font-size: 1.5rem; color: var(--txt3); margin-bottom: 6px; }
    .upload-zone .uz-title { font-size: 0.8rem; font-weight: 600; color: var(--txt); margin-bottom: 3px; }
    .upload-zone .uz-sub { font-size: 0.65rem; color: var(--txt3); }
    .upload-zone .uz-name { font-size: 0.8rem; font-weight: 600; color: var(--gold); margin-top: 8px; word-break: break-all; }

    /* ── CONSENT ── */
    .consent { display: flex; align-items: flex-start; gap: 11px; cursor: pointer; margin-top: 22px; }
    .check-box { width: 17px; height: 17px; border: 1.5px solid var(--border2); border-radius: 5px; display: flex; align-items: center; justify-content: center; background: #0a0908; transition: all 0.2s; flex-shrink: 0; margin-top: 2px; }
    .check-box .tick { font-size: 0.7rem; color: #080706; display: none; font-weight: 900; }
    .check-box.checked { background: var(--gold); border-color: var(--gold); }
    .check-box.checked .tick { display: block; }
    .consent p { font-size: 0.73rem; color: var(--txt2); line-height: 1.6; user-select: none; }

    /* ── BUTTONS ── */
    .btn {
      width: 100%; background: var(--gold); color: #080706; border: none;
      border-radius: 11px; padding: 14px; font-weight: 800; font-size: 0.88rem;
      cursor: pointer; transition: all 0.2s; margin-top: 24px;
      letter-spacing: 0.04em; text-transform: uppercase;
      box-shadow: 0 4px 18px rgba(251,191,36,0.14);
    }
    .btn:hover:not(:disabled) { background: var(--gold2); transform: translateY(-1px); box-shadow: 0 6px 22px rgba(251,191,36,0.22); }
    .btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
    .btn-back { background: transparent; border: 1.5px solid var(--border2); border-radius: 8px; color: var(--txt2); font-size: 0.72rem; font-weight: 600; padding: 8px 16px; cursor: pointer; transition: all 0.2s; }
    .btn-back:hover { border-color: var(--txt2); color: var(--txt); }

    /* ── SPINNER ── */
    .spin { display: inline-block; width: 13px; height: 13px; border: 2px solid rgba(8,7,6,0.2); border-top-color: #080706; border-radius: 50%; animation: rotate 0.6s linear infinite; vertical-align: middle; margin-right: 6px; }
    @keyframes rotate { to { transform: rotate(360deg); } }

    /* ── BLOCKED ── */
    .blocked { text-align: center; padding: 12px 0; }
    .blocked .big { font-size: 2.4rem; margin-bottom: 14px; }
    .blocked h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 10px; }
    .blocked p { font-size: 0.8rem; color: var(--txt2); line-height: 1.7; margin-bottom: 16px; }
    .countdown { display: inline-block; background: #0a0908; border: 1.5px solid var(--gold); border-radius: 9px; padding: 9px 22px; font-size: 0.96rem; color: var(--gold); font-weight: 700; margin-bottom: 20px; box-shadow: inset 0 0 8px rgba(251,191,36,0.04); }

    /* ── STEP ANIMATION ── */
    .step { display: none; }
    .step.active { display: block; animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }
    @keyframes fadeUp { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:translateY(0); } }

    /* ── SOCIAL LINKS ── */
    .social-links { display: flex; gap: 10px; justify-content: center; margin-top: 28px; flex-wrap: wrap; max-width: 320px; }
    .social-btn { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: rgba(255,255,255,0.02); border: 1px solid var(--border2); border-radius: 12px; color: var(--txt2); transition: all 0.2s; text-decoration: none; }
    .social-btn svg { width: 20px; height: 20px; fill: currentColor; }
    .social-btn:hover { background: rgba(251,191,36,0.08); border-color: rgba(251,191,36,0.3); color: var(--gold); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(251,191,36,0.1); }

    /* ── FOOTER ── */
    .footer { margin-top: 32px; font-size: 0.6rem; color: var(--txt3); letter-spacing: 0.15em; text-transform: uppercase; font-weight: 700; opacity: 0.6; }

    /* ════ MODALS ════ */
    .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(8,7,6,0.92); backdrop-filter: blur(14px); z-index: 9000; align-items: center; justify-content: center; padding: 20px; }
    .modal-overlay.open { display: flex; animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .modal-box { background: var(--card); border: 1.5px solid var(--border2); border-radius: 22px; width: 100%; box-shadow: 0 30px 70px rgba(0,0,0,0.8), 0 0 80px var(--glow); animation: scaleUp 0.3s cubic-bezier(0.34,1.56,0.64,1); }
    @keyframes scaleUp { from { transform:scale(0.92); opacity:0; } to { transform:scale(1); opacity:1; } }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 22px 28px; border-bottom: 1.5px solid var(--border); }
    .modal-title { font-size: 1.1rem; font-weight: 700; color: var(--gold); display: flex; align-items: center; gap: 8px; }
    .modal-close { background: none; border: none; color: var(--txt2); font-size: 1.5rem; cursor: pointer; line-height: 1; padding: 0; transition: color 0.2s; }
    .modal-close:hover { color: var(--txt); }
    .modal-body { padding: 24px 28px; }

    /* ── Welcome Modal ── */
    #welcome-overlay { z-index: 9500; }
    #welcome-overlay .modal-box { max-width: 440px; text-align: center; padding: 40px 32px; }
    .welcome-icon { font-size: 3rem; margin-bottom: 16px; animation: float 3s ease-in-out infinite; }
    @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0); } }

    /* ── Staff Login Modal ── */
    #login-modal .modal-box { max-width: 400px; }
    .login-field { margin-bottom: 16px; }
    .login-field label { display: block; font-size: 0.73rem; font-weight: 700; color: var(--txt); margin-bottom: 7px; text-align: left; }
    .login-field input { width: 100%; background: #0a0908; border: 1.5px solid var(--border); border-radius: 10px; padding: 12px 14px; color: var(--txt); font-family: var(--font); font-size: 0.86rem; outline: none; transition: all 0.2s; }
    .login-field input:focus { border-color: var(--gold); box-shadow: 0 0 8px rgba(251,191,36,0.07); }
    .pw-wrap { position: relative; }
    .pw-wrap input { padding-right: 44px; }
    .pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--txt3); cursor: pointer; font-size: 1rem; padding: 0; }
    .login-err { background: rgba(239,68,68,0.08); border: 1px dashed rgba(239,68,68,0.25); border-radius: 8px; color: #f87171; padding: 9px 13px; font-size: 0.78rem; margin-bottom: 14px; display: none; }
    .login-btn { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); width: 100%; background: var(--gold); color: #080706; border: none; border-radius: 10px; padding: 13px; font-weight: 800; font-size: 0.88rem; cursor: pointer; transition: all 0.2s; margin-top: 4px; }
    .login-btn:hover { background: var(--gold2); box-shadow: 0 0 15px rgba(251,191,36,0.4); transform: scale(1.02); }
    .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── Staff Panel Modal ── */
    #panel-modal .modal-box { max-width: 820px; max-height: 88vh; overflow-y: auto; }
    .tab-bar { display: flex; gap: 4px; border-bottom: 1.5px solid var(--border); margin-bottom: 20px; overflow-x: auto; }
    .tab-btn { background: none; border: none; color: var(--txt2); padding: 10px 14px; font-weight: 600; font-size: 0.78rem; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; }
    .tab-btn:hover { color: var(--txt); }
    .tab-btn.active { color: var(--gold); border-bottom-color: var(--gold); }
    .tab-pane { display: none; }
    .tab-pane.active { display: block; animation: fadeUp 0.25s ease; }
    .pane-desc { font-size: 0.78rem; color: var(--txt2); margin-bottom: 14px; line-height: 1.6; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    .data-table th { padding: 9px 10px; color: var(--txt3); font-weight: 600; text-align: left; border-bottom: 1px solid var(--border); }
    .data-table td { padding: 12px 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: rgba(255,255,255,0.015); }
    .table-wrap { border: 1px solid var(--border); border-radius: 12px; background: #0a0a0a; overflow: hidden; max-height: 460px; overflow-y: auto; }
    .tag { font-size: 0.65rem; background: rgba(251,191,36,0.1); color: var(--gold); padding: 2px 7px; border-radius: 4px; font-weight: 700; }
    .tag.archived { background: rgba(255,255,255,0.05); color: var(--txt2); }
    .action-btn { background: none; border: 1px solid; border-radius: 6px; padding: 5px 10px; font-size: 0.72rem; cursor: pointer; font-weight: 600; transition: all 0.15s; }
    .action-btn.approve { border-color: var(--gold); color: var(--gold); }
    .action-btn.approve:hover { background: var(--gold); color: #080706; }
    .action-btn.reject { border-color: #f87171; color: #f87171; }
    .action-btn.reject:hover { background: #f87171; color: #080706; }
    .action-btn.danger { border-color: #f87171; color: #f87171; }
    .action-btn.danger:hover { background: rgba(248,113,113,0.12); }
    .action-btn.neutral { border-color: var(--border2); color: var(--txt2); }
    .action-btn.neutral:hover { border-color: var(--txt2); color: var(--txt); }
    .panel-input-row { display: flex; gap: 10px; margin-bottom: 14px; }
    .panel-input { flex: 1; background: #0a0908; border: 1.5px solid var(--border); border-radius: 9px; padding: 10px 12px; color: var(--txt); font-family: var(--font); font-size: 0.83rem; outline: none; }
    .panel-input:focus { border-color: var(--gold); }
    
  .panel-btn { background: rgba(255,255,255,0.03); color: var(--txt); border: 1px solid var(--border); padding: 10px 18px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s; }
  .panel-btn:hover { background: rgba(255,255,255,0.08); }

    .panel-btn:hover { background: var(--gold2); }
    .empty-state { color: var(--txt3); text-align: center; padding: 24px; font-size: 0.82rem; }
    .logout-btn { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 6px 12px; font-size: 0.72rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .logout-btn:hover { background: #f87171; color: #080706; }

    .note-box { background: rgba(255,255,255,0.02); border: 1px solid var(--border2); border-radius: 8px; padding: 10px; font-size: 0.75rem; color: var(--txt2); margin-top: 8px; font-style: italic; display: none; }
    .show-note { font-size: 0.65rem; color: var(--gold); text-decoration: underline; cursor: pointer; margin-left: 6px; }

    /* ── Playlist Modal ── */
    #playlist-modal .modal-box { max-width: 680px; max-height: 90vh; overflow-y: auto; }
    .playlist-item { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 10px; background: #0e0d0b; border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; margin-bottom: 8px; }
    .playlist-item:hover { background: #121110; border-color: rgba(251,191,36,0.2); transform: translateY(-1px); }
    .playlist-item:last-child { margin-bottom: 0; }
    .pl-num { font-size: 0.82rem; color: var(--txt3); font-weight: 600; width: 20px; text-align: right; flex-shrink: 0; }
    .pl-info { flex: 1; overflow: hidden; }
    .pl-title { font-size: 0.86rem; font-weight: 600; color: var(--txt); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pl-artist { font-size: 0.73rem; color: var(--txt2); }
    .pl-play { width: 32px; height: 32px; border-radius: 50%; background: var(--gold); color: #080808; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0; box-shadow: 0 0 8px rgba(251,191,36,0.2); }

    /* ── Success Modal ── */
    #success-modal .modal-box { max-width: 420px; text-align: center; padding: 40px 32px; }
    .success-icon { width: 68px; height: 68px; border-radius: 50%; border: 2.5px solid var(--gold); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 2rem; color: var(--gold); box-shadow: 0 0 20px rgba(251,191,36,0.25); }
    .success-title { font-size: 1.3rem; font-weight: 700; margin-bottom: 14px; }
    .success-text { font-size: 0.84rem; color: var(--txt2); line-height: 1.8; margin-bottom: 24px; }

    /* ── Global Audio Player ── */
    #audio-bar { 
      position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(120px); 
      width: 90%; max-width: 600px; 
      background: rgba(10, 9, 8, 0.85); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); 
      border: 1px solid var(--border); border-radius: 100px; 
      padding: 12px 24px; z-index: 9999; 
      display: flex; align-items: center; gap: 16px; 
      box-shadow: 0 20px 40px rgba(0,0,0,0.8), 0 0 20px var(--glow); 
      opacity: 0; pointer-events: none; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease;
    }
    #audio-bar.visible { transform: translateX(-50%) translateY(0); opacity: 1; pointer-events: auto; }
    #audio-bar.visible { display: flex; }
    .ab-art { width: 44px; height: 44px; background: var(--border2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
    .ab-info { flex: 1; min-width: 0; }
    .ab-title { font-size: 0.84rem; font-weight: 600; color: var(--txt); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ab-artist { font-size: 0.72rem; color: var(--txt2); }
    .ab-controls { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 2; max-width: 440px; }
    .ab-btn { background: none; border: none; color: var(--txt2); font-size: 1rem; cursor: pointer; transition: 0.2s; }
    .ab-btn:hover { color: var(--gold); transform: scale(1.1); }
    .ab-play { width: 38px; height: 38px; border-radius: 50%; background: var(--gold); border: none; color: #080808; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.15s; }
    .ab-play:hover { transform: scale(1.08); }
    .ab-seek-row { display: flex; align-items: center; gap: 8px; width: 100%; }
    .ab-time { font-size: 0.68rem; color: var(--txt3); width: 32px; text-align: right; }
    .ab-dur { font-size: 0.68rem; color: var(--txt3); width: 32px; }
    .ab-seek { flex: 1; accent-color: var(--gold); height: 3px; cursor: pointer; }
    .ab-close { background: none; border: none; color: var(--txt3); font-size: 1.3rem; cursor: pointer; padding: 0; flex-shrink: 0; }
    .ab-close:hover { color: var(--txt); }
    .ab-btns-row { display: flex; align-items: center; gap: 8px; }
    .ab-btn { background: none; border: none; color: var(--txt2); font-size: 1.1rem; cursor: pointer; padding: 4px; transition: all 0.15s ease; border-radius: 50%; }
    .ab-btn:hover { color: var(--gold); transform: scale(1.15); }
    @media (max-width: 600px) {
      #audio-bar { flex-wrap: wrap; padding: 16px; gap: 10px; border-radius: 20px; bottom: 20px; }
      .ab-controls { width: 100%; max-width: 100%; flex: unset; width: 100%; }
      .ab-info { flex: 1; }
    }
  
    .admin-dashboard {
      max-width: 100%;
      margin: 0 auto;
      padding: 20px 0 100px 0;
      animation: fadeUp 0.3s ease;
    }
    /* .admin-dashboard .modal-header styles replaced by inline styles */
    .admin-dashboard .modal-title { font-size:1.3rem; font-weight:600; color:#fff; display:flex; align-items:center; }
    .admin-dashboard .tab-bar { display:flex; gap:10px; flex-wrap:wrap; }
    .admin-dashboard .table-wrap { overflow-x:auto; background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); border:1px solid var(--border); border-radius:12px; }
    .admin-dashboard .data-table th, .admin-dashboard .data-table td { padding:14px 16px; font-size:0.9rem; }
    .admin-dashboard .pane-desc { font-size:0.85rem; color:var(--txt2); margin-bottom:15px; }

      ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(251,191,36,0.5); }
  
    .play-circle-btn {
      width: 40px; height: 40px; border-radius: 50%; border: none;
      background: rgba(251,191,36,0.1); color: var(--gold);
      font-size: 1.1rem; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      opacity: 0.7; margin: 0 auto;
    }
    .data-table tbody tr:hover .play-circle-btn {
      background: var(--gold); color: #000; opacity: 1; transform: scale(1.15); box-shadow: 0 0 15px rgba(251,191,36,0.5);
    }
    .data-table tbody tr td { border-bottom: 1px solid rgba(255,255,255,0.03); vertical-align: middle; }
    .data-table tbody tr:last-child td { border-bottom: none; }
  </style>
</head>
<body>

  <!-- ═══ NAVBAR ═══════════════════════════════════════════════════════════ -->
  <div class="navbar">
    <div class="navbar-brand">Mustafa İnce</div>
    <div class="navbar-actions">
      <!-- Sadece yetkili girişinde görünür olacak -->
      <!-- Sadece yetkili girişinde görünür olacak -->
      <button class="nav-btn gold" id="staff-btn" onclick="handleStaffBtnClick()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle></svg> Yetkili Girişi</button>
    </div>
  </div>

  <!-- ═══ MAIN CONTENT ══════════════════════════════════════════════════════ -->
  <div class="wrap">
    
    <div class="logo-wrap">
      <div class="logo-main">Mustafa İnce<br><span>Sizden Gelenler</span></div>
      <div class="logo-sub">Sezon 2 — Dinleyici Gönderim Portalı</div>
    </div>

    <div style="text-align: center;">
      <div class="quota-badge">
        Kalan Gönderim Hakkı: <span class="val" id="main-quota">-- / 200</span>
      </div>
    </div>

    <div class="card">
      <div class="host-bar">
        <img src="host.jpg" class="host-avatar" alt="Mustafa İnce">
        <div>
          <div class="host-name">Mustafa İnce</div>
          <div class="host-sub">MAIS Studio Yönetimi</div>
        </div>
        <div class="host-badge">Sezon 2</div>
      </div>

      <div class="body">
        <div class="dots" id="dots">
          <div class="dot active" id="dot-email"></div>
          <div class="dot" id="dot-form"></div>
        </div>

        <!-- Step 1: Google Sign-In -->
        <div class="step active" id="step-email">
          <div class="step-lbl">Adım 1 / 2 — Kimlik Doğrulama</div>
          <div class="err" id="err-email"></div>
          <div style="text-align:center; margin: 28px 0 18px;">
            <div id="gsi-btn" style="display:inline-block;"></div>
            <div id="gsi-loading" style="display:none; font-size:0.8rem; color:var(--gold); margin-top:12px; font-weight:600;">
              <span class="spin"></span>Doğrulanıyor...
            </div>
          </div>
          <div style="font-size:0.73rem; color:var(--txt3); text-align:center; line-height:1.7;">
            Her katılımcıdan haftalık yalnızca 1 başvuru kabul edilmektedir.<br>Devam etmek için Google hesabınızla giriş yapın.
          </div>
        </div>

        <!-- Blocked -->
        <div class="step" id="step-blocked">
          <div class="blocked">
            <div class="big">⏳</div>
            <h2>Bu hafta zaten bir parça gönderdiniz</h2>
            <p>Sistem suistimalini önlemek adına kısıtlamalar aktiftir.</p>
            <div class="countdown" id="countdown">— gün — saat kaldı</div>
            <p>Süre dolduğunda yeni bir parçayla tekrar başvurabilirsiniz.</p>
            <br>
            <button class="btn-back" onclick="goBack()">← Geri Dön</button>
          </div>
        </div>

        <!-- Step 2: Form -->
        <div class="step" id="step-form">
          <div class="step-lbl">Adım 2 / 2 — Parça Bilgileri</div>
          <div class="err" id="err-form"></div>
          <div class="field">
            <label>Ad Soyad <span class="req">*</span></label>
            <input type="text" id="fullName" placeholder="Adınız ve soyadınız" />
          </div>
          <div class="field">
            <label>Sosyal Medya Hesabı <span class="req">*</span></label>
            <input type="text" id="social" placeholder="@kullaniciadiniz" />
          </div>
          <div class="field">
            <label>Kullanılan Yapay Zeka Aracı <span class="req">*</span></label>
            <select id="aiTool">
              <option value="">Seçiniz</option>
              <option>Suno</option><option>Udio</option><option>AIVA</option>
              <option>Boomy</option><option>Mureka</option><option>Stable Audio</option>
              <option>ElevenLabs Music</option><option>Soundraw</option>
              <option>Beatoven.ai</option><option>Minimax Music</option>
              <option>Google Lyria</option><option>Sonauto</option><option>Diğer</option>
            </select>
          </div>
          <div class="field">
            <label>Parça Adı <span class="req">*</span></label>
            <input type="text" id="trackName" placeholder="Parçanın adı" />
          </div>
          <div class="field">
            <label>Parça Hakkında Not <span class="req">*</span></label>
            <textarea id="note" maxlength="210" placeholder="Bu parçayı nasıl ürettiniz? Ne anlatmak istediniz? (Maks 210 karakter)" oninput="updateCharCount(this)"></textarea>
            <div class="char-count" id="note-count">0 / 210</div>
          </div>
          <div class="field">
            <label>MP3 Dosyası <span class="req">*</span><span class="hint">maks. 20 MB</span></label>
            <div class="upload-zone" id="upload-zone">
              <input type="file" id="mp3file" accept=".mp3,audio/mpeg" onchange="handleFile(this)" />
              <div class="uz-icon">🎵</div>
              <div class="uz-title">MP3 dosyanı sürükle veya tıkla</div>
              <div class="uz-sub">Yalnızca .mp3 — maks. 20 MB</div>
              <div class="uz-name" id="file-name"></div>
            </div>
          </div>
          <div class="field">
            <div class="consent" onclick="toggleConsent()">
              <div class="check-box" id="chk"><span class="tick">✓</span></div>
              <p>Bu parçanın tüm telif ve kullanım haklarının şahsıma ait olduğunu beyan ederim. Gönderimimin stüdyo tarafından incelenmesini onaylıyorum.</p>
            </div>
          </div>
          <button class="btn" id="btn-submit" onclick="submitForm()">Başvuruyu Tamamla</button>
        </div>
      </div>
    </div>

    <div class="social-links">
      <a href="https://www.instagram.com/mustafaincemuzik/" target="_blank" class="social-btn" title="Instagram">
        <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </a>
      <a href="https://www.youtube.com/@mustafaincemuzik" target="_blank" class="social-btn" title="YouTube">
        <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
      </a>
      <a href="https://open.spotify.com/intl-tr/artist/5xcsIUfaETr2SFBiGtemrp" target="_blank" class="social-btn" title="Spotify">
        <svg viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.239.54-.959.72-1.56.3z"/></svg>
      </a>
      <a href="https://music.youtube.com/channel/UCncYK-WS8LG6L52uFAKL53A?si=Uy8vYObZMi02IcPp" target="_blank" class="social-btn" title="YouTube Music">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 8v8l6-4z"/></svg>
      </a>
      <a href="https://drive.google.com/file/d/1ut-7VB41aSU9p_3Wi5pzNJTEQLgQZNdg/view" target="_blank" class="social-btn" title="Drive Prompts">
        <svg viewBox="0 0 24 24"><path d="M7.71 3.5L1.15 15l3.43 6 6.55-11.5M9.73 15L6.3 21h13.12l3.43-6M13.44 10.5H.57l3.43-6h12.85"/></svg>
      </a>
      <a href="https://www.instagram.com/mustiaistudyo/" target="_blank" class="social-btn" title="MAIS Studio Instagram">
        <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </a>
    </div>

    <div class="footer">Mustafa İnce · Sizden Gelenler Sezon 2</div>
  </div>

  <!-- ═══ WELCOME OVERLAY ═══════════════════════════════════════════════ -->
  <div class="modal-overlay" id="welcome-overlay">
    <div class="modal-box" style="max-width: 440px; text-align: center; padding: 40px 32px;">
      <div class="welcome-icon">🚀</div>
      <div class="modal-title" style="justify-content:center; margin-bottom: 12px; font-size:1.3rem;">Sistem Test Aşamasında</div>
      <div class="pane-desc" style="margin-bottom:24px; font-size:0.86rem;">
        Sizden Gelenler platformu şu anda kota sınırlı test aşamasındadır. Yalnızca belirli sayıda başvuru kabul edilmektedir.
      </div>
      <div class="quota-badge" style="font-size: 0.82rem; padding: 10px 18px; margin-bottom: 28px; background:rgba(251,191,36,0.06); border-color:rgba(251,191,36,0.2);">
        Kalan Gönderim Hakkı: <span class="val" id="welcome-quota-val">-- / 200</span>
      </div>
      <button class="btn" style="margin-top:0;" onclick="closeModal('welcome-overlay')">Anladım, Devam Et</button>
    </div>
  </div>

  <!-- ═══ STAFF LOGIN MODAL ══════════════════════════════════════════════ -->
  <div class="modal-overlay" id="login-modal">
    <div class="modal-box">
      <div class="modal-header">
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; padding:10px 0 20px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--gold); margin-bottom:15px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg><div class="modal-title" style="font-size:1.4rem;">Yetkili Girişi</div></div>
        <button class="modal-close" onclick="closeModal('login-modal')">×</button>
      </div>
      <div class="modal-body">
        <div class="login-err" id="login-err"></div>
        <div class="login-field">
          <label>Kullanıcı Adı</label>
          <input type="text" id="login-username" placeholder="kullaniciadiniz" autocomplete="username" onkeydown="if(event.key==='Enter') doLogin()" />
        </div>
        <div class="login-field" style="margin-top:14px;">
          <label>Şifre</label>
          <div class="pw-wrap">
            <input type="password" id="login-password" placeholder="••••••••" autocomplete="current-password" onkeydown="if(event.key==='Enter') doLogin()" />
            <button class="pw-toggle" onclick="togglePw('login-password', this)" type="button" style="display:flex; align-items:center; justify-content:center; color:var(--txt2);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
          </div>
        </div>
        <button class="login-btn" id="login-btn" onclick="doLogin()" style="margin-top:20px;">Giriş Yap</button>
      </div>
    </div>
  </div>

  <!-- ═══ STAFF PANEL MODAL ═════════════════════════════════════════════ -->
  <div id="admin-dashboard" class="admin-dashboard" style="display:none;">
      <div class="modal-header" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px; border-bottom:1px solid var(--border); padding-bottom:20px; margin-bottom:30px;">
        <div class="navbar-brand" style="font-size: 1.1rem; color: var(--gold); letter-spacing: 0.1em; white-space:nowrap; margin-right: 20px;">
          MUSTAFA İNCE 
          <span id="panel-username" style="display:none; margin-left:12px; background:rgba(255,255,255,0.05); padding:6px 14px; border-radius:20px; font-size:0.8rem; font-weight:600; color:var(--gold); border:1px solid rgba(251,191,36,0.3); text-transform:none; letter-spacing:normal; box-shadow:0 0 10px rgba(251,191,36,0.1);"></span>
        </div>
        
        <div class="tab-bar" style="flex:1; justify-content:flex-start; margin-bottom:0; gap:8px;">
          <button class="tab-btn active" onclick="switchTab('inbox')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg> Gelen Kutusu</button>
          <button class="tab-btn" onclick="switchTab('reviewed')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg> Geçmiş</button>
          <button class="tab-btn" onclick="switchTab('limits')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Bekleme Süresi</button>
          <button class="tab-btn" onclick="switchTab('accounts')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Hesaplar</button>
          <button class="tab-btn" id="special-tab-btn" onclick="switchTab('special')" style="display:none;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Özel Gelenler</button>
          <button class="tab-btn" id="settings-tab-btn" onclick="switchTab('settings')" style="display:none;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> Sistem Araçları</button>
        </div>

        <div style="white-space:nowrap; margin-left: 20px;">
          <button class="logout-btn" onclick="clearStaff()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> Çıkış Yap</button>
        </div>
      </div>
      <div class="modal-body">
        <!-- TAB BAR IS NOW MOVED TO HEADER -->

        <!-- INBOX -->
        <div class="tab-pane active" id="tab-inbox">
          <p class="pane-desc">Gelen başvurular. Parçayı dinlemek için satıra tıklayın. "İncelendi" olarak işaretleyerek arşive taşıyabilirsiniz.</p>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Parça / Sanatçı</th><th>Araç</th><th style="text-align:right;">İşlem</th></tr></thead>
              <tbody id="inbox-body"><tr><td colspan="3" class="empty-state">Yükleniyor...</td></tr></tbody>
            </table>
          </div>
        </div>

        <!-- REVIEWED -->
        <!-- REVIEWED -->
        <div class="tab-pane" id="tab-reviewed">
          <p class="pane-desc">Daha önce "İncelendi" olarak işaretlenen son 15 parça. Yanlışlıkla elediğiniz parçaları "Geri Al" butonuna basarak Gelen Kutusu'na döndürebilirsiniz.</p>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Parça / Sanatçı</th><th>Araç</th><th style="text-align:right;">İşlem</th></tr></thead>
              <tbody id="reviewed-body"><tr><td colspan="3" class="empty-state">Yükleniyor...</td></tr></tbody>
            </table>
          </div>
        </div>

        <!-- LIMITS -->
        <div class="tab-pane" id="tab-limits">
          <p class="pane-desc">Aktif bekleme süresi olan IP adresleri/Kullanıcılar. Sıfırladığınızda yeni parça gönderebilirler.</p>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>E-posta</th><th>Son Başvuru</th><th style="text-align:right;">İşlem</th></tr></thead>
              <tbody id="limits-body"><tr><td colspan="3" class="empty-state">Yükleniyor...</td></tr></tbody>
            </table>
          </div>
        </div>

        <!-- ACCOUNTS -->
        <div class="tab-pane" id="tab-accounts">
          <p class="pane-desc">Yetkili personel hesapları. Yeni çalışan eklemek veya hesabını kaldırmak için bu sekmeyi kullanın.</p>
          <div id="accounts-owner-section">
            <div class="panel-input-row">
              <input type="text" class="panel-input" id="new-username" placeholder="Kullanıcı adı" />
              <input type="password" class="panel-input" id="new-password" placeholder="Şifre (min. 6 karakter)" />
              <button class="panel-btn" onclick="addAccount()">Ekle</button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Kullanıcı Adı</th><th>Yetki</th><th style="text-align:right;">İşlem</th></tr></thead>
              <tbody id="accounts-body"><tr><td colspan="3" class="empty-state">Yükleniyor...</td></tr></tbody>
            </table>
          </div>
          <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border);">
            <p style="font-size:0.75rem; color:var(--txt2); margin-bottom:10px; font-weight:600;">Şifremi Değiştir</p>
            <div class="panel-input-row" style="flex-wrap:wrap; gap:8px;">
              <input type="password" class="panel-input" id="cur-pw" placeholder="Mevcut şifre" style="min-width:160px;" />
              <input type="password" class="panel-input" id="new-pw" placeholder="Yeni şifre" style="min-width:160px;" />
              <button class="panel-btn" onclick="changePassword()">Güncelle</button>
            </div>
            <div class="login-err" id="pw-change-err" style="margin-top:8px;"></div>
            <div id="pw-change-ok" style="display:none; color:#4ade80; font-size:0.78rem; margin-top:8px;">✓ Şifre başarıyla güncellendi.</div>
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
              <button class="panel-btn" style="background:var(--gold); border-color:var(--gold); color:#000;" onclick="saveSpecialCfg()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Kaydet</button>
              <button class="panel-btn" style="background:rgba(239,68,68,0.05);border-color:rgba(239,68,68,0.2);color:#ef4444;" onclick="resetSpecialQuota()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg> Kotayı Sıfırla</button>
            </div>
            <div id="cfg-msg" style="display:none; font-size:0.78rem; color:#4ade80; margin-top:6px;">✓ Ayarlar kaydedildi.</div>

            <div style="margin-top:20px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.05);">
              <div class="panel-input-row">
                <label style="font-size:0.78rem; color:var(--txt2); min-width:100px;">Drive Eşitleme:</label>
                <button class="panel-btn" onclick="syncDrive()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg> Eski Parçaları Çek</button>
              </div>
              <div style="font-size:0.7rem; color:var(--txt3); margin-top:6px;">Daha önce Drive'a gelen ve listede olmayan parçaları ekler, kotadan düşer.</div>
            </div>
          </div>
        </div>

      </div>
  </div>



  <!-- ═══ SUCCESS MODAL ═════════════════════════════════════════════════ -->
  <div class="modal-overlay" id="success-modal">
    <div class="modal-box">
      <div class="success-icon">✓</div>
      <div class="success-title">Başvurunuz Alındı!</div>
      <div class="success-text">
        Teşekkür ederiz. Parçanız değerlendirme listemize eklendi.<br>
        Tüm başvuruları titizlikle dinliyoruz.<br><br>
        <span style="font-size:0.78rem; color:var(--txt3);">Bir sonraki haftadan itibaren yeni başvuru yapabilirsiniz.</span>
      </div>
      <button class="btn" style="margin-top:0;" onclick="closeModal('success-modal'); goBack()">Kapat</button>
    </div>
  </div>

  <!-- ═══ GLOBAL AUDIO BAR ══════════════════════════════════════════════ -->
  <div id="audio-bar">
    <div class="ab-art" id="ab-art">🎵</div>
    <div class="ab-info">
      <div class="ab-title" id="ab-title">—</div>
      <div class="ab-artist" id="ab-artist">—</div>
    </div>
    <div class="ab-controls">
      <div class="ab-btns-row">
        <button class="ab-btn" onclick="skipBackward()" title="10s Geri">⏪</button>
        <button class="ab-btn" onclick="prevTrack()" title="Önceki Parça">⏮</button>
        <button class="ab-play" id="ab-play" onclick="togglePlay()">▶</button>
        <button class="ab-btn" onclick="nextTrack()" title="Sonraki Parça">⏭</button>
        <button class="ab-btn" onclick="skipForward()" title="10s İleri">⏩</button>
      </div>
      <div class="ab-seek-row">
        <span class="ab-time" id="ab-cur">0:00</span>
        <input type="range" class="ab-seek" id="ab-seek" min="0" max="100" value="0" oninput="seek(this.value)" />
        <span class="ab-dur" id="ab-dur">0:00</span>
      </div>
    </div>
    <span class="tag" id="ab-tag" style="margin-right:auto;">—</span>
    <div style="display:flex; align-items:center; gap:8px; margin-right:15px; color:#fff;">
      <button class="ab-btn" onclick="toggleMute()" id="ab-mute" style="font-size:1.1rem; padding:0 5px;">🔊</button>
      <input type="range" class="ab-seek" id="ab-vol" min="0" max="100" value="100" oninput="changeVol(this.value)" style="width:70px; margin:0;" />
    </div>
    <button class="ab-close" onclick="closePlayer()">×</button>
  </div>
  <audio id="player" style="display:none;"></audio>

  <script>
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
          localStorage.setItem('cooldown_until', Date.now() + (data.days * 24 * 60 * 60 * 1000) + (data.hours * 60 * 60 * 1000));
          document.getElementById('countdown-days').textContent = String(data.days).padStart(2, '0');
          document.getElementById('countdown-hours').textContent = String(data.hours).padStart(2, '0');
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
    
    function showAdminDashboard() {
      document.querySelector('.navbar').style.display = 'none';
      document.querySelector('.wrap').style.display = 'none';
      document.getElementById('admin-dashboard').style.display = 'block';
    }
    function hideAdminDashboard() {
      document.querySelector('.navbar').style.display = '';
      document.querySelector('.wrap').style.display = '';
      document.getElementById('admin-dashboard').style.display = 'none';
    }

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
    }

    function clearStaff() {
      staffToken = ''; staffUsername = ''; staffRole = '';
      localStorage.removeItem('staff_token');
      localStorage.removeItem('staff_username');
      localStorage.removeItem('staff_role');
      const btn = document.getElementById('staff-btn');
      btn.textContent = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle></svg> Yetkili Girişi';
      btn.classList.remove('active');
      hideAdminDashboard();
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
      showAdminDashboard();
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
          let act = acc.role !== 'owner' && staffRole === 'owner' ? '<button class="action-btn red" onclick="deleteAccount(\\\'' + acc.username + '\\\')">Sil</button>' : '-';
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
      ib.innerHTML = '';
      currentInboxList.length = 0;
      data.submissions.forEach(function(s) {
        if(s.status === 'pending') currentInboxList.push(s);
      });

      if (currentInboxList.length === 0) ib.innerHTML = '<tr><td colspan="4" class="empty-state">Yeni parça yok.</td></tr>';
      else {
        currentInboxList.forEach(function(s, idx) {
          let action = '<button class="action-btn approve" onclick="event.stopPropagation(); updateStatus(\\'' + esc(s.id) + '\\',\\'reviewed\\')">İncelendi</button>';
          let playBtn = '<td style="width: 60px; text-align: center;"><button class="play-circle-btn" onclick="event.stopPropagation(); playFromList(\\'inbox\\', ' + idx + ')">▶</button></td>';
          let aiToolStr = (s.aiTool && s.aiTool !== 'Bilinmiyor') ? '&nbsp;•&nbsp; <span style="color:var(--gold);">' + esc(s.aiTool) + '</span>' : '';
          let trackInfo = '<td><div style="font-weight: 700; font-size: 1rem; color: #fff; margin-bottom: 4px;">' + esc(s.trackName) + '</div><div style="font-size: 0.8rem; color: var(--txt2);">' + esc(s.fullName) + aiToolStr + '</div></td>';
          let dateStr = new Date(s.timestamp).toLocaleDateString();
          let extraInfo = '<td><div style="font-size: 0.8rem; color: var(--txt2);">' + esc(s.email) + '</div><div style="font-size: 0.75rem; color: var(--txt3); margin-top: 4px;">' + esc(dateStr) + '</div></td>';
          let rowNote = '';
          if (s.note && s.note !== 'Bilinmiyor') {
            rowNote = '<tr><td colspan="4" style="padding:0; border:none;"><div style="font-size:0.8rem;color:var(--txt3);margin:0 20px 10px 76px;padding:10px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px dashed rgba(255,255,255,0.05);">' + esc(s.note) + '</div></td></tr>';
          }
          let rowHtml = '<tr style="cursor:pointer;" onclick="playFromList(\\'inbox\\', ' + idx + ')">' + playBtn + trackInfo + extraInfo + '<td style="text-align:right;">' + action + '</td></tr>' + rowNote;
          ib.innerHTML += rowHtml;
        });
      }


      const rb = document.getElementById('reviewed-body');
      rb.innerHTML = '';
      currentReviewedList.length = 0;
      
      // Get reviewed items, sort them to get the latest 15 (if timestamp exists, assume they are chronological)
      let allReviewed = data.submissions.filter(function(s) { return s.status === 'reviewed'; });
      let last15 = allReviewed.slice(-15);
      
      last15.forEach(function(s) {
        currentReviewedList.push(s);
      });

      if (currentReviewedList.length === 0) rb.innerHTML = '<tr><td colspan="4" class="empty-state">Geçmiş boş.</td></tr>';
      else {
        currentReviewedList.forEach(function(s, idx) {
          let action = '<button class="action-btn red" onclick="event.stopPropagation(); unreviewTrack(\'' + esc(s.id) + '\')">Geri Al</button>';
          let playBtn = '<td style="width: 60px; text-align: center;"><button id="btn-play-reviewed-' + idx + '" class="play-circle-btn" onclick="event.stopPropagation(); playFromList(\'reviewed\', ' + idx + ')">▶</button></td>';
          let aiToolStr = (s.aiTool && s.aiTool !== 'Bilinmiyor') ? '&nbsp;•&nbsp; <span style="color:var(--gold);">' + esc(s.aiTool) + '</span>' : '';
          let trackInfo = '<td><div style="font-weight: 700; font-size: 1rem; color: #fff; margin-bottom: 4px;">' + esc(s.trackName) + '</div><div style="font-size: 0.8rem; color: var(--txt2);">' + esc(s.fullName) + aiToolStr + '</div></td>';
          let dateStr = new Date(s.timestamp).toLocaleDateString();
          let extraInfo = '<td><div style="font-size: 0.8rem; color: var(--txt2);">' + esc(s.email) + '</div><div style="font-size: 0.75rem; color: var(--txt3); margin-top: 4px;">' + esc(dateStr) + '</div></td>';
          let rowNote = '';
          if (s.note && s.note !== 'Bilinmiyor') {
            rowNote = '<tr><td colspan="4" style="padding:0; border:none;"><div style="font-size:0.8rem;color:var(--txt3);margin:0 20px 10px 76px;padding:10px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px dashed rgba(255,255,255,0.05);">' + esc(s.note) + '</div></td></tr>';
          }
          let rowHtml = '<tr style="cursor:pointer;" onclick="playFromList(\'reviewed\', ' + idx + ')">' + playBtn + trackInfo + extraInfo + '<td style="text-align:right;">' + action + '</td></tr>' + rowNote;
          rb.innerHTML += rowHtml;
        });
      }


      const spb = document.getElementById('special-body');
      spb.innerHTML = '';
      currentSpecialList = data.specialSubmissions || [];
      if(currentSpecialList.length > 0) {
        currentSpecialList.forEach(function(s, idx) {
          let action = s.status === 'pending'
            ? '<button class="action-btn approve" onclick="event.stopPropagation(); updateSpecialStatus(\\'' + s.id + '\\',\\'reviewed\\')">İncelendi</button>'
            : '<button class="action-btn red" onclick="event.stopPropagation(); updateSpecialStatus(\\'' + s.id + '\\',\\'pending\\')">Geri Al</button>';
          let playBtn = '<td style="width: 60px; text-align: center;"><button class="play-circle-btn" onclick="event.stopPropagation(); playFromList(\\'special\\', ' + idx + ')">▶</button></td>';
          let aiToolStr = (s.aiTool && s.aiTool !== 'Bilinmiyor') ? '&nbsp;•&nbsp; <span style="color:var(--gold);">' + esc(s.aiTool) + '</span>' : '';
          let trackInfo = '<td><div style="font-weight: 700; font-size: 1rem; color: #fff; margin-bottom: 4px;">' + esc(s.trackName) + '</div><div style="font-size: 0.8rem; color: var(--txt2);">' + esc(s.fullName) + aiToolStr + '</div></td>';
          let dateStr = new Date(s.timestamp).toLocaleDateString();
          let extraInfo = '<td><div style="font-size: 0.8rem; color: var(--txt2);">' + esc(s.email) + '</div><div style="font-size: 0.75rem; color: var(--txt3); margin-top: 4px;">' + esc(dateStr) + '</div></td>';
          let rowNote = '';
          if (s.note && s.note !== 'Bilinmiyor') {
            rowNote = '<tr><td colspan="4" style="padding:0; border:none;"><div style="font-size:0.8rem;color:var(--txt3);margin:0 20px 10px 76px;padding:10px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px dashed rgba(255,255,255,0.05);">' + esc(s.note) + '</div></td></tr>';
          }
          let rowHtml = '<tr style="cursor:pointer;" onclick="playFromList(\\'special\\', ' + idx + ')">' + playBtn + trackInfo + extraInfo + '<td style="text-align:right;">' + action + '</td></tr>' + rowNote;
          spb.innerHTML += rowHtml;
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
    let currentSpecialList = [];
    let currentReviewedList = [];

    function esc(str) {
      if (!str) return '';
      return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function fmt(dateStr) {
      if (!dateStr) return '';
      try { return new Date(dateStr).toLocaleDateString('tr-TR'); } catch(e) { return dateStr; }
    }

    async function resetSpecialQuota() {
      if(!confirm('Özel gönderim kotası sıfırlanacak. Emin misiniz?')) return;
      try {
        const res = await authFetch('/api/admin/save-special-config', { resetQuota: true });
        if(res.success) { alert('Kota sıfırlandı.'); loadPanelData(); }
      } catch(e) { alert('Hata.'); }
    }

    async function syncDrive() {
      if (!confirm('Drive klasörünüz taranıp, listede olmayan tüm eski parçalar eklenecek ve kalan kotadan düşülecektir. Onaylıyor musunuz?')) return;
      try {
        const res = await authFetch('/api/admin/sync-drive', {});
        if (res.success) {
          alert(res.count + ' adet yeni parça eklendi! Kalan kota: ' + (200 - res.usedQuota));
          loadPanelData();
        } else {
          alert(res.error || 'Hata oluştu.');
        }
      } catch(e) { alert('Bağlantı hatası.'); }
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

    function logout() { clearStaff(); }

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
        msg.textContent = '\u2713 Ayarlar kaydedildi.';
        msg.style.display = 'block';
        setTimeout(function() { msg.style.display = 'none'; }, 3000);
      } catch(e) { alert(e.message); }
    }

    async function resetSpecialQuota() {
      if (!confirm('Ozel bolum kotasini sifirlamak istediginize emin misiniz?')) return;
      try {
        await authFetch('/api/admin/save-special-config', { resetQuota: true });
        var msg = document.getElementById('cfg-msg');
        msg.textContent = '\u2713 Kota sifirlandi.';
        msg.style.display = 'block';
        setTimeout(function() { msg.style.display = 'none'; }, 3000);
      } catch(e) { alert(e.message); }
    }

    function renderAccounts() { loadPanelData(); }

    // ═══ PLAYLIST QUEUE & ADVANCED AUDIO ═════════════════════════════════════
    var playlist = [];
    var playlistIndex = -1;

    
    function toggleMute() {
      if (playerEl.muted) {
        playerEl.muted = false;
        document.getElementById('ab-mute').textContent = '🔊';
        document.getElementById('ab-vol').value = playerEl.volume * 100;
      } else {
        playerEl.muted = true;
        document.getElementById('ab-mute').textContent = '🔇';
        document.getElementById('ab-vol').value = 0;
      }
    }
    
    function changeVol(val) {
      playerEl.volume = val / 100;
      if (playerEl.volume === 0) {
        playerEl.muted = true;
        document.getElementById('ab-mute').textContent = '🔇';
      } else {
        playerEl.muted = false;
        document.getElementById('ab-mute').textContent = '🔊';
      }
    }

    let currentListType = '';
    function playFromList(listName, idx) {
      if (currentListType === listName && playlistIndex === idx && playerEl.src) {
        togglePlay();
        return;
      }
      currentListType = listName;

      var srcList = listName === 'inbox' ? currentInboxList : (listName === 'reviewed' ? currentReviewedList : currentSpecialList);
      playlist = srcList.map(function(s) {
        return { audioUrl: '/api/stream-audio?fileId=' + s.fileId, title: s.trackName, artist: s.fullName || '\u2014', aiTool: s.aiTool || '' };
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


    // ═══ AUDIO PLAYER ════════════════════════════════════════════════════════
    const playerEl = document.getElementById('player');

    function playTrack(url, title, artist, aiTool) {
      document.getElementById('ab-title').textContent = title;
      document.getElementById('ab-artist').textContent = artist;
      document.getElementById('ab-tag').textContent = aiTool;
      // Use fetch with JWT auth to get audio as blob
      fetch(url, { headers: { 'Authorization': 'Bearer ' + staffToken } })
        .then(function(res) {
          if (!res.ok) throw new Error('Audio fetch failed');
          return res.blob();
        })
        .then(function(blob) {
          var blobUrl = URL.createObjectURL(blob);
          playerEl.src = blobUrl;
          playerEl.load();
          playerEl.play().then(function() {
            document.getElementById('ab-play').textContent = '⏸';
            document.getElementById('audio-bar').classList.add('visible');
            updateListPlayBtns();
          }).catch(function() { alert('Ses dosyası oynatılamadı.'); });
        })
        .catch(function() { alert('Ses dosyası yüklenemedi. Yetkinizi kontrol edin.'); });
    }

    function playTrackById(fileId, title, artist, aiTool) {
      playTrack('/api/stream-audio?fileId=' + fileId, title, artist, aiTool);
    }

    function updateListPlayBtns() {
      document.querySelectorAll('.play-circle-btn').forEach(function(btn) { btn.textContent = '▶'; });
      if (currentListType && playlistIndex >= 0) {
        var btn = document.getElementById('btn-play-' + currentListType + '-' + playlistIndex);
        if (btn) btn.textContent = playerEl.paused ? '▶' : '⏸';
      }
    }

    function togglePlay() {
      if (playerEl.paused) { playerEl.play(); document.getElementById('ab-play').textContent = '⏸'; }
      else { playerEl.pause(); document.getElementById('ab-play').textContent = '▶'; }
      updateListPlayBtns();
    }

    function seek(val) {
      if (playerEl.duration) playerEl.currentTime = (val / 100) * playerEl.duration;
    }

    function closePlayer() {
      playerEl.pause();
      document.getElementById('audio-bar').classList.remove('visible');
      currentListType = '';
      playlistIndex = -1;
      updateListPlayBtns();
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
    playerEl.addEventListener('ended', function() { if (playlistIndex + 1 < playlist.length) { nextTrack(); } else { document.getElementById('ab-play').textContent = '\u25b6'; } });

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
  <\/script>
</body>
</html>`;

fs.writeFileSync(htmlFile, html, 'utf8');
console.log('SUCCESS: Overwritten index.html directly with new UI.');
