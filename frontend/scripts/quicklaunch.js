let qlLinks = [];
let qlOpen = false;

function renderQL() {
  const panel = document.getElementById('qlLinks');
  if (!qlLinks.length) {
    panel.innerHTML = '<div class="ql-empty">No links saved yet.<br>Add some in Settings → Quick Launch.</div>';
    return;
  }
  panel.innerHTML = qlLinks.map((l, i) => `
    <button class="ql-link" onclick="openQLLink(${i})">
      <span class="ql-link-icon">${faviconEmoji(l.url)}</span>
      <span>${l.label}</span>
    </button>`).join('');
}

function openQLLink(i) {
  const l = qlLinks[i];
  if (l) window.open(l.url.startsWith('http') ? l.url : 'https://' + l.url, '_blank');
  closeQL();
}

function faviconEmoji(url) {
  if (!url) return '🔗';
  if (url.includes('github')) return '🐙';
  if (url.includes('notion')) return '📓';
  if (url.includes('figma')) return '🎨';
  if (url.includes('linear')) return '📐';
  if (url.includes('slack')) return '💬';
  if (url.includes('discord')) return '🎮';
  if (url.includes('youtube')) return '▶️';
  if (url.includes('twitter') || url.includes('x.com')) return '🐦';
  if (url.includes('google')) return '🔵';
  if (url.includes('vercel')) return '▲';
  if (url.includes('render')) return '🟣';
  return '🔗';
}

function toggleQL() {
  qlOpen = !qlOpen;
  document.getElementById('qlPanel').style.display = qlOpen ? 'block' : 'none';
  if (qlOpen) renderQL();
}

function closeQL() {
  qlOpen = false;
  document.getElementById('qlPanel').style.display = 'none';
}

// Close when clicking outside
document.addEventListener('click', e => {
  if (qlOpen && !e.target.closest('.ql-wrap')) closeQL();
});

// Settings panel rendering
function renderQLSettings() {
  const el = document.getElementById('qlSettingsList');
  if (!qlLinks.length) { el.innerHTML = '<div class="empty" style="padding:10px 0">No links yet.</div>'; return; }
  el.innerHTML = qlLinks.map((l, i) => `
    <div class="ql-setting-item">
      <span class="ql-setting-label">${l.label}</span>
      <span class="ql-setting-url">${l.url}</span>
      <button class="btn-danger btn-xs" onclick="removeQLLink(${i})">✕</button>
      ${i > 0 ? `<button class="btn-ghost btn-xs" onclick="moveQL(${i},-1)">↑</button>` : ''}
      ${i < qlLinks.length-1 ? `<button class="btn-ghost btn-xs" onclick="moveQL(${i},1)">↓</button>` : ''}
    </div>`).join('');
}

function addQLLink() {
  const label = document.getElementById('qlNewLabel').value.trim();
  const url   = document.getElementById('qlNewUrl').value.trim();
  if (!label || !url) { toast('Enter both label and URL'); return; }
  qlLinks.push({ label, url });
  apiSave('qlLinks', qlLinks);
  document.getElementById('qlNewLabel').value = '';
  document.getElementById('qlNewUrl').value = '';
  renderQLSettings();
  toast('Link added!');
}

function removeQLLink(i) {
  qlLinks.splice(i, 1);
  apiSave('qlLinks', qlLinks);
  renderQLSettings();
}

function moveQL(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= qlLinks.length) return;
  [qlLinks[i], qlLinks[j]] = [qlLinks[j], qlLinks[i]];
  apiSave('qlLinks', qlLinks);
  renderQLSettings();
}
