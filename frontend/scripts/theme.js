let _theme = localStorage.getItem('df_theme') || 'dark';
document.documentElement.setAttribute('data-theme', _theme);

function toggleTheme() { setTheme(_theme === 'dark' ? 'light' : 'dark'); }

function setTheme(t) {
  _theme = t;
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('df_theme', t);
}

function setAccent(color, dim) {
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--accent-dim', dim);
  document.documentElement.style.setProperty('--accent2', color);
  localStorage.setItem('df_accent', JSON.stringify({ color, dim }));
}

function setFontScale(scale) {
  document.documentElement.style.fontSize = scale * 14 + 'px';
  localStorage.setItem('df_fontscale', scale);
}

function toggleCompact(on) {
  document.body.classList.toggle('compact', on);
  localStorage.setItem('df_compact', on ? '1' : '0');
}

// restore saved preferences
(function restorePrefs() {
  const accent = JSON.parse(localStorage.getItem('df_accent') || 'null');
  if (accent) setAccent(accent.color, accent.dim);
  const scale = parseFloat(localStorage.getItem('df_fontscale') || '1');
  if (scale !== 1) setFontScale(scale);
  if (localStorage.getItem('df_compact') === '1') document.body.classList.add('compact');
})();
