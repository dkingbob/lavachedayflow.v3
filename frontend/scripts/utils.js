// frontend/scripts/utils.js

export const todayKey = () => new Date().toISOString().slice(0, 10);
export const f2 = n => String(n).padStart(2, '0');
export const fmtTime = d => `${f2(d.getHours())}:${f2(d.getMinutes())}`;
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

export function fmtDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h ? `${f2(h)}:${f2(m)}:${f2(s)}` : `${f2(m)}:${f2(s)}`;
}

export function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function fileIcon(mime) {
  if (!mime) return '📄';
  if (mime.startsWith('image/'))       return '🖼️';
  if (mime === 'application/pdf')      return '📕';
  if (mime.includes('word'))           return '📝';
  if (mime.includes('sheet') || mime.includes('excel') || mime.includes('csv')) return '📊';
  if (mime.includes('presentation') || mime.includes('powerpoint')) return '📊';
  if (mime.startsWith('video/'))       return '🎬';
  if (mime.startsWith('audio/'))       return '🎵';
  if (mime.includes('zip'))            return '📦';
  return '📄';
}

let _toastTimer;
export function toast(msg, duration = 2800) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

export function confirm2(msg) { return window.confirm(msg); }

// Simple reactive re-render: call render(fn) to queue a microtask render
let _pending = false;
export function scheduleRender(fn) {
  if (_pending) return;
  _pending = true;
  queueMicrotask(() => { _pending = false; fn(); });
}
