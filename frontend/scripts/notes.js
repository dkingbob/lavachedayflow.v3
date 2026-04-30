let topics = [];
let activeTopic = null;

function renderTopics() {
  const el = document.getElementById('topicList');
  el.innerHTML = topics.length
    ? topics.map(t => `
        <div class="sidebar-item ${activeTopic===t?'active':''}" onclick="selectTopic('${t}')">
          <span>${t}</span>
          <span class="sidebar-item-del" onclick="event.stopPropagation();deleteTopic('${t}')">✕</span>
        </div>`).join('')
    : '<div class="empty" style="padding:8px 0;font-size:.8rem">No topics yet.</div>';
}

function addTopic() {
  const name = document.getElementById('newTopic').value.trim();
  if (!name || topics.includes(name)) { toast('Enter a unique topic name'); return; }
  topics.push(name);
  apiSave('topics', topics);
  renderTopics();
  document.getElementById('newTopic').value = '';
  selectTopic(name);
}

function deleteTopic(name) {
  if (!confirm(`Delete topic "${name}" and all its notes?`)) return;
  topics = topics.filter(t => t !== name);
  apiSave('topics', topics);
  apiDel('notes_' + name);
  if (activeTopic === name) {
    activeTopic = null;
    document.getElementById('notesArea').innerHTML = '<div class="empty mt-60">Select or create a topic.</div>';
  }
  renderTopics();
}

function selectTopic(name) {
  activeTopic = name;
  renderTopics();
  renderNotes();
}

function renderNotes() {
  if (!activeTopic) return;
  const notes = (window._allData?.['notes_' + activeTopic]) || [];
  document.getElementById('notesArea').innerHTML = `
    <div class="flex align-center" style="justify-content:space-between;margin-bottom:16px">
      <h2 style="font-size:1.05rem;font-weight:700">${activeTopic}</h2>
      <button class="btn-accent btn-sm" onclick="addNote()">+ Add note</button>
    </div>
    ${notes.map(n => `
      <div class="note-card">
        <div class="flex align-center" style="justify-content:space-between;margin-bottom:8px">
          <input class="note-title" type="text" value="${escHtml(n.title||'')}" placeholder="Note title..." onchange="updateNote('${n.id}','title',this.value)">
          <button class="btn-danger btn-xs" onclick="deleteNote('${n.id}')">Delete</button>
        </div>
        <textarea class="note-body" rows="5" placeholder="Write anything..." onchange="updateNote('${n.id}','body',this.value)">${escHtml(n.body||'')}</textarea>
        <div class="note-meta">Edited ${new Date(n.updated).toLocaleString()}</div>
      </div>`).join('')}
    ${!notes.length ? '<div class="empty">No notes yet. Click "+ Add note".</div>' : ''}`;
}

function addNote() {
  if (!activeTopic) return;
  const notes = window._allData?.['notes_' + activeTopic] || [];
  const note = { id: Date.now().toString(), title: '', body: '', updated: new Date().toISOString() };
  notes.push(note);
  if (!window._allData) window._allData = {};
  window._allData['notes_' + activeTopic] = notes;
  apiSave('notes_' + activeTopic, notes);
  renderNotes();
}

function updateNote(id, field, val) {
  const notes = window._allData?.['notes_' + activeTopic] || [];
  const n = notes.find(n => n.id === id);
  if (n) {
    n[field] = val;
    n.updated = new Date().toISOString();
    window._allData['notes_' + activeTopic] = notes;
    apiSave('notes_' + activeTopic, notes);
  }
}

function deleteNote(id) {
  if (!window._allData) return;
  window._allData['notes_' + activeTopic] = (window._allData['notes_' + activeTopic] || []).filter(n => n.id !== id);
  apiSave('notes_' + activeTopic, window._allData['notes_' + activeTopic]);
  renderNotes();
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
