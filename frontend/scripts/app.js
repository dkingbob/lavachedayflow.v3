// app.js — main boot, page nav, global utils

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._to);
  t._to = setTimeout(() => t.classList.remove('show'), 2800);
}

function goPage(name, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
  // re-render settings panels when opening settings
  if (name === 'settings') {
    renderQLSettings();
    document.getElementById('settingsEmail').textContent = CURRENT_USER?.email || '—';
    if (localStorage.getItem('df_compact') === '1') document.getElementById('compactToggle').checked = true;
  }
}

async function launchApp() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  document.getElementById('app').style.flexDirection = 'column';

  // Set user info
  const u = CURRENT_USER;
  document.getElementById('userName').textContent = u?.name || u?.email?.split('@')[0] || '—';
  document.getElementById('userAvatar').textContent = (u?.name || u?.email || '?')[0].toUpperCase();

  // Load all data from server
  window._allData = await apiLoadAll();
  const d = window._allData;

  // Hydrate each module
  tasks        = d['tasks_' + todayKey()] || [];
  archive      = d['archive'] || {};
  topics       = d['topics'] || [];
  fileCats     = d['fileCats'] || ['General'];
  storedFiles  = d['files'] || {};
  qlLinks      = d['qlLinks'] || [];

  // Restore session if active
  const savedSession = d['session_' + todayKey()];
  if (savedSession?.started && !savedSession?.ended) {
    restoreSessionFromData(savedSession);
  }

  // Render all modules
  renderTasks();
  renderArchive();
  renderTopics();
  renderFileCats();
  renderFiles();
  startSessionClock();
}

// Boot: check if already logged in
window.addEventListener('DOMContentLoaded', () => {
  if (_token && CURRENT_USER) {
    launchApp();
  } else {
    document.getElementById('authScreen').style.display = 'flex';
  }
});
