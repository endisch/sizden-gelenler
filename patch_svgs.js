const fs = require('fs');

let file = fs.readFileSync('generate_index.js', 'utf8');

const targetYT = '<a href="https://music.youtube.com/channel/UCncYK-WS8LG6L52uFAKL53A?si=Uy8vYObZMi02IcPp" target="_blank" class="social-btn" title="YouTube Music" style="font-weight:800; font-size:0.75rem;">YM</a>';
const targetDrive = '<a href="https://drive.google.com/file/d/1ut-7VB41aSU9p_3Wi5pzNJTEQLgQZNdg/view" target="_blank" class="social-btn" title="Drive Prompts" style="font-weight:800; font-size:0.75rem;">DRV</a>';

const replacementYT = `<a href="https://music.youtube.com/channel/UCncYK-WS8LG6L52uFAKL53A?si=Uy8vYObZMi02IcPp" target="_blank" class="social-btn" title="YouTube Music">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 8v8l6-4z"/></svg>
      </a>`;
const replacementDrive = `<a href="https://drive.google.com/file/d/1ut-7VB41aSU9p_3Wi5pzNJTEQLgQZNdg/view" target="_blank" class="social-btn" title="Drive Prompts">
        <svg viewBox="0 0 24 24"><path d="M7.71 3.5L1.15 15l3.43 6 6.55-11.5M9.73 15L6.3 21h13.12l3.43-6M13.44 10.5H.57l3.43-6h12.85"/></svg>
      </a>`;

file = file.replace(targetYT, replacementYT);
file = file.replace(targetDrive, replacementDrive);

fs.writeFileSync('generate_index.js', file);
console.log('SVGs replaced safely.');
