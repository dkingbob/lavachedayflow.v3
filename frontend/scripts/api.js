let _token = localStorage.getItem('df_token');

function setToken(t) { _token = t; localStorage.setItem('df_token', t); }
function clearToken() { _token = null; localStorage.removeItem('df_token'); localStorage.removeItem('df_user'); }

async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (_token) headers['Authorization'] = 'Bearer ' + _token;
  const r = await fetch(API_URL + path, { headers, ...opts });
  if (!r.ok) { const e = await r.json().catch(() => ({ error: 'Request failed' })); throw e; }
  return r.json();
}

async function apiSave(key, value) {
  try { await apiFetch('/api/data/' + key, { method: 'POST', body: JSON.stringify({ value }) }); }
  catch(e) { console.warn('[api] save failed:', key, e); }
}

async function apiLoadAll() {
  try { return await apiFetch('/api/data'); }
  catch(e) { console.warn('[api] loadAll failed:', e); return {}; }
}

async function apiDel(key) {
  try { await apiFetch('/api/data/' + key, { method: 'DELETE' }); }
  catch(e) {}
}
