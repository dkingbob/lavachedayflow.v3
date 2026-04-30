// ── Alarm ──────────────────────────────────────────────────────────────────
let _alarmActive = false, _alarmCtx = null, _alarmLoop = null;

function playAlarm(title, sub) {
  stopAlarm();
  _alarmActive = true;
  document.getElementById('alarmTitle').textContent = title || "Time's up!";
  document.getElementById('alarmSub').textContent = sub || '';
  document.getElementById('alarmOverlay').style.display = 'flex';
  ringLoop();
}

function ringLoop() {
  if (!_alarmActive) return;
  ringOnce();
  _alarmLoop = setTimeout(ringLoop, 3600);
}

function ringOnce() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    _alarmCtx = ctx;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      const s = ctx.currentTime + i * 0.42;
      gain.gain.setValueAtTime(0, s);
      gain.gain.linearRampToValueAtTime(0.26, s + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, s + 1.3);
      osc.start(s); osc.stop(s + 1.4);
    });
  } catch(e) {}
}

function stopAlarm() {
  _alarmActive = false;
  clearTimeout(_alarmLoop);
  document.getElementById('alarmOverlay').style.display = 'none';
  try { if (_alarmCtx) { _alarmCtx.close(); _alarmCtx = null; } } catch(e) {}
}

// ── Countdown ─────────────────────────────────────────────────────────────
let cdIv = null, cdRem = 0, cdTot = 0;

function cdGetTotal() {
  return (+document.getElementById('cdH').value) * 3600
       + (+document.getElementById('cdM').value) * 60
       + (+document.getElementById('cdS').value);
}
function cdFmt(s) { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60; return h?`${f2(h)}:${f2(m)}:${f2(sec)}`:`${f2(m)}:${f2(sec)}`; }
function cdDraw() {
  document.getElementById('cdDisplay').textContent = cdFmt(cdRem);
  document.getElementById('cdBar').style.width = (cdTot > 0 ? (cdRem / cdTot) * 100 : 100) + '%';
}
function cdStart() {
  if (cdIv) return;
  if (!cdRem) { cdTot = cdGetTotal(); cdRem = cdTot; }
  if (!cdRem) { toast('Set a time first'); return; }
  cdIv = setInterval(() => { cdRem--; cdDraw(); if (cdRem <= 0) { clearInterval(cdIv); cdIv = null; playAlarm('Countdown complete!', 'Your timer has finished.'); } }, 1000);
}
function cdPause() { clearInterval(cdIv); cdIv = null; }
function cdReset() { clearInterval(cdIv); cdIv = null; cdTot = cdGetTotal(); cdRem = cdTot; cdDraw(); }

// ── Stopwatch ─────────────────────────────────────────────────────────────
let swIv = null, swEl = 0, laps = [];

function f2(n) { return String(n).padStart(2,'0'); }
function swFmt(s) { return `${f2(Math.floor(s/3600))}:${f2(Math.floor((s%3600)/60))}:${f2(s%60)}`; }
function swStart() { if (swIv) return; swIv = setInterval(() => { swEl++; document.getElementById('swDisplay').textContent = swFmt(swEl); }, 1000); }
function swPause() { clearInterval(swIv); swIv = null; }
function swReset() { clearInterval(swIv); swIv = null; swEl = 0; laps = []; document.getElementById('swDisplay').textContent = '00:00:00'; document.getElementById('lapList').innerHTML = ''; }
function swLap() {
  laps.push(swFmt(swEl));
  document.getElementById('lapList').innerHTML = laps.map((l, i) =>
    `<div class="lap-item">🚩 Lap ${i+1}: ${l}</div>`
  ).reverse().join('');
}

// ── Pomodoro ──────────────────────────────────────────────────────────────
let pomIv = null, pomRem = 0, pomTot = 0, pomIsWork = true, pomSess = 1;

function pomWork() { return +document.getElementById('pomW').value * 60; }
function pomBreak() { return +document.getElementById('pomB').value * 60; }
function pomFmt(s) { return `${f2(Math.floor(s/60))}:${f2(s%60)}`; }
function pomDraw() {
  document.getElementById('pomDisplay').textContent = pomFmt(pomRem);
  document.getElementById('pomBar').style.width = (pomTot > 0 ? (pomRem / pomTot) * 100 : 100) + '%';
}
function pomStart() {
  if (pomIv) return;
  if (!pomRem) { pomTot = pomWork(); pomRem = pomTot; }
  pomIv = setInterval(() => {
    pomRem--; pomDraw();
    if (pomRem <= 0) {
      clearInterval(pomIv); pomIv = null;
      if (pomIsWork) {
        pomIsWork = false; pomTot = pomBreak(); pomRem = pomTot;
        document.getElementById('pomPhase').textContent = 'BREAK';
        document.getElementById('pomPhase').className = 'phase-badge phase-break';
        playAlarm('Work block done!', 'Time for a break.');
      } else {
        pomIsWork = true; pomSess++; pomTot = pomWork(); pomRem = pomTot;
        document.getElementById('pomPhase').textContent = 'WORK';
        document.getElementById('pomPhase').className = 'phase-badge phase-work';
        document.getElementById('pomCount').textContent = 'Session ' + pomSess;
        playAlarm('Break over!', 'Back to work.');
      }
      pomDraw();
      setTimeout(pomStart, 200);
    }
  }, 1000);
}
function pomPause() { clearInterval(pomIv); pomIv = null; }
function pomReset() {
  clearInterval(pomIv); pomIv = null;
  pomIsWork = true; pomSess = 1;
  pomTot = pomWork(); pomRem = pomTot;
  document.getElementById('pomPhase').textContent = 'WORK';
  document.getElementById('pomPhase').className = 'phase-badge phase-work';
  document.getElementById('pomCount').textContent = 'Session 1';
  pomDraw();
}

// init
cdReset();
pomReset();
