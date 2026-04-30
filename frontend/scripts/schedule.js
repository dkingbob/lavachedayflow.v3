let tasks = [];
let archive = {};
let sortMode = 'time';

const BUILTIN = [
  {time:'09:30',name:'IGNITION RITUAL',dur:'15 min',type:'anchor',priority:3,notes:"Review today's single priority. Write it on paper. No phone, no email. Close all tabs except IDE."},
  {time:'09:45',name:'DEEP BLOCK 1 — PEAK WINDOW',dur:'90 min',type:'daily',priority:3,notes:'Hardest problem of the day. Your neurological prime — protect it absolutely.'},
  {time:'11:15',name:'DELIBERATE BREAK — PHONE BANNED',dur:'15 min',type:'rest',priority:2,notes:'Walk outside or get water. No screen. Let your brain consolidate.'},
  {time:'11:30',name:'DEEP BLOCK 2 — SECONDARY PRIME',dur:'75 min',type:'daily',priority:3,notes:'Second deep problem or continue Block 1. End with: "Next step is ___"'},
  {time:'12:45',name:'PRE-DEPARTURE ANCHOR',dur:'15 min',type:'anchor',priority:2,notes:'Write 3 sentences: what you did, what\'s next, what to avoid.'},
  {time:'13:00',name:'LUNCH + HOME RESET',dur:'75 min',type:'recharge',priority:2,notes:'Leave, cook, eat, return. Light meal. Protein + complex carbs. No doom-scrolling.'},
  {time:'14:15',name:'RE-IGNITION RITUAL',dur:'15 min',type:'anchor',priority:2,notes:'Read your pre-departure anchor. Rewrite next step. 5 min walk. Then begin.'},
  {time:'14:30',name:'DEEP BLOCK 3 — AFTERNOON PRIME',dur:'90 min',type:'daily',priority:3,notes:'Ideal for iteration: debugging, refactoring, applying patterns.'},
  {time:'16:00',name:'RECOVERY BREAK',dur:'15 min',type:'rest',priority:1,notes:'Walk. Hydrate. Stretch. No phone. Glycogen and dopamine recovery.'},
  {time:'16:15',name:'LIGHTER WORK BLOCK',dur:'75 min',type:'project',priority:2,notes:'Code review, docs, research, reading, Anki, tutorials, notes on learnings.'},
  {time:'17:30',name:'SHUTDOWN RITUAL',dur:'30 min',type:'anchor',priority:3,notes:'Write tomorrow\'s top priority. Log what you built. Say out loud: "Shutdown complete."'},
];

const PCOLORS = { 3:'#f87171', 2:'#fbbf24', 1:'#6ee7b7' };

function sortedTasks() {
  const t = [...tasks];
  switch(sortMode) {
    case 'priority-desc': return t.sort((a,b) => (b.priority||2)-(a.priority||2));
    case 'priority-asc':  return t.sort((a,b) => (a.priority||2)-(b.priority||2));
    case 'alpha':         return t.sort((a,b) => a.name.localeCompare(b.name));
    case 'alpha-desc':    return t.sort((a,b) => b.name.localeCompare(a.name));
    case 'newest':        return t.sort((a,b) => new Date(b.created)-new Date(a.created));
    case 'oldest':        return t.sort((a,b) => new Date(a.created)-new Date(b.created));
    default:              return t.sort((a,b) => a.time.localeCompare(b.time));
  }
}

function sortTasks(mode) { sortMode = mode; renderTasks(); }

function renderTasks() {
  const el = document.getElementById('taskList');
  if (!tasks.length) { el.innerHTML = '<div class="empty">No tasks yet.</div>'; return; }
  el.innerHTML = sortedTasks().map(t => `
    <div class="task-item ${t.done?'done':''}">
      <div class="task-check ${t.done?'on':''}" onclick="toggleTask('${t.id}')">${t.done?'✓':''}</div>
      <div class="priority-dot" style="background:${PCOLORS[t.priority||2]}"></div>
      <input class="task-time" type="time" value="${t.time}" onchange="editTaskTime('${t.id}',this.value)">
      <span class="task-name">${t.name}${t.dur?` <span class="task-dur">(${t.dur})</span>`:''}</span>
      <span class="type-badge t-${t.type}">${t.type}</span>
      <div class="task-actions">
        <button class="btn-gcal btn-xs" onclick="sendToGCal('${t.id}')">📆</button>
        <button class="btn-danger btn-xs" onclick="deleteTask('${t.id}')">✕</button>
      </div>
    </div>`).join('');
}

function addTask() {
  const name = document.getElementById('tName').value.trim();
  if (!name) { toast('Enter a task name'); return; }
  const t = {
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    name,
    time: document.getElementById('tTime').value,
    dur: document.getElementById('tDur').value.trim(),
    type: document.getElementById('tType').value,
    priority: parseInt(document.getElementById('tPriority').value),
    notes: document.getElementById('tNotes').value.trim(),
    done: false,
    created: new Date().toISOString()
  };
  tasks.push(t);
  apiSave('tasks_' + todayKey(), tasks);
  renderTasks();
  document.getElementById('tName').value = '';
  document.getElementById('tNotes').value = '';
  document.getElementById('tDur').value = '';
  if (SESSION?.started) addEvent('➕ Added: ' + name);
  toast('Task added');
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id); if (!t) return;
  t.done = !t.done;
  apiSave('tasks_' + todayKey(), tasks);
  renderTasks();
  if (t.done && SESSION?.started) addEvent('✅ Done: ' + t.name);
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  apiSave('tasks_' + todayKey(), tasks);
  renderTasks();
}

function editTaskTime(id, val) {
  const t = tasks.find(t => t.id === id);
  if (t) { t.time = val; apiSave('tasks_' + todayKey(), tasks); }
}

function saveDefault() {
  apiSave('default_tasks', tasks.map(t => ({name:t.name,time:t.time,dur:t.dur,type:t.type,priority:t.priority,notes:t.notes})));
  toast('Saved as default!');
}

function loadDefault() {
  const defs = window._allData?.['default_tasks'] || [];
  if (!defs.length) { toast('No default saved yet'); return; }
  defs.forEach(d => tasks.push({...d, id: Date.now().toString()+Math.random(), done:false, created:new Date().toISOString()}));
  apiSave('tasks_' + todayKey(), tasks);
  renderTasks();
  toast('Default loaded!');
}

function loadBuiltin() {
  if (!confirm('Load your 9:30–17:30 schedule? This adds all blocks to today.')) return;
  BUILTIN.forEach(d => tasks.push({...d, id: Date.now().toString()+Math.random(), done:false, created:new Date().toISOString()}));
  apiSave('tasks_' + todayKey(), tasks);
  renderTasks();
  toast('Schedule loaded!');
}

function sendToGCal(id) {
  const t = tasks.find(t => t.id === id); if (!t) return;
  const day = todayKey().replace(/-/g,'');
  const [h,m] = t.time.split(':').map(Number);
  const s = `${day}T${f2(h)}${f2(m)}00`;
  const e = `${day}T${f2(h+1>23?23:h+1)}${f2(m)}00`;
  window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(t.name)}&dates=${s}/${e}&details=${encodeURIComponent(t.notes||'')}`, '_blank');
}

function exportAllGCal() {
  if (!tasks.length) { toast('No tasks'); return; }
  tasks.forEach((t,i) => setTimeout(() => sendToGCal(t.id), i*350));
  toast('Opening all in Google Calendar...');
}

function archiveDay() {
  if (!tasks.length) { toast('Nothing to archive'); return; }
  archive[todayKey()] = tasks;
  apiSave('archive', archive);
  tasks = [];
  apiSave('tasks_' + todayKey(), tasks);
  renderTasks(); renderArchive();
  toast('Day archived!');
}

function renderArchive() {
  const keys = Object.keys(archive).sort().reverse();
  const el = document.getElementById('archiveList');
  if (!keys.length) { el.innerHTML = '<div class="empty">No archived days.</div>'; return; }
  el.innerHTML = keys.map(date => {
    const label = new Date(date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
    return `<div class="archive-day">
      <div class="archive-hdr" onclick="this.nextElementSibling.classList.toggle('open')">
        <span>${label}</span>
        <div class="flex gap-8 align-center">
          <span class="mono text-muted" style="font-size:.76rem">${archive[date].length} tasks</span>
          <button class="btn-danger btn-xs" onclick="event.stopPropagation();delArchive('${date}')">Delete</button>
        </div>
      </div>
      <div class="archive-body">
        ${archive[date].map(t=>`
          <div class="task-item ${t.done?'done':''}">
            <div class="task-check ${t.done?'on':''}">✓</div>
            <div class="priority-dot" style="background:${PCOLORS[t.priority||2]}"></div>
            <span class="task-time mono" style="background:none;border:none;width:auto">${t.time}</span>
            <span class="task-name">${t.name}</span>
            <span class="type-badge t-${t.type}">${t.type}</span>
          </div>`).join('')}
      </div>
    </div>`;
  }).join('');
}

function delArchive(date) {
  if (!confirm('Delete this archived day?')) return;
  delete archive[date];
  apiSave('archive', archive);
  renderArchive();
}
