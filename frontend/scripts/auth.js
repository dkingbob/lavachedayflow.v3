let CURRENT_USER = JSON.parse(localStorage.getItem('df_user') || 'null');
let authMode = 'login';

function switchAuth(mode) {
  authMode = mode;
  document.querySelectorAll('.tab').forEach((t,i) => t.classList.toggle('active', (i===0&&mode==='login')||(i===1&&mode==='register')));
  document.getElementById('authNameRow').style.display = mode === 'register' ? 'block' : 'none';
  document.getElementById('authSubmit').textContent = mode === 'login' ? 'Sign in' : 'Create account';
  document.getElementById('authError').textContent = '';
}

async function doAuth() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPass').value;
  const name = document.getElementById('authName').value.trim();
  document.getElementById('authError').textContent = '';
  if (!email || !password) { document.getElementById('authError').textContent = 'Email and password required.'; return; }
  document.getElementById('authSubmit').textContent = '...';
  try {
    const body = { email, password, ...(authMode === 'register' ? { name } : {}) };
    const r = await apiFetch('/api/auth/' + authMode, { method: 'POST', body: JSON.stringify(body) });
    setToken(r.token);
    CURRENT_USER = r.user;
    localStorage.setItem('df_user', JSON.stringify(r.user));
    launchApp();
  } catch(e) {
    document.getElementById('authError').textContent = e.error || 'Could not connect to server.';
    document.getElementById('authSubmit').textContent = authMode === 'login' ? 'Sign in' : 'Create account';
  }
}

function logout() {
  if (!confirm('Sign out?')) return;
  clearToken();
  CURRENT_USER = null;
  document.getElementById('app').style.display = 'none';
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('authEmail').value = '';
  document.getElementById('authPass').value = '';
}
