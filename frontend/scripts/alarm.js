// frontend/scripts/alarm.js

let _active = false;
let _ctx = null;
let _loop = null;

function ring() {
  _ctx = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc  = _ctx.createOscillator();
    const gain = _ctx.createGain();
    osc.connect(gain);
    gain.connect(_ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const s = _ctx.currentTime + i * 0.42;
    gain.gain.setValueAtTime(0, s);
    gain.gain.linearRampToValueAtTime(0.22, s + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, s + 1.3);
    osc.start(s);
    osc.stop(s + 1.4);
  });
}

export function playAlarm(label = "Time's up!", sub = '') {
  _active = true;
  document.getElementById('alarmLabel').textContent = label;
  document.getElementById('alarmSub').textContent   = sub;
  document.getElementById('alarmOverlay').classList.add('show');
  ring();
  _loop = setInterval(() => { if (_active) ring(); }, 3600);
}

export function stopAlarm() {
  _active = false;
  clearInterval(_loop);
  document.getElementById('alarmOverlay').classList.remove('show');
  try { _ctx?.close(); } catch {}
  _ctx = null;
}
