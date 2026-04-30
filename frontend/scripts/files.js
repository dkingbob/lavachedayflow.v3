let fileCats = ['General'];
let activeFileCat = 'General';
let storedFiles = {};
let renameTarget = null; // { catName, index }

const FILE_ICONS = {
  'image/': '🖼️', 'application/pdf': '📕',
  'video/': '🎬', 'audio/': '🎵',
  'text/': '📄', 'application/zip': '📦',
  'application/x-rar': '📦',
  'application/vnd.openxmlformats-officedocument.wordprocessingml': '📝',
  'application/vnd.openxmlformats-officedocument.spreadsheetml': '📊',
  'application/vnd.openxmlformats-officedocument.presentationml': '📊',
};

function fileEmoji(type = '') {
  for (const [k, v] of Object.entries(FILE_ICONS)) {
    if (type.startsWith(k)) return v;
  }
  return '📄';
}

function fmtSize(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

function renderFileCats() {
  document.getElementById('fileCatList').innerHTML = fileCats.map(c => `
    <div class="sidebar-item ${activeFileCat===c?'active':''}" onclick="selectFileCat('${c}')">
      <span>${c}</span>
      ${c !== 'General' ? `<span class="sidebar-item-del" onclick="event.stopPropagation();delFileCat('${c}')">✕</span>` : ''}
    </div>`).join('');
}

function addFileCat() {
  const name = document.getElementById('newCat').value.trim();
  if (!name || fileCats.includes(name)) { toast('Enter a unique category name'); return; }
  fileCats.push(name);
  apiSave('fileCats', fileCats);
  renderFileCats();
  document.getElementById('newCat').value = '';
  selectFileCat(name);
}

function delFileCat(name) {
  if (!confirm(`Delete category "${name}" and all its files?`)) return;
  fileCats = fileCats.filter(c => c !== name);
  delete storedFiles[name];
  apiSave('fileCats', fileCats);
  apiSave('files', storedFiles);
  if (activeFileCat === name) selectFileCat('General');
  renderFileCats();
}

function selectFileCat(name) {
  activeFileCat = name;
  renderFileCats();
  renderFiles();
}

function renderFiles() {
  const query = (document.getElementById('fileSearch')?.value || '').toLowerCase().trim();
  let files = storedFiles[activeFileCat] || [];
  if (query) files = files.filter(f => f.name.toLowerCase().includes(query));
  const grid = document.getElementById('fileGrid');
  if (!files.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1">${query ? 'No files match your search.' : 'Drop files above to add them here.'}</div>`;
    return;
  }
  // get indices in original array for actions
  const orig = storedFiles[activeFileCat] || [];
  grid.innerHTML = files.map(f => {
    const realIdx = orig.indexOf(f);
    return `
    <div class="file-card" onclick="openFile(${realIdx})">
      <div class="file-actions">
        <button class="file-act-btn file-ren-btn" onclick="event.stopPropagation();startRename(${realIdx})" title="Rename">✎</button>
        <button class="file-act-btn file-del-btn" onclick="event.stopPropagation();delFile(${realIdx})" title="Delete">✕</button>
      </div>
      <div class="file-emoji">${fileEmoji(f.type)}</div>
      <div class="file-name">${f.name}</div>
      <div class="file-sz">${fmtSize(f.size)}</div>
    </div>`;
  }).join('');
}

function openFile(idx) {
  const f = (storedFiles[activeFileCat] || [])[idx];
  if (!f?.dataUrl) return;
  const modal = document.getElementById('fileModal');
  const preview = document.getElementById('filePreview');
  if (f.type?.startsWith('image/')) {
    preview.innerHTML = `<img src="${f.dataUrl}" alt="${f.name}" style="display:block">`;
    modal.classList.add('show');
  } else if (f.type === 'application/pdf') {
    preview.innerHTML = `<iframe src="${f.dataUrl}"></iframe>`;
    modal.classList.add('show');
  } else if (f.type?.startsWith('text/')) {
    // Decode and show text inline
    const text = atob(f.dataUrl.split(',')[1] || '');
    preview.innerHTML = `<pre style="max-width:80vw;max-height:80vh;overflow:auto;font-family:'JetBrains Mono',monospace;font-size:.82rem;white-space:pre-wrap;color:var(--text)">${escHtml ? escHtml(text) : text}</pre>`;
    modal.classList.add('show');
  } else {
    // Force download for unsupported types
    const a = document.createElement('a');
    a.href = f.dataUrl; a.download = f.name; a.click();
  }
}

function closeFileModal() {
  document.getElementById('fileModal').classList.remove('show');
  document.getElementById('filePreview').innerHTML = '';
}

function delFile(idx) {
  storedFiles[activeFileCat] = (storedFiles[activeFileCat] || []).filter((_, i) => i !== idx);
  apiSave('files', storedFiles);
  renderFiles();
}

function startRename(idx) {
  const f = (storedFiles[activeFileCat] || [])[idx];
  if (!f) return;
  renameTarget = { cat: activeFileCat, idx };
  document.getElementById('renameInput').value = f.name;
  document.getElementById('renameModal').classList.add('show');
  document.getElementById('renameInput').focus();
}

function confirmRename() {
  if (!renameTarget) return;
  const newName = document.getElementById('renameInput').value.trim();
  if (!newName) { toast('Enter a name'); return; }
  const files = storedFiles[renameTarget.cat] || [];
  if (files[renameTarget.idx]) {
    files[renameTarget.idx].name = newName;
    storedFiles[renameTarget.cat] = files;
    apiSave('files', storedFiles);
    renderFiles();
  }
  closeRename();
}

function closeRename() {
  document.getElementById('renameModal').classList.remove('show');
  renameTarget = null;
}

function handleFilePick(input) {
  [...input.files].forEach(readAndStore);
  input.value = '';
}

function readAndStore(file) {
  if (file.size > 8 * 1024 * 1024) { toast(`${file.name} is too large (max 8MB)`); return; }
  const reader = new FileReader();
  reader.onload = e => {
    if (!storedFiles[activeFileCat]) storedFiles[activeFileCat] = [];
    storedFiles[activeFileCat].push({ name: file.name, size: file.size, type: file.type, dataUrl: e.target.result });
    apiSave('files', storedFiles);
    renderFiles();
    toast(`${file.name} added`);
  };
  reader.readAsDataURL(file);
}

// Drag-and-drop
const dz = document.getElementById('dropZone');
dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); });
dz.addEventListener('dragleave', () => dz.classList.remove('over'));
dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('over'); [...e.dataTransfer.files].forEach(readAndStore); });

// Enter key for rename
document.getElementById('renameInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') confirmRename(); });
