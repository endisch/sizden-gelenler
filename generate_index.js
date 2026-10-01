const fs = require('fs');
const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mustafa İnce · Sizden Gelenler — Sezon 2</title>
<meta name="description" content="Yapay zeka ile ürettiğin parçanı Mustafa İnce'ye gönder. Sizden Gelenler Sezon 2 başvuruları açık.">
<meta name="theme-color" content="#0a0a0b">
<link rel="canonical" href="https://mais.thendisch.com/">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
:root {
  --bg:       #0a0a0b;
  --surface:  #111113;
  --panel:    #17161a;
  --raised:   #1f1e22;
  --border:   rgba(255,255,255,0.07);
  --border-m: rgba(255,255,255,0.13);
  --gold:     #c8a84b;
  --gold-soft:#e0c87a;
  --gold-dim: rgba(200,168,75,0.12);
  --gold-glow:rgba(200,168,75,0.07);
  --cream:    #ede9e0;
  --text:     #e8e4db;
  --dim:      #6e6a62;
  --dim-m:    #8c8880;
  --ok:       #5eb87e;
  --err:      #c45c4a;
  --radius:   14px;
  --font:     'Montserrat', sans-serif;
  --mono:     'JetBrains Mono', monospace;
  --shadow:   0 24px 64px -20px rgba(0,0,0,0.85);
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg); color: var(--text);
  font-family: var(--font); font-size: 15px;
  line-height: 1.6; -webkit-font-smoothing: antialiased; overflow-x: hidden;
}
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
img { display: block; max-width: 100%; }
::selection { background: var(--gold); color: #0a0a0b; }
:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; border-radius: 4px; }

.mono { font-family: var(--mono); }

.spin {
  display: inline-block; width: 12px; height: 12px;
  border: 2px solid rgba(200,168,75,0.2); border-top-color: var(--gold);
  border-radius: 50%; animation: spin .65s linear infinite;
  vertical-align: middle; margin-right: 7px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.noise {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.025; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* ── Header ── */
header {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px clamp(20px,5vw,64px);
  background: rgba(10,10,11,0.82); backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--border);
}
.brand { display: flex; align-items: center; gap: 14px; }
.logo-chip { background: var(--cream); border-radius: 8px; padding: 5px 10px; display: flex; align-items: center; }
.logo-chip img { height: 20px; width: auto; }
.brand-label { font-size: 10.5px; color: var(--dim); letter-spacing: 0.1em; text-transform: uppercase; }
.staff-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 18px; border: 1px solid var(--border-m); border-radius: 999px;
  font-size: 12.5px; font-weight: 600; color: var(--dim-m);
  transition: border-color .2s, color .2s, background .2s;
}
.staff-btn:hover { border-color: var(--gold); color: var(--text); }
.staff-btn.active { background: var(--gold-dim); border-color: var(--gold); color: var(--gold-soft); }
.staff-btn svg { width: 13px; height: 13px; }

/* ── Hero ── */
.hero {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 56px; align-items: center;
  padding: clamp(52px,8vw,100px) clamp(20px,5vw,64px) clamp(48px,6vw,72px);
  max-width: 1280px; margin: 0 auto;
}
.eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 10.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--gold); margin-bottom: 20px;
}
.eyebrow-line { width: 28px; height: 1px; background: var(--gold); opacity: 0.5; }
.hero-title { font-size: clamp(42px,6.5vw,72px); font-weight: 900; line-height: 0.94; text-transform: uppercase; margin-bottom: 18px; color: var(--cream); }
.hero-title .accent { color: var(--gold); }
.hero-lead { color: var(--dim-m); font-size: 15px; max-width: 44ch; margin-bottom: 34px; line-height: 1.75; }
.hero-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }

.btn-cta {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 15px 28px; border-radius: 10px; background: var(--gold); color: #0a0a0b;
  font-weight: 800; font-size: 13.5px; letter-spacing: 0.01em;
  box-shadow: 0 8px 28px -8px rgba(200,168,75,0.45);
  transition: transform .15s, box-shadow .15s;
}
.btn-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 32px -6px rgba(200,168,75,0.5); }
.btn-cta svg { width: 15px; height: 15px; }

.quota-chip {
  display: inline-flex; align-items: center;
  background: var(--panel); border: 1px solid var(--border); border-radius: 11px; padding: 12px 18px;
}
.quota-label { font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--dim); }
.quota-value { font-size: 20px; font-weight: 700; color: var(--gold); font-family: var(--mono); }

.hero-visual { display: flex; justify-content: center; position: relative; }
.hero-badge {
  position: absolute; top: -12px; right: -12px; z-index: 3;
  background: var(--panel); border: 1px solid var(--border-m); border-radius: 10px;
  padding: 9px 13px; display: flex; align-items: center; gap: 8px;
}
.badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ok); animation: pulse 1.8s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
.badge-txt { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dim-m); }
.portrait-wrap {
  position: relative; width: min(340px,90%); aspect-ratio: 1/1.1;
  border-radius: 18px; overflow: hidden; border: 1px solid var(--border-m); box-shadow: var(--shadow);
}
.portrait-wrap img { width: 100%; height: 100%; object-fit: cover; filter: saturate(0.9) contrast(1.05); }
.portrait-wrap::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(10,10,11,0.92) 100%);
}
.portrait-caption { position: absolute; left: 20px; right: 20px; bottom: 18px; z-index: 2; }
.portrait-caption .p-name { font-size: 26px; font-weight: 300; color: var(--cream); letter-spacing: -0.01em; }
.portrait-caption .p-role { font-size: 11px; color: var(--dim-m); margin-top: 3px; }

/* ── Campaign Banner ── */
.campaign-wrap {
  max-width: 1280px; margin: 0 auto;
  padding: 0 clamp(20px,5vw,64px) clamp(52px,7vw,80px); position: relative; z-index: 1;
}
.campaign-card {
  border-radius: 18px; overflow: hidden; border: 1px solid var(--border-m); background: var(--surface);
  height: 300px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow);
}
.campaign-card img { width: 100%; height: 300px; object-fit: cover; object-position: center; opacity: 0.85; }

/* ── Step System ── */
.step-container { max-width: 820px; margin: 0 auto; padding: 0 clamp(20px,5vw,64px) 100px; position: relative; z-index: 1; }

.progress-bar { display: flex; align-items: center; margin-bottom: 40px; }
.ps { display: flex; align-items: center; gap: 10px; }
.ps-num {
  width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center;
  font-size: 11.5px; font-weight: 700; font-family: var(--mono);
  border: 1.5px solid var(--border-m); color: var(--dim); transition: all .3s;
}
.ps-label { font-size: 10.5px; font-weight: 600; color: var(--dim); letter-spacing: 0.06em; text-transform: uppercase; transition: color .3s; }
.ps.active .ps-num  { background: var(--gold); border-color: var(--gold); color: #0a0a0b; }
.ps.active .ps-label { color: var(--text); }
.ps.done .ps-num  { background: var(--gold-dim); border-color: rgba(200,168,75,0.4); color: var(--gold-soft); }
.ps.done .ps-label { color: var(--gold-soft); }
.ps-line { flex: 1; height: 1px; background: var(--border); margin: 0 12px; }

.step-panel { display: none; }
.step-panel.active { display: block; animation: stepIn .38s cubic-bezier(0.16,1,0.3,1) both; }
@keyframes stepIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

/* Auth card */
.auth-card {
  background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 40px; display: flex; align-items: center; justify-content: space-between; gap: 36px; flex-wrap: wrap;
}
.auth-title { font-size: 17px; font-weight: 700; color: var(--cream); margin-bottom: 10px; }
.auth-desc { font-size: 13.5px; color: var(--dim-m); max-width: 46ch; line-height: 1.7; margin-bottom: 8px; }
.auth-rule { font-size: 12px; color: var(--dim); }
.auth-right { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; min-width: 220px; }
.gsi-loading { display: none; font-size: 12.5px; color: var(--gold); font-weight: 600; align-items: center; }
.err-auth { font-size: 12.5px; color: #d97b6a; margin-top: 8px; }

/* Blocked card */
.blocked-card {
  background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 52px 40px; text-align: center;
}
.blocked-card .b-icon { font-size: 2.2rem; margin-bottom: 16px; }
.blocked-card h3 { font-size: 16px; font-weight: 700; color: var(--cream); margin-bottom: 10px; }
.blocked-card p { color: var(--dim-m); font-size: 13.5px; margin-bottom: 24px; }
.countdown-row { display: flex; justify-content: center; gap: 12px; margin-bottom: 24px; }
.c-tile { background: var(--raised); border: 1px solid var(--border); border-radius: 10px; padding: 16px 22px; text-align: center; min-width: 88px; }
.c-tile .num { font-family: var(--mono); font-size: 26px; font-weight: 700; color: var(--gold); }
.c-tile .lbl { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--dim); margin-top: 5px; }

/* Form card */
.form-card { background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 36px 40px; }
.form-heading { margin-bottom: 26px; }
.form-heading h3 { font-size: 16px; font-weight: 700; color: var(--cream); margin-bottom: 5px; }
.form-heading p { font-size: 13px; color: var(--dim-m); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.field { display: flex; flex-direction: column; gap: 7px; }
.field.full { grid-column: 1 / -1; }
.field label { font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em; color: var(--dim-m); text-transform: uppercase; }
.field input, .field select, .field textarea {
  background: var(--raised); border: 1px solid var(--border-m); border-radius: 9px;
  padding: 12px 14px; color: var(--text); font-size: 13.5px; font-family: var(--font);
  transition: border-color .2s, box-shadow .2s; outline: none;
}
.field input::placeholder, .field textarea::placeholder { color: var(--dim); }
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(200,168,75,0.1); }
.field select {
  appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236e6a62'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 14px center;
}
.field textarea { resize: vertical; min-height: 88px; }
.char-counter { align-self: flex-end; font-size: 10.5px; color: var(--dim); font-family: var(--mono); }
.char-counter.warn { color: var(--err); }
.dropzone {
  border: 1.5px dashed var(--border-m); border-radius: 11px; padding: 28px 20px;
  text-align: center; cursor: pointer; position: relative;
  transition: border-color .2s, background .2s;
}
.dropzone:hover, .dropzone.drag { border-color: var(--gold); background: var(--gold-glow); }
.dropzone input[type="file"] { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
.dropzone .dz-icon { margin: 0 auto 10px; width: 32px; height: 32px; }
.dropzone .dz-title { font-size: 13.5px; font-weight: 600; margin-bottom: 4px; }
.dropzone .dz-sub { font-size: 12px; color: var(--dim-m); }
.dropzone.filled { border-style: solid; border-color: var(--gold); background: var(--gold-glow); }
.dz-file { display: none; align-items: center; justify-content: center; gap: 10px; font-size: 13px; }
.dz-file .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); }
.consent { display: flex; align-items: flex-start; gap: 12px; }
.consent input[type="checkbox"] {
  appearance: none; width: 18px; height: 18px; flex: 0 0 auto; margin-top: 2px;
  border: 1.5px solid var(--border-m); border-radius: 5px; background: var(--raised);
  display: grid; place-items: center; cursor: pointer; transition: border-color .15s;
}
.consent input::after { content: ""; width: 9px; height: 9px; border-radius: 2px; background: var(--gold); transform: scale(0); transition: transform .15s; }
.consent input:checked { border-color: var(--gold); }
.consent input:checked::after { transform: scale(1); }
.consent label { font-size: 12.5px; color: var(--dim-m); line-height: 1.6; cursor: pointer; }
.consent a { color: var(--gold-soft); text-decoration: underline; }
.err-msg { background: rgba(196,92,74,0.1); border: 1px solid rgba(196,92,74,0.28); border-radius: 9px; padding: 10px 14px; font-size: 12.5px; color: #d97b6a; display: none; margin-bottom: 14px; }
.submit-row { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; align-items: center; }

/* Buttons */
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px; padding: 13px 26px; border-radius: 9px;
  background: var(--gold); color: #0a0a0b; font-weight: 800; font-size: 13.5px;
  box-shadow: 0 6px 20px -6px rgba(200,168,75,0.4); transition: transform .15s, box-shadow .15s; cursor: pointer;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 26px -5px rgba(200,168,75,0.45); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-ghost-sm {
  padding: 11px 20px; border: 1px solid var(--border-m); border-radius: 9px;
  font-size: 12.5px; font-weight: 600; color: var(--dim-m); transition: border-color .2s, color .2s;
}
.btn-ghost-sm:hover { border-color: var(--gold); color: var(--text); }

/* Footer */
footer {
  border-top: 1px solid var(--border); padding: 36px clamp(20px,5vw,64px);
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 18px;
  position: relative; z-index: 1;
}
.footer-copy { font-size: 11.5px; color: var(--dim); line-height: 1.9; }
.footer-copy a { color: var(--dim-m); text-decoration: underline; }
.footer-copy a:hover { color: var(--gold-soft); }
.socials { display: flex; gap: 8px; }
.socials a {
  width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border-m);
  display: grid; place-items: center; color: var(--dim-m);
  transition: border-color .2s, color .2s, transform .15s;
}
.socials a:hover { border-color: var(--gold); color: var(--gold-soft); transform: translateY(-2px); }
.socials svg { width: 15px; height: 15px; }

/* Overlays / Modals */
.overlay {
  position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.75); backdrop-filter: blur(7px);
  display: none; align-items: center; justify-content: center; padding: 20px;
}
.overlay.open { display: flex; animation: fadeIn .2s ease; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.modal-box {
  background: var(--panel); border: 1px solid var(--border-m); border-radius: 20px;
  box-shadow: var(--shadow); animation: modalIn .3s cubic-bezier(0.16,1,0.3,1);
}
@keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }

/* Welcome modal */
.welcome-banner { position: relative; height: 190px; overflow: hidden; border-radius: 18px 18px 0 0; }
.welcome-banner img { width: 100%; height: 190px; object-fit: cover; opacity: 0.7; }
.welcome-banner::after { content:""; position:absolute; inset:0; background:linear-gradient(to top, var(--panel) 0%, transparent 55%); }
.welcome-live-tag {
  position: absolute; bottom: 14px; left: 18px; z-index: 2;
  background: var(--gold); color: #0a0a0b; font-weight: 800; font-size: 10px;
  letter-spacing: 0.12em; text-transform: uppercase; padding: 5px 12px; border-radius: 999px;
}
.welcome-body { padding: 26px 28px 22px; }
.welcome-logo { margin-bottom: 18px; }
.welcome-logo img { height: 17px; }
.welcome-heading { font-size: 22px; font-weight: 900; color: var(--cream); margin-bottom: 12px; line-height: 1.2; text-transform: uppercase; letter-spacing: -0.01em; }
.welcome-heading span { color: var(--gold); }
.welcome-text { font-size: 13px; color: var(--dim-m); line-height: 1.8; }
.welcome-actions { display: flex; gap: 10px; align-items: center; padding: 0 28px 26px; }
.welcome-skip { font-size: 12px; color: var(--dim); cursor: pointer; padding: 13px 0; }
.welcome-skip:hover { color: var(--dim-m); }

/* Success modal */
.success-icon { width: 52px; height: 52px; border-radius: 50%; margin: 0 auto 18px; background: var(--gold-dim); border: 1px solid rgba(200,168,75,0.3); display: grid; place-items: center; color: var(--gold-soft); font-size: 1.4rem; }

/* Login modal */
.login-title { font-size: 15px; font-weight: 700; color: var(--cream); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.01em; }
.login-sub { font-size: 12.5px; color: var(--dim-m); margin-bottom: 22px; }
.login-field { margin-bottom: 14px; }
.login-field label { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dim-m); margin-bottom: 7px; }
.login-field input {
  width: 100%; background: var(--raised); border: 1px solid var(--border-m); border-radius: 9px;
  padding: 12px 14px; color: var(--text); font-family: var(--font); font-size: 13.5px; outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.login-field input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(200,168,75,0.1); }
.login-err { font-size: 12px; color: #d97b6a; margin-bottom: 12px; display: none; }

/* Admin Dashboard */
.admin-dashboard { display: none; position: fixed; inset: 0; z-index: 300; background: var(--bg); overflow: hidden; }
.admin-dashboard.open { display: grid; grid-template-columns: 220px 1fr; animation: fadeIn .2s ease; }
.admin-sidebar { background: var(--surface); border-right: 1px solid var(--border); padding: 20px 14px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
.admin-logo { background: var(--cream); border-radius: 7px; padding: 6px 10px; display: inline-flex; margin-bottom: 24px; }
.admin-logo img { height: 18px; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 9px; font-size: 13px; font-weight: 600; color: var(--dim-m); cursor: pointer; transition: background .15s, color .15s; }
.nav-item svg { width: 16px; height: 16px; flex: 0 0 auto; }
.nav-item:hover { background: var(--raised); color: var(--text); }
.nav-item.active { background: var(--gold-dim); color: var(--gold-soft); }
.nav-badge { margin-left: auto; background: var(--gold); color: #0a0a0b; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 999px; font-family: var(--mono); }
.nav-sep { height: 1px; background: var(--border); margin: 10px 0; }
.sidebar-user { margin-top: auto; display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 9px; border: 1px solid var(--border); }
.user-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--gold-dim); border: 1px solid rgba(200,168,75,0.2); display: grid; place-items: center; font-size: 11px; font-weight: 800; color: var(--gold-soft); flex: 0 0 auto; }
.user-name { font-size: 12px; font-weight: 700; color: var(--text); }
.user-role-txt { font-size: 10.5px; color: var(--dim); }
.logout-btn { margin-left: auto; color: var(--dim); padding: 4px; transition: color .15s; }
.logout-btn:hover { color: var(--err); }
.admin-main { padding: 28px 32px 80px; overflow-y: auto; height: 100vh; }
.admin-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
.admin-topbar h1 { font-size: 20px; font-weight: 900; text-transform: uppercase; color: var(--cream); }
.admin-topbar .sub { font-size: 12px; color: var(--dim-m); margin-top: 3px; }
.back-btn { display: flex; align-items: center; gap: 8px; padding: 9px 16px; border: 1px solid var(--border-m); border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--dim-m); transition: border-color .2s, color .2s; }
.back-btn:hover { border-color: var(--gold); color: var(--text); }
.stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 24px; }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 18px; display: flex; align-items: center; justify-content: space-between; }
.stat-label { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--dim); font-weight: 700; }
.stat-value { font-size: 26px; font-weight: 700; color: var(--cream); font-family: var(--mono); margin-top: 5px; }
.stat-icon { width: 36px; height: 36px; border-radius: 9px; background: var(--gold-dim); display: grid; place-items: center; color: var(--gold-soft); }
.stat-icon svg { width: 17px; height: 17px; }
.data-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 18px; }
.data-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 10px; }
.data-head h2 { font-size: 12.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--cream); }
table { width: 100%; border-collapse: collapse; }
thead th { text-align: left; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dim); padding: 11px 20px; border-bottom: 1px solid var(--border); font-weight: 700; }
tbody td { padding: 13px 20px; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: rgba(255,255,255,0.015); }
.user-cell { display: flex; align-items: center; gap: 10px; }
.mini-av { width: 28px; height: 28px; border-radius: 50%; background: var(--gold-dim); border: 1px solid rgba(200,168,75,0.2); display: grid; place-items: center; font-size: 10px; font-weight: 800; color: var(--gold-soft); flex: 0 0 auto; }
.uname { font-weight: 700; font-size: 13px; color: var(--cream); }
.uhandle { font-size: 11px; color: var(--dim-m); }
.pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; font-size: 10.5px; font-weight: 700; }
.pill .dot { width: 5px; height: 5px; border-radius: 50%; }
.pill.wait { background: rgba(200,168,75,0.1); color: var(--gold-soft); border: 1px solid rgba(200,168,75,0.3); }
.pill.wait .dot { background: var(--gold); }
.pill.ok { background: rgba(94,184,126,0.1); color: #7ddc8f; border: 1px solid rgba(94,184,126,0.3); }
.pill.ok .dot { background: var(--ok); }
.pnl-btn { background: var(--gold-dim); color: var(--gold-soft); border: 1px solid rgba(200,168,75,0.22); padding: 6px 12px; border-radius: 7px; font-size: 11.5px; font-weight: 700; cursor: pointer; transition: .15s; }
.pnl-btn:hover { background: var(--gold); color: #0a0a0b; border-color: var(--gold); }
.dnger-btn { background: rgba(196,92,74,0.08); color: #d97b6a; border: 1px solid rgba(196,92,74,0.25); padding: 6px 12px; border-radius: 7px; font-size: 11.5px; font-weight: 700; cursor: pointer; transition: .15s; }
.dnger-btn:hover { background: rgba(196,92,74,0.18); }
.panel-input-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
.panel-input { flex: 1; background: var(--raised); border: 1px solid var(--border-m); border-radius: 8px; padding: 10px 12px; color: var(--text); font-family: var(--font); font-size: 13px; outline: none; min-width: 130px; }
.panel-input:focus { border-color: var(--gold); }
.empty-state { color: var(--dim-m); text-align: center; padding: 36px; font-size: 13px; }
.play-circle-btn { width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border-m); background: var(--raised); color: var(--gold-soft); font-size: 0.85rem; display: grid; place-items: center; cursor: pointer; transition: all .2s; }
.play-circle-btn:hover { background: var(--gold); color: #0a0a0b; border-color: var(--gold); }

/* Audio Bar */
#audio-bar {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(120px);
  width: 90%; max-width: 860px;
  background: rgba(17,16,19,0.94); backdrop-filter: blur(22px);
  border: 1px solid var(--border-m); border-radius: 999px;
  padding: 10px 22px; z-index: 400;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.9);
  opacity: 0; pointer-events: none;
  transition: transform .5s cubic-bezier(0.16,1,0.3,1), opacity .5s ease;
}
#audio-bar.visible { transform: translateX(-50%) translateY(0); opacity: 1; pointer-events: auto; }
.ab-info { flex: 1.5; min-width: 100px; overflow: hidden; }
.ab-title { font-size: 12.5px; font-weight: 700; color: var(--cream); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ab-artist { font-size: 11px; color: var(--dim-m); }
.ab-controls { display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 2; max-width: 360px; }
.ab-btns { display: flex; align-items: center; gap: 8px; }
.ab-btn { background: none; border: none; color: var(--dim-m); font-size: 1rem; cursor: pointer; padding: 3px; transition: color .15s; }
.ab-btn:hover { color: var(--gold-soft); }
.ab-play-btn { width: 34px; height: 34px; border-radius: 50%; background: var(--gold); border: none; color: #0a0a0b; font-size: 0.9rem; cursor: pointer; display: grid; place-items: center; transition: transform .15s; }
.ab-play-btn:hover { transform: scale(1.08); }
.ab-seek-row { display: flex; align-items: center; gap: 8px; width: 100%; }
.ab-time { font-size: 10px; color: var(--dim); width: 30px; font-family: var(--mono); }
.ab-seek { flex: 1; accent-color: var(--gold); height: 3px; cursor: pointer; }
.ab-tag { font-size: 10px; color: var(--dim-m); font-family: var(--mono); white-space: nowrap; }
.ab-vol-wrap { display: flex; align-items: center; gap: 6px; margin-right: 6px; }
.ab-vol { width: 60px; accent-color: var(--gold); height: 3px; cursor: pointer; }
.ab-close { background: none; border: none; color: var(--dim); font-size: 1.2rem; cursor: pointer; }
.ab-close:hover { color: var(--text); }

/* Responsive */
@media (max-width: 820px) {
  .hero { grid-template-columns: 1fr; }
  .hero-visual { order: -1; }
  .hero-badge { display: none; }
  .form-grid { grid-template-columns: 1fr; }
  .auth-card { flex-direction: column; align-items: stretch; text-align: center; }
  .auth-right { align-items: center; }
  .admin-dashboard.open { grid-template-columns: 1fr; }
  .admin-sidebar { display: none; }
  .stats-row { grid-template-columns: 1fr; }
  .ps-label { display: none; }
}
</style>
</head>
<body>

<div class="noise"></div>

<!-- HEADER -->
<header>
  <div class="brand">
    <div class="logo-chip">
      <picture>
        <source srcset="assets/mais-logo.webp" type="image/webp">
        <img src="assets/mais-logo.png" alt="MAIS Studio" width="110" height="20" loading="eager">
      </picture>
    </div>
    <span class="brand-label">Sizden Gelenler</span>
  </div>
  <button class="staff-btn" id="staff-btn" onclick="handleStaffBtnClick()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
    <span id="staff-btn-label">Yetkili Girişi</span>
  </button>
</header>

<!-- HERO -->
<section class="hero" aria-labelledby="hero-title">
  <div class="hero-copy">
    <div class="eyebrow"><span class="eyebrow-line"></span>Sezon 2 &middot; Canlı Başvuru</div>
    <h1 class="hero-title" id="hero-title">Sizden<br><span class="accent">Gelenler</span></h1>
    <p class="hero-lead">Selam! Yapay zeka ile müzik mi üretiyorsun? Harika, tam yerine geldin! Mustafa İnce her hafta sizden gelen parçaları tek tek dinliyor ve en iyilerini binlerce kişiyle paylaşıyor. Hadi, vakit kaybetmeden parçanı bize gönder!</p>
    <div class="hero-actions">
      <a class="btn-cta" href="#basvuru">
        Hemen Başvur 🚀
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
      <div class="quota-chip">
        <div>
          <div class="quota-label">Kalan Hak</div>
          <div class="quota-value" id="main-quota">—</div>
        </div>
      </div>
    </div>
  </div>
  <div class="hero-visual">
    <div class="hero-badge"><span class="badge-dot"></span><span class="badge-txt">On Air</span></div>
    <div class="portrait-wrap">
      <picture>
        <source srcset="assets/host.webp" type="image/webp">
        <img src="assets/host.jpg" alt="Mustafa İnce" width="900" height="972" loading="eager" fetchpriority="high">
      </picture>
      <div class="portrait-caption">
        <div class="p-name">Mustafa İnce</div>
        <div class="p-role">MAIS Studio Yönetimi</div>
      </div>
    </div>
  </div>
</section>

<!-- CAMPAIGN BANNER -->
<div class="campaign-wrap">
  <div class="campaign-card">
    <img src="assets/season-plate-v2.jpg" alt="Sezon 2 · Sizden Gelenler" width="1280" height="300" loading="lazy">
  </div>
</div>

<!-- STEP FLOW -->
<div class="step-container" id="basvuru">

  <div class="progress-bar" id="progress-bar">
    <div class="ps active" id="ps-1"><div class="ps-num">01</div><div class="ps-label">Önce Sen 🤝</div></div>
    <div class="ps-line"></div>
    <div class="ps" id="ps-2"><div class="ps-num">02</div><div class="ps-label">Parçanın Sesi 🎧</div></div>
    <div class="ps-line"></div>
    <div class="ps" id="ps-3"><div class="ps-num">03</div><div class="ps-label">İşte Bu! 🎉</div></div>
  </div>

  <!-- Step 1: Auth -->
  <div class="step-panel active" id="panel-auth">
    <div class="auth-card">
      <div class="auth-left">
        <div class="auth-title">Önce Seni Tanıyalım 🤝</div>
        <p class="auth-desc">Haftalık kontenjanları adil bir şekilde dağıtabilmemiz için ufak bir güvenlik adımımız var. Google hesabınla güvenli bir şekilde giriş yap ve hemen başvuruna başlayalım!</p>
        <p class="auth-rule">Not: Herkese şans verebilmek için haftada sadece 1 başvuru kabul ediyoruz.</p>
      </div>
      <div class="auth-right">
        <div id="gsi-btn"></div>
        <div class="gsi-loading" id="gsi-loading" style="display:none;"><span class="spin"></span>Doğrulanıyor...</div>
        <div class="err-auth" id="err-auth" style="display:none;"></div>
      </div>
    </div>
  </div>

  <!-- Step 1b: Blocked -->
  <div class="step-panel" id="panel-blocked">
    <div class="blocked-card">
      <div class="b-icon">⏳</div>
      <h3>Eyvah, Bu Haftalık Hakkını Doldurdun!</h3>
      <p>Harika parçalar ürettiğini biliyoruz ama herkese şans verebilmek için haftada sadece 1 başvuru kabul edebiliyoruz. Süren dolduğunda seni burada bekliyor olacağız!</p>
      <div class="countdown-row">
        <div class="c-tile"><div class="num mono" id="countdown-days">--</div><div class="lbl">Gün</div></div>
        <div class="c-tile"><div class="num mono" id="countdown-hours">--</div><div class="lbl">Saat</div></div>
      </div>
      <button class="btn-ghost-sm" onclick="resetFlow()">← Geri Dön</button>
    </div>
  </div>

  <!-- Step 2: Form -->
  <div class="step-panel" id="panel-form">
    <div class="form-card">
      <div class="form-heading">
        <h3>Parçanın Detayları Neler? 🎧</h3>
        <p style="color:var(--dim-m);font-size:13px;">Müziğini dinlemek için sabırsızlanıyoruz! Bize biraz parçandan ve kendinden bahset.</p>
      </div>
      <div class="err-msg" id="err-form"></div>
      <div class="form-grid">
        <div class="field"><label for="fullName">Adın Soyadın (Nasıl Hitap Edelim?) *</label><input type="text" id="fullName" required placeholder="Adın Soyadın"></div>
        <div class="field"><label for="social">Sosyal Medya Hesabın (Seni Nerede Bulabiliriz?) *</label><input type="text" id="social" required placeholder="@kullaniciadi"></div>
        <div class="field">
          <label for="aiTool">Yapay Zeka Aracı *</label>
          <select id="aiTool" required>
            <option value="">Seçiniz</option>
            <option>Suno</option><option>Udio</option><option>AIVA</option><option>Boomy</option>
            <option>Mureka</option><option>Stable Audio</option><option>ElevenLabs Music</option>
            <option>Soundraw</option><option>Beatoven.ai</option><option>Minimax Music</option>
            <option>Google Lyria</option><option>Sonauto</option><option>Diğer</option>
          </select>
        </div>
        <div class="field"><label for="trackName">Parça Adı *</label><input type="text" id="trackName" required placeholder="Parçanızın adı"></div>
        <div class="field full">
          <label for="note">Bize Biraz Parçandan Bahset * <span style="text-transform:none;font-weight:400;">— hikayesi, hissi... Ne varsa yaz! (maks. 210 karakter)</span></label>
          <textarea id="note" maxlength="210" required placeholder="Bu parça nasıl ortaya çıktı? İlham kaynağın neydi?..." oninput="updateCharCount(this)"></textarea>
          <span class="char-counter"><span id="charNum">0</span> / 210</span>
        </div>
        <div class="field full">
          <label>MP3 Dosyanı Buraya Bırak 🎶 * <span style="text-transform:none;font-weight:400;">— maks. <span id="max-upload-label">10 MB</span></span></label>
          <div class="dropzone" id="upload-zone">
            <input type="file" id="mp3file" accept=".mp3,audio/mpeg" onchange="handleFile(this)">
            <svg class="dz-icon" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" stroke-width="1.4"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
            <div class="dz-title">MP3 şaheserini sürükle veya tıkla</div>
            <div class="dz-sub">Sadece .mp3 formatı kabul ediyoruz (en fazla <span id="max-upload-help">10 MB</span>)</div>
            <div class="dz-file" id="dz-file-info"><span class="dot"></span><span id="file-name"></span></div>
          </div>
        </div>
        <div class="field full">
          <div class="consent">
            <input type="checkbox" id="chk">
            <label for="chk">Gönderdiğim bu şaheserin tüm telif haklarının bana ait olduğunu onaylıyorum. Parçam seçilirse, MAIS Studio ve Mustafa İnce kanallarında gururla yayınlanmasına izin veriyorum! 🚀</label>
          </div>
        </div>
        <div class="field full">
          <div class="consent">
            <input type="checkbox" id="kvkk">
            <label for="kvkk"><a href="privacy.html" target="_blank">Aydınlatma Metni</a>'ni okudum, anladım ve kişisel verilerimin işlenmesine gönül rahatlığıyla onay veriyorum.</label>
          </div>
        </div>
      </div>
      <div class="submit-row">
        <button class="btn-ghost-sm" onclick="resetFlow()">← Geri</button>
        <button class="btn-primary" id="btn-submit" onclick="submitForm()">Parçamı Gönder! 🚀</button>
      </div>
    </div>
  </div>

</div>

<!-- FOOTER -->
<footer>
  <div class="footer-copy">
    <div>© 2026 Mustafa İnce · MAIS Studio — Sizden Gelenler Sezon 2</div>
    <div><a href="privacy.html">Gizlilik Politikası</a> &middot; <a href="terms.html">Kullanım Şartları</a></div>
  </div>
  <div class="socials">
    <a href="https://www.instagram.com/mustafaincemuzik/" target="_blank" rel="noopener" aria-label="Instagram">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>
    </a>
    <a href="https://www.youtube.com/@mustafaincemuzik" target="_blank" rel="noopener" aria-label="YouTube">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="6" width="20" height="12" rx="3"/><path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none"/></svg>
    </a>
    <a href="https://open.spotify.com/intl-tr/artist/5xcsIUfaETr2SFBiGtemrp" target="_blank" rel="noopener" aria-label="Spotify">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M7 10c3-1 7-1 10 1M7.5 13c2.5-.8 5.5-.8 8 .6M8 16c2-.6 4.5-.6 6.5.6" stroke-linecap="round"/></svg>
    </a>
    <a href="https://www.instagram.com/mustiaistudyo/" target="_blank" rel="noopener" aria-label="MAIS Studio Instagram">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
    </a>
  </div>
</footer>

<!-- WELCOME MODAL -->
<div class="overlay" id="welcome-modal" role="dialog" aria-modal="true" aria-label="Hoş Geldiniz">
  <div class="modal-box" style="max-width:540px;width:100%;overflow:hidden;">
    <div class="welcome-banner">
      <img src="assets/season-plate-v2.jpg" alt="Sezon 2">
      <div class="welcome-live-tag">● Sezon 2 · Canlı</div>
    </div>
    <div class="welcome-body">
      <div class="welcome-logo">
        <picture><source srcset="assets/mais-logo.webp" type="image/webp"><img src="assets/mais-logo.png" alt="MAIS Studio" height="17"></picture>
      </div>
      <div class="welcome-heading">Sizden <span>Gelenler</span></div>
      <p class="welcome-text">Selam! Yapay zeka ile müzik mi üretiyorsun? Harika, tam yerine geldin! Mustafa İnce her hafta sizden gelen parçaları tek tek dinliyor ve en iyilerini binlerce kişiyle paylaşıyor.<br><br>Hadi, vakit kaybetmeden Google hesabınla giriş yap ve parçanı bize gönder!</p>
    </div>
    <div class="welcome-actions">
      <button class="btn-primary" onclick="closeWelcome()" style="flex:1;justify-content:center;">Hadi Başlayalım! 🚀</button>
      <button class="welcome-skip" onclick="closeWelcome()">Kapat</button>
    </div>
  </div>
</div>

<!-- SUCCESS MODAL -->
<div class="overlay" id="success-modal" role="dialog" aria-modal="true">
  <div class="modal-box" style="max-width:400px;width:100%;padding:40px;text-align:center;">
    <div class="success-icon">✓</div>
    <div style="font-size:17px;font-weight:800;text-transform:uppercase;color:var(--cream);margin-bottom:10px;">İşte Bu Kadar! 🎉</div>
    <p style="font-size:13px;color:var(--dim-m);line-height:1.8;margin-bottom:22px;">Harika, parçanı teslim aldık! Şaheserin güvenli ellerde ve değerlendirme listemizde yerini aldı bile. Stüdyoda hep birlikte dinlemek için sabırsızlanıyoruz. Haftaya yepyeni bir parçayla tekrar görüşmek üzere!</p>
    <button class="btn-primary" style="width:100%;justify-content:center;" onclick="closeModal('success-modal');resetFlow()">Harika, Görüşürüz! 👋</button>
  </div>
</div>

<!-- LOGIN MODAL -->
<div class="overlay" id="login-modal" role="dialog" aria-modal="true">
  <div class="modal-box" style="max-width:360px;width:100%;padding:32px;">
    <div class="login-title">Yetkili Girişi</div>
    <div class="login-sub">MAIS Studio yönetim paneline erişin.</div>
    <div class="login-err" id="login-err"></div>
    <div class="login-field"><label>Kullanıcı Adı</label><input type="text" id="login-username" placeholder="kullanici.adi" autocomplete="username" onkeydown="if(event.key==='Enter')doLogin()"></div>
    <div class="login-field" style="margin-top:12px;"><label>Şifre</label><input type="password" id="login-password" placeholder="••••••••" autocomplete="current-password" onkeydown="if(event.key==='Enter')doLogin()"></div>
    <button class="btn-primary" id="login-btn" onclick="doLogin()" style="width:100%;justify-content:center;margin-top:18px;">Giriş Yap</button>
    <div style="text-align:center;margin-top:12px;"><button style="font-size:12px;color:var(--dim);cursor:pointer;" onclick="closeModal('login-modal')">Vazgeç</button></div>
  </div>
</div>

<!-- ADMIN DASHBOARD -->
<div class="admin-dashboard" id="admin-dashboard">
  <aside class="admin-sidebar">
    <div class="admin-logo"><picture><source srcset="assets/mais-logo.webp" type="image/webp"><img src="assets/mais-logo.png" alt="MAIS" height="18"></picture></div>
    <div class="nav-item active" id="nav-inbox" onclick="switchAdminTab('inbox')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>Gelen Kutusu <span class="nav-badge" id="inbox-count">0</span></div>
    <div class="nav-item" id="nav-reviewed" onclick="switchAdminTab('reviewed')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>Geçmiş</div>
    <div class="nav-item" id="nav-limits" onclick="switchAdminTab('limits')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Bekleme Süresi</div>
    <div class="nav-item" id="nav-accounts" onclick="switchAdminTab('accounts')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Hesaplar</div>
    <div class="nav-item" id="nav-special" onclick="switchAdminTab('special')" style="display:none;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Özel Gelenler</div>
    <div class="nav-sep"></div>
    <div class="nav-item" id="nav-settings" onclick="switchAdminTab('settings')" style="display:none;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>Ayarlar</div>
    <div class="sidebar-user">
      <div class="user-avatar" id="panel-avatar">Mİ</div>
      <div><div class="user-name" id="panel-username">Yetkili</div><div class="user-role-txt">MAIS Studio</div></div>
      <button class="logout-btn" title="Çıkış" onclick="clearStaff()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg></button>
    </div>
  </aside>
  <div class="admin-main">
    <div class="admin-topbar">
      <div><h1 id="admin-page-title">Gelen Kutusu</h1><div class="sub">Sezon 2 · Sizden Gelenler</div></div>
      <button class="back-btn" onclick="hideAdminDashboard()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>Ana Sayfa</button>
    </div>
    <div class="stats-row">
      <div class="stat-card"><div><div class="stat-label">Bekleyen</div><div class="stat-value" id="stat-inbox">—</div></div><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-6l-2 3h-4l-2-3H2"/></svg></div></div>
      <div class="stat-card"><div><div class="stat-label">İncelendi</div><div class="stat-value" id="stat-reviewed">—</div></div><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></div></div>
      <div class="stat-card"><div><div class="stat-label">Toplam</div><div class="stat-value" id="stat-total">—</div></div><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div></div>
    </div>
    <div id="tab-inbox" class="admin-tab-content">
      <div class="data-panel"><div class="data-head"><h2>Bekleyen Başvurular</h2></div><table><thead><tr><th style="width:44px;"></th><th>Parça / Sanatçı</th><th>İletişim / Tarih</th><th style="text-align:right;">İşlem</th></tr></thead><tbody id="inbox-body"><tr><td colspan="4" class="empty-state">Yükleniyor...</td></tr></tbody></table></div>
    </div>
    <div id="tab-reviewed" class="admin-tab-content" style="display:none;">
      <div class="data-panel"><div class="data-head"><h2>İncelenen Parçalar</h2></div><table><thead><tr><th style="width:44px;"></th><th>Parça / Sanatçı</th><th>İletişim / Tarih</th><th style="text-align:right;">İşlem</th></tr></thead><tbody id="reviewed-body"><tr><td colspan="4" class="empty-state">Yükleniyor...</td></tr></tbody></table></div>
    </div>
    <div id="tab-limits" class="admin-tab-content" style="display:none;">
      <div class="data-panel"><div class="data-head"><h2>Bekleme Süresi Olanlar</h2><button class="dnger-btn" onclick="resetAllLimits()">Tümünü Sıfırla</button></div><table><thead><tr><th>E-posta</th><th>Tarih</th><th style="text-align:right;">İşlem</th></tr></thead><tbody id="limits-body"><tr><td colspan="3" class="empty-state">Yükleniyor...</td></tr></tbody></table></div>
    </div>
    <div id="tab-accounts" class="admin-tab-content" style="display:none;">
      <div class="data-panel"><div class="data-head"><h2>Yetkili Hesaplar</h2></div>
        <div id="accounts-owner-section" style="padding:16px 20px;border-bottom:1px solid var(--border);">
          <div class="panel-input-row"><input type="text" class="panel-input" id="new-username" placeholder="Kullanıcı adı"><input type="password" class="panel-input" id="new-password" placeholder="Şifre"><button class="pnl-btn" onclick="addAccount()">Ekle</button></div>
        </div>
        <table><thead><tr><th>Kullanıcı</th><th>Yetki</th><th style="text-align:right;">İşlem</th></tr></thead><tbody id="accounts-body"><tr><td colspan="3" class="empty-state">Yükleniyor...</td></tr></tbody></table>
        <div style="padding:16px 20px;border-top:1px solid var(--border);">
          <p style="font-size:11px;color:var(--dim);margin-bottom:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Şifremi Değiştir</p>
          <div class="panel-input-row"><input type="password" class="panel-input" id="cur-pw" placeholder="Mevcut şifre"><input type="password" class="panel-input" id="new-pw" placeholder="Yeni şifre"><button class="pnl-btn" onclick="changePassword()">Güncelle</button></div>
          <div class="err-msg" id="pw-change-err" style="margin-top:8px;"></div>
          <div id="pw-change-ok" style="display:none;color:var(--ok);font-size:12px;margin-top:8px;">✓ Şifre güncellendi.</div>
        </div>
      </div>
    </div>
    <div id="tab-special" class="admin-tab-content" style="display:none;">
      <div class="data-panel"><div class="data-head"><h2>Özel Bölüm Başvuruları</h2></div><table><thead><tr><th style="width:44px;"></th><th>Parça / Sanatçı</th><th>İletişim / Tarih</th><th style="text-align:right;">İşlem</th></tr></thead><tbody id="special-body"><tr><td colspan="4" class="empty-state">Yükleniyor...</td></tr></tbody></table></div>
    </div>
    <div id="tab-settings" class="admin-tab-content" style="display:none;">
      <div class="data-panel"><div class="data-head"><h2>Özel Bölüm Ayarları</h2></div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:14px;">
          <div class="panel-input-row"><label style="font-size:11.5px;color:var(--dim-m);min-width:80px;align-self:center;">Durum:</label><select class="panel-input" id="cfg-active" style="max-width:130px;"><option value="true">Açık</option><option value="false">Kapalı</option></select></div>
          <div class="panel-input-row"><label style="font-size:11.5px;color:var(--dim-m);min-width:80px;align-self:center;">Başlık:</label><input type="text" class="panel-input" id="cfg-title" placeholder="Özel Konsept"></div>
          <div class="panel-input-row"><label style="font-size:11.5px;color:var(--dim-m);min-width:80px;align-self:center;">Max Kota:</label><input type="number" class="panel-input" id="cfg-quota" value="50" style="max-width:90px;"></div>
          <div style="display:flex;gap:10px;"><button class="pnl-btn" onclick="saveSpecialCfg()">Kaydet</button><button class="dnger-btn" onclick="resetSpecialQuota()">Kotayı Sıfırla</button></div>
          <div id="cfg-msg" style="display:none;color:var(--ok);font-size:12px;"></div>
          <div style="padding-top:14px;border-top:1px solid var(--border);">
            <div class="panel-input-row"><label style="font-size:11.5px;color:var(--dim-m);min-width:100px;align-self:center;">Drive Eşitleme:</label><button class="pnl-btn" onclick="syncDrive()">Eski Parçaları Çek</button></div>
            <p style="font-size:11px;color:var(--dim);margin-top:6px;">Drive'daki eski parçaları listeye ekler ve kotadan düşer.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- AUDIO BAR -->
<div id="audio-bar">
  <div class="ab-info"><div class="ab-title" id="ab-title">Parça seçilmedi</div><div class="ab-artist" id="ab-artist">—</div></div>
  <div class="ab-controls">
    <div class="ab-btns">
      <button class="ab-btn" onclick="skipBackward()">⏪</button>
      <button class="ab-btn" onclick="prevTrack()">⏮</button>
      <button class="ab-play-btn" id="ab-play" onclick="togglePlay()">▶</button>
      <button class="ab-btn" onclick="nextTrack()">⏭</button>
      <button class="ab-btn" onclick="skipForward()">⏩</button>
    </div>
    <div class="ab-seek-row">
      <span class="ab-time" id="ab-cur">0:00</span>
      <input type="range" class="ab-seek" id="ab-seek" min="0" max="100" value="0" oninput="seek(this.value)">
      <span class="ab-time" id="ab-dur">0:00</span>
    </div>
  </div>
  <span class="ab-tag mono" id="ab-tag"></span>
  <div class="ab-vol-wrap"><button class="ab-btn" onclick="toggleMute()" id="ab-mute">🔊</button><input type="range" class="ab-vol" id="ab-vol" min="0" max="100" value="100" oninput="changeVol(this.value)"></div>
  <button class="ab-close" onclick="closePlayer()">×</button>
</div>
<audio id="player" style="display:none;"></audio>

<script>
let googleToken='', staffToken=localStorage.getItem('staff_token')||'', staffUsername=localStorage.getItem('staff_username')||'', staffRole=localStorage.getItem('staff_role')||'', isSpecialMode=false, authenticated=false, siteConfig=null, maxUploadMb=10, maxUploadBytes=10*1024*1024;

(async function init(){
  if(!sessionStorage.getItem('welcome_seen')) openModal('welcome-modal');
  if(staffToken) setStaffLoggedIn(staffUsername,staffRole);
  try{
    const cfg=await fetch('/config').then(r=>r.json());
    siteConfig=cfg;
    if(Number.isInteger(cfg.maxUploadMb)&&cfg.maxUploadMb>=1&&cfg.maxUploadMb<=10){maxUploadMb=cfg.maxUploadMb;maxUploadBytes=maxUploadMb*1024*1024;}
    document.getElementById('max-upload-label').textContent=maxUploadMb+' MB';
    document.getElementById('max-upload-help').textContent=maxUploadMb+' MB';
    const q=cfg.quota;
    if(q) document.getElementById('main-quota').textContent=Math.max(0,(q.maxQuota||50)-(q.usedQuota||0))+' / '+(q.maxQuota||50);
    if(cfg.googleClientId){
      const sc=document.createElement('script');
      sc.src='https://accounts.google.com/gsi/client';
      sc.async=true; sc.defer=true;
      sc.onload=function(){
        google.accounts.id.initialize({client_id:cfg.googleClientId,callback:onGoogleLogin});
        google.accounts.id.renderButton(document.getElementById('gsi-btn'),{theme:'filled_black',size:'large',width:256,locale:'tr'});
      };
      document.head.appendChild(sc);
    }
  }catch(e){console.error('Init:',e);}
})();

function closeWelcome(){sessionStorage.setItem('welcome_seen','1');closeModal('welcome-modal');setTimeout(()=>document.getElementById('basvuru').scrollIntoView({behavior:'smooth',block:'start'}),300);}

function showPanel(id){document.querySelectorAll('.step-panel').forEach(p=>p.classList.remove('active'));const p=document.getElementById(id);if(p)p.classList.add('active');}
function setPS(step){for(let i=1;i<=3;i++){const el=document.getElementById('ps-'+i);if(!el)continue;el.classList.remove('active','done');if(i<step)el.classList.add('done');else if(i===step)el.classList.add('active');}}
function resetFlow(){authenticated=false;googleToken='';showPanel('panel-auth');setPS(1);}

function onGoogleLogin(resp){
  googleToken=resp.credential;
  document.getElementById('gsi-loading').style.display='flex';
  document.getElementById('gsi-btn').style.opacity='0.4';
  document.getElementById('gsi-btn').style.pointerEvents='none';
  fetch(isSpecialMode?'/check-special-limit':'/check-limit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:googleToken})})
  .then(r=>r.json()).then(data=>{
    document.getElementById('gsi-loading').style.display='none';
    document.getElementById('gsi-btn').style.opacity='1';
    document.getElementById('gsi-btn').style.pointerEvents='auto';
    if(data.error){const e=document.getElementById('err-auth');e.textContent=data.error;e.style.display='block';return;}
    if(!data.allowed){document.getElementById('countdown-days').textContent=String(data.days||0).padStart(2,'0');document.getElementById('countdown-hours').textContent=String(data.hours||0).padStart(2,'0');showPanel('panel-blocked');setPS(1);}
    else{if(data.name)document.getElementById('fullName').value=data.name;authenticated=true;showPanel('panel-form');setPS(2);document.getElementById('basvuru').scrollIntoView({behavior:'smooth',block:'start'});}
  }).catch(()=>{const e=document.getElementById('err-auth');e.textContent='Bağlantı hatası.';e.style.display='block';});
}

function handleFile(input){
  const f=input.files[0]; if(!f)return;
  if(f.size>maxUploadBytes){document.getElementById('err-form').textContent='Dosya '+maxUploadMb+' MB sınırını aşıyor.';document.getElementById('err-form').style.display='block';input.value='';return;}
  document.getElementById('err-form').style.display='none';
  const dz=document.getElementById('upload-zone');
  dz.classList.add('filled');
  dz.querySelector('.dz-icon').style.display='none';
  dz.querySelector('.dz-title').style.display='none';
  dz.querySelector('.dz-sub').style.display='none';
  document.getElementById('dz-file-info').style.display='flex';
  document.getElementById('file-name').textContent=f.name;
}
const dz=document.getElementById('upload-zone');
['dragover','dragenter'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag');}));
['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag');}));
dz.addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f&&f.name.toLowerCase().endsWith('.mp3')){document.getElementById('mp3file').files=e.dataTransfer.files;handleFile(document.getElementById('mp3file'));}});

function updateCharCount(el){const len=el.value.length;document.getElementById('charNum').textContent=len;document.querySelector('.char-counter').classList.toggle('warn',len>=200);}

async function submitForm(){
  if(!authenticated){showPanel('panel-auth');return;}
  const fullName=document.getElementById('fullName').value.trim();
  const social=document.getElementById('social').value.trim();
  const aiTool=document.getElementById('aiTool').value;
  const trackName=document.getElementById('trackName').value.trim();
  const note=document.getElementById('note').value.trim();
  const mp3=document.getElementById('mp3file').files[0];
  const consent=document.getElementById('chk').checked;
  const kvkk=document.getElementById('kvkk').checked;
  const ef=document.getElementById('err-form');
  ef.style.display='none';
  if(!fullName||!social||!aiTool||!trackName||!note){ef.textContent='Lütfen tüm alanları doldurun.';ef.style.display='block';return;}
  if(note.length<30){ef.textContent='Parça notu en az 30 karakter olmalıdır.';ef.style.display='block';return;}
  if(note.length>210){ef.textContent='Parça notu en fazla 210 karakter olabilir.';ef.style.display='block';return;}
  if(!mp3){ef.textContent='Lütfen bir MP3 dosyası seçin.';ef.style.display='block';return;}
  if(mp3.size>maxUploadBytes){ef.textContent='Dosya '+maxUploadMb+' MB sınırını aşıyor.';ef.style.display='block';return;}
  if(!consent){ef.textContent='Telif beyanını onaylamanız gerekmektedir.';ef.style.display='block';return;}
  if(!kvkk){ef.textContent='KVKK aydınlatma metnini onaylamanız gerekmektedir.';ef.style.display='block';return;}
  const btn=document.getElementById('btn-submit');
  btn.disabled=true; btn.innerHTML='<span class="spin"></span>Gönderiliyor...';
  const fd=new FormData();
  fd.append('token',googleToken);fd.append('fullName',fullName);fd.append('social',social);fd.append('aiTool',aiTool);fd.append('trackName',trackName);fd.append('note',note);fd.append('consent','true');fd.append('mp3',mp3);
  try{
    const res=await fetch(isSpecialMode?'/submit-special':'/submit',{method:'POST',body:fd});
    const data=await res.json();
    if(res.status===429){showPanel('panel-blocked');return;}
    if(!res.ok){ef.textContent=data.error||'Bir hata oluştu.';ef.style.display='block';return;}
    setPS(3); openModal('success-modal');
    fetch('/config').then(r=>r.json()).then(cfg=>{const q=isSpecialMode?cfg.specialConfig:cfg.quota;if(q)document.getElementById('main-quota').textContent=Math.max(0,(q.maxQuota||50)-(q.usedQuota||0))+' / '+(q.maxQuota||50);});
  }catch(e){ef.textContent='Bağlantı hatası. Tekrar deneyin.';ef.style.display='block';}
  finally{btn.disabled=false;btn.innerHTML='Parçamı Gönder! 🚀';}
}

function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o&&o.id!=='welcome-modal')o.classList.remove('open');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.overlay.open').forEach(m=>{if(m.id!=='welcome-modal')m.classList.remove('open');});});

function handleStaffBtnClick(){if(staffToken)openAdminDashboard();else{document.getElementById('login-err').style.display='none';document.getElementById('login-username').value='';document.getElementById('login-password').value='';openModal('login-modal');setTimeout(()=>document.getElementById('login-username').focus(),100);}}
async function doLogin(){
  const u=document.getElementById('login-username').value.trim();
  const p=document.getElementById('login-password').value;
  const btn=document.getElementById('login-btn'),err=document.getElementById('login-err');
  err.style.display='none';
  if(!u||!p){err.textContent='Kullanıcı adı ve şifre gereklidir.';err.style.display='block';return;}
  btn.disabled=true;btn.innerHTML='<span class="spin"></span>Giriş yapılıyor...';
  try{
    const res=await fetch('/api/staff/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
    const data=await res.json();
    if(!res.ok){err.textContent=data.error||'Giriş başarısız.';err.style.display='block';return;}
    staffToken=data.token;staffUsername=data.username;staffRole=data.role;
    localStorage.setItem('staff_token',staffToken);localStorage.setItem('staff_username',staffUsername);localStorage.setItem('staff_role',staffRole);
    setStaffLoggedIn(staffUsername,staffRole);closeModal('login-modal');openAdminDashboard();
  }catch(e){err.textContent='Bağlantı hatası.';err.style.display='block';}
  finally{btn.disabled=false;btn.innerHTML='Giriş Yap';}
}
function setStaffLoggedIn(u,r){document.getElementById('staff-btn-label').textContent='⚙ '+u;document.getElementById('staff-btn').classList.add('active');}
function clearStaff(){staffToken='';staffUsername='';staffRole='';['staff_token','staff_username','staff_role'].forEach(k=>localStorage.removeItem(k));document.getElementById('staff-btn-label').textContent='Yetkili Girişi';document.getElementById('staff-btn').classList.remove('active');hideAdminDashboard();}

function openAdminDashboard(){
  document.getElementById('panel-username').textContent=staffUsername+(staffRole==='owner'?' (Kurucu)':'');
  document.getElementById('panel-avatar').textContent=staffUsername.slice(0,2).toUpperCase();
  document.getElementById('accounts-owner-section').style.display=staffRole==='owner'?'block':'none';
  if(staffRole==='owner'){document.getElementById('nav-special').style.display='flex';document.getElementById('nav-settings').style.display='flex';}
  document.getElementById('admin-dashboard').classList.add('open');
  document.body.style.overflow='hidden';
  loadPanelData();
}
function hideAdminDashboard(){document.getElementById('admin-dashboard').classList.remove('open');document.body.style.overflow='';}
function switchAdminTab(name){
  document.querySelectorAll('.admin-tab-content').forEach(el=>el.style.display='none');
  document.querySelectorAll('[id^="nav-"]').forEach(n=>n.classList.remove('active'));
  const t=document.getElementById('tab-'+name);if(t)t.style.display='block';
  const n=document.getElementById('nav-'+name);if(n)n.classList.add('active');
  const titles={inbox:'Gelen Kutusu',reviewed:'Geçmiş',limits:'Bekleme Süresi',accounts:'Hesaplar',special:'Özel Gelenler',settings:'Ayarlar'};
  document.getElementById('admin-page-title').textContent=titles[name]||'Yönetim';
}

async function authFetch(url,body){const res=await fetch(url,{method:body!==null?'POST':'GET',headers:{'Content-Type':'application/json','Authorization':'Bearer '+staffToken},body:body!==null?JSON.stringify(body):undefined});if(res.status===401){clearStaff();throw new Error('Oturum sona erdi.');}return res.json();}
let panelData={},currentInboxList=[],currentReviewedList=[],currentSpecialList=[];
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

async function loadPanelData(){
  try{
    const res=await fetch('/api/admin/submissions',{headers:{'Authorization':'Bearer '+staffToken}});
    if(res.status===401||res.status===403){clearStaff();return;}
    const data=await res.json();panelData=data;
    const pending=data.submissions.filter(s=>s.status==='pending');
    const reviewed=data.submissions.filter(s=>s.status==='reviewed');
    document.getElementById('stat-inbox').textContent=pending.length;
    document.getElementById('stat-reviewed').textContent=reviewed.length;
    document.getElementById('stat-total').textContent=data.submissions.length;
    document.getElementById('inbox-count').textContent=pending.length;
    const ab=document.getElementById('accounts-body');ab.innerHTML='';
    (data.accounts||[]).forEach(acc=>{const act=acc.role!=='owner'&&staffRole==='owner'?'<button class="dnger-btn" style="padding:5px 10px;font-size:11px;" onclick="deleteAccount(\\''+acc.username+'\\')">Sil</button>':'—';ab.innerHTML+='<tr><td><div class="user-cell"><div class="mini-av">'+esc(acc.username[0]).toUpperCase()+'</div><div><div class="uname">'+esc(acc.username)+'</div></div></div></td><td><span class="pill ok"><span class="dot"></span>'+(acc.role==='owner'?'Kurucu':'Çalışan')+'</span></td><td style="text-align:right;">'+act+'</td></tr>';});
    const ib=document.getElementById('inbox-body');ib.innerHTML='';currentInboxList=pending;
    if(!currentInboxList.length){ib.innerHTML='<tr><td colspan="4" class="empty-state">Gelen kutusu boş.</td></tr>';}
    else{currentInboxList.forEach((s,i)=>{const ai=s.aiTool&&s.aiTool!=='Bilinmiyor'?' &middot; <span style="color:var(--gold-soft);">'+esc(s.aiTool)+'</span>':'';const dt=new Date(s.timestamp).toLocaleDateString('tr-TR');ib.innerHTML+='<tr style="cursor:pointer;" onclick="playFromList(\\'inbox\\','+i+')">'+'<td style="text-align:center;"><button class="play-circle-btn" id="btn-play-inbox-'+i+'" onclick="event.stopPropagation();playFromList(\\'inbox\\','+i+')">▶</button></td>'+'<td><div style="font-weight:700;color:var(--cream);">'+esc(s.trackName)+'</div><div style="font-size:11.5px;color:var(--dim-m);">'+esc(s.fullName)+ai+'</div></td>'+'<td><div style="font-size:12px;color:var(--dim-m);">'+esc(s.email)+'</div><div style="font-size:11px;color:var(--dim);">'+dt+'</div></td>'+'<td style="text-align:right;"><button class="pnl-btn" style="font-size:11.5px;padding:6px 12px;" onclick="event.stopPropagation();updateStatus(\\''+esc(s.id)+'\\',\\'reviewed\\')">İncelendi ✓</button></td></tr>';if(s.note)ib.innerHTML+='<tr><td colspan="4" style="padding:0;border:none;"><div style="font-size:11.5px;color:var(--dim-m);margin:0 16px 10px 68px;padding:9px;background:rgba(255,255,255,0.02);border-radius:8px;border-left:2px solid var(--gold-dim);">'+esc(s.note)+'</div></td></tr>';});}
    const rb=document.getElementById('reviewed-body');rb.innerHTML='';currentReviewedList=reviewed.slice(-15);
    if(!currentReviewedList.length){rb.innerHTML='<tr><td colspan="4" class="empty-state">Henüz incelenen parça yok.</td></tr>';}
    else{currentReviewedList.forEach((s,i)=>{const ai=s.aiTool&&s.aiTool!=='Bilinmiyor'?' &middot; <span style="color:var(--gold-soft);">'+esc(s.aiTool)+'</span>':'';const dt=new Date(s.timestamp).toLocaleDateString('tr-TR');rb.innerHTML+='<tr style="cursor:pointer;" onclick="playFromList(\\'reviewed\\','+i+')">'+'<td style="text-align:center;"><button class="play-circle-btn" id="btn-play-reviewed-'+i+'" onclick="event.stopPropagation();playFromList(\\'reviewed\\','+i+')">▶</button></td>'+'<td><div style="font-weight:700;color:var(--cream);">'+esc(s.trackName)+'</div><div style="font-size:11.5px;color:var(--dim-m);">'+esc(s.fullName)+ai+'</div></td>'+'<td><div style="font-size:12px;color:var(--dim-m);">'+esc(s.email)+'</div><div style="font-size:11px;color:var(--dim);">'+dt+'</div></td>'+'<td style="text-align:right;"><button class="dnger-btn" style="font-size:11px;padding:5px 10px;" onclick="event.stopPropagation();unreviewTrack(\\''+esc(s.id)+'\\')">Geri Al</button></td></tr>';});}
    currentSpecialList=data.specialSubmissions||[];const spb=document.getElementById('special-body');spb.innerHTML='';
    if(!currentSpecialList.length){spb.innerHTML='<tr><td colspan="4" class="empty-state">Özel bölümde gönderim yok.</td></tr>';}
    else{currentSpecialList.forEach((s,i)=>{const ai=s.aiTool&&s.aiTool!=='Bilinmiyor'?' &middot; <span style="color:var(--gold-soft);">'+esc(s.aiTool)+'</span>':'';const dt=new Date(s.timestamp).toLocaleDateString('tr-TR');const act=s.status==='pending'?'<button class="pnl-btn" style="font-size:11.5px;padding:6px 12px;" onclick="event.stopPropagation();updateSpecialStatus(\\''+s.id+'\\',\\'reviewed\\')">İncelendi ✓</button>':'<button class="dnger-btn" style="font-size:11px;padding:5px 10px;" onclick="event.stopPropagation();updateSpecialStatus(\\''+s.id+'\\',\\'pending\\')">Geri Al</button>';spb.innerHTML+='<tr style="cursor:pointer;" onclick="playFromList(\\'special\\','+i+')">'+'<td style="text-align:center;"><button class="play-circle-btn" onclick="event.stopPropagation();playFromList(\\'special\\','+i+')">▶</button></td>'+'<td><div style="font-weight:700;color:var(--cream);">'+esc(s.trackName)+'</div><div style="font-size:11.5px;color:var(--dim-m);">'+esc(s.fullName)+ai+'</div></td>'+'<td><div style="font-size:12px;color:var(--dim-m);">'+esc(s.email)+'</div><div style="font-size:11px;color:var(--dim);">'+dt+'</div></td>'+'<td style="text-align:right;">'+act+'</td></tr>';});}
    if(staffRole==='owner'&&data.specialConfig){document.getElementById('cfg-active').value=data.specialConfig.active?'true':'false';document.getElementById('cfg-title').value=data.specialConfig.title||'';document.getElementById('cfg-quota').value=data.specialConfig.maxQuota||50;}
    renderLimits();
  }catch(e){console.error('loadPanelData:',e);}
}
function renderLimits(){const lb=document.getElementById('limits-body');if(!panelData.limits||!panelData.limits.length){lb.innerHTML='<tr><td colspan="3" class="empty-state">Aktif kısıtlama yok.</td></tr>';return;}lb.innerHTML='';panelData.limits.forEach(l=>{const dt=new Date(l.timestamp).toLocaleString('tr-TR');lb.innerHTML+='<tr><td><div style="font-weight:700;color:var(--cream);">'+esc(l.email)+'</div><div style="font-size:11px;color:var(--dim);">'+esc(l.type||'')+'</div></td><td><div style="font-size:12px;color:var(--dim-m);">'+esc(dt)+'</div></td><td style="text-align:right;"><button class="dnger-btn" style="font-size:11px;padding:5px 10px;" onclick="resetUser(\\''+esc(l.ip)+'\\',\\''+esc(l.email)+'\\')">Sıfırla</button></td></tr>';});}
async function updateStatus(id,status){try{await authFetch('/api/admin/update-status',{fileId:id,status});loadPanelData();}catch(e){alert(e.message);}}
async function unreviewTrack(id){try{await authFetch('/api/admin/update-status',{fileId:id,status:'pending'});loadPanelData();}catch(e){alert(e.message);}}
async function updateSpecialStatus(id,status){try{await authFetch('/api/admin/update-special-status',{id,status});loadPanelData();}catch(e){alert(e.message);}}
async function resetUser(ip,email){if(!confirm(email+' için bekleme süresini sıfırlamak istiyor musunuz?'))return;try{await authFetch('/api/admin/reset-user',{targetIp:ip,targetEmail:email});loadPanelData();}catch(e){alert(e.message);}}
async function resetAllLimits(){if(!confirm('Tüm kullanıcıların bekleme sürelerini sıfırlamak istiyor musunuz?'))return;try{await authFetch('/api/admin/reset-all-limits',{});loadPanelData();}catch(e){alert(e.message);}}
async function addAccount(){const u=document.getElementById('new-username').value.trim();const p=document.getElementById('new-password').value;if(!u||!p){alert('Kullanıcı adı ve şifre gereklidir.');return;}try{const d=await authFetch('/api/staff/add-account',{username:u,password:p});if(d.error){alert(d.error);return;}document.getElementById('new-username').value='';document.getElementById('new-password').value='';loadPanelData();}catch(e){alert(e.message);}}
async function deleteAccount(username){if(!confirm(username+' hesabını silmek istiyor musunuz?'))return;try{const d=await authFetch('/api/staff/remove-account',{username});if(d.error){alert(d.error);return;}loadPanelData();}catch(e){alert(e.message);}}
async function changePassword(){const cur=document.getElementById('cur-pw').value,nw=document.getElementById('new-pw').value;const err=document.getElementById('pw-change-err'),ok=document.getElementById('pw-change-ok');err.style.display='none';ok.style.display='none';if(!cur||!nw){err.textContent='Her iki alanı doldurun.';err.style.display='block';return;}try{const d=await authFetch('/api/staff/change-password',{currentPassword:cur,newPassword:nw});if(d.error){err.textContent=d.error;err.style.display='block';return;}ok.style.display='block';document.getElementById('cur-pw').value='';document.getElementById('new-pw').value='';}catch(e){err.textContent=e.message;err.style.display='block';}}
async function saveSpecialCfg(){try{await authFetch('/api/admin/save-special-config',{active:document.getElementById('cfg-active').value==='true',title:document.getElementById('cfg-title').value,maxQuota:document.getElementById('cfg-quota').value});const msg=document.getElementById('cfg-msg');msg.textContent='✓ Kaydedildi.';msg.style.display='block';setTimeout(()=>msg.style.display='none',3000);}catch(e){alert(e.message);}}
async function resetSpecialQuota(){if(!confirm('Özel bölüm kotasını sıfırlamak istiyor musunuz?'))return;try{await authFetch('/api/admin/save-special-config',{resetQuota:true});const msg=document.getElementById('cfg-msg');msg.textContent='✓ Kota sıfırlandı.';msg.style.display='block';setTimeout(()=>msg.style.display='none',3000);}catch(e){alert(e.message);}}
async function syncDrive(){if(!confirm('Drive klasörü taranıp eski parçalar eklenecek. Onaylıyor musunuz?'))return;try{const r=await authFetch('/api/admin/sync-drive',{});if(r.success){alert(r.count+' parça eklendi!');loadPanelData();}else alert(r.error||'Hata.');}catch(e){alert('Bağlantı hatası.');}}

const playerEl=document.getElementById('player');
let playlist=[],playlistIndex=-1,currentListType='';
function playFromList(n,i){if(currentListType===n&&playlistIndex===i&&playerEl.src){togglePlay();return;}currentListType=n;const src=n==='inbox'?currentInboxList:(n==='reviewed'?currentReviewedList:currentSpecialList);playlist=src.map(s=>({url:'/api/stream-audio?fileId='+s.fileId,title:s.trackName,artist:s.fullName||'',aiTool:s.aiTool||''}));playlistIndex=i;playCurrent();}
function playCurrent(){if(playlistIndex<0||playlistIndex>=playlist.length)return;const t=playlist[playlistIndex];playTrack(t.url,t.title,t.artist,t.aiTool);}
function playTrack(url,title,artist,aiTool){document.getElementById('ab-title').textContent=title;document.getElementById('ab-artist').textContent=artist;document.getElementById('ab-tag').textContent=aiTool;fetch(url,{headers:{'Authorization':'Bearer '+staffToken}}).then(r=>{if(!r.ok)throw new Error();return r.blob();}).then(blob=>{const bu=URL.createObjectURL(blob);playerEl.src=bu;playerEl.load();playerEl.play().then(()=>{document.getElementById('ab-play').textContent='⏸';document.getElementById('audio-bar').classList.add('visible');updatePlayBtns();}).catch(()=>alert('Oynatılamadı.'));}).catch(()=>alert('Ses yüklenemedi.'));}
function togglePlay(){if(playerEl.paused){playerEl.play();document.getElementById('ab-play').textContent='⏸';}else{playerEl.pause();document.getElementById('ab-play').textContent='▶';}updatePlayBtns();}
function nextTrack(){if(playlistIndex+1<playlist.length){playlistIndex++;playCurrent();}}
function prevTrack(){if(playerEl.currentTime>3){playerEl.currentTime=0;return;}if(playlistIndex>0){playlistIndex--;playCurrent();}}
function skipForward(){if(playerEl.duration)playerEl.currentTime=Math.min(playerEl.duration,playerEl.currentTime+10);}
function skipBackward(){playerEl.currentTime=Math.max(0,playerEl.currentTime-10);}
function seek(v){if(playerEl.duration)playerEl.currentTime=(v/100)*playerEl.duration;}
function closePlayer(){playerEl.pause();document.getElementById('audio-bar').classList.remove('visible');currentListType='';playlistIndex=-1;updatePlayBtns();}
function toggleMute(){playerEl.muted=!playerEl.muted;document.getElementById('ab-mute').textContent=playerEl.muted?'🔇':'🔊';document.getElementById('ab-vol').value=playerEl.muted?0:playerEl.volume*100;}
function changeVol(v){playerEl.volume=v/100;playerEl.muted=v==0;document.getElementById('ab-mute').textContent=v==0?'🔇':'🔊';}
function updatePlayBtns(){document.querySelectorAll('.play-circle-btn').forEach(b=>b.textContent='▶');if(currentListType&&playlistIndex>=0){const b=document.getElementById('btn-play-'+currentListType+'-'+playlistIndex);if(b)b.textContent=playerEl.paused?'▶':'⏸';}}
function fmtTime(s){return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');}
playerEl.addEventListener('timeupdate',()=>{if(playerEl.duration){document.getElementById('ab-seek').value=(playerEl.currentTime/playerEl.duration)*100;document.getElementById('ab-cur').textContent=fmtTime(playerEl.currentTime);document.getElementById('ab-dur').textContent=fmtTime(playerEl.duration);}});
playerEl.addEventListener('ended',()=>{if(playlistIndex+1<playlist.length)nextTrack();else document.getElementById('ab-play').textContent='▶';});
</script>

</body>
</html>
`;
fs.writeFileSync('C:/Users/thend/.gemini/antigravity/scratch/sizden-gelenler/public/index.html', html, 'utf8');
console.log('SUCCESS: index.html generated! Size:', Math.round(html.length/1024)+'KB');
