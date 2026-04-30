let SESSION = null;

function f2(n) { return String(n).padStart(2, '0'); }
function fmtSecs(s) { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60; return h?`${f2(h)}:${f2(m)}:${f2(sec)}`:`${f2(m)}:${f2(sec)}`; }
function fmtTime(d) { return `${f2(d.getHours())}:${f2(d.getMinutes())}`; }
function todayKey() { return new Date().toISOString().slice(0,10); }

function startSessionClock() {
  document.getElementById('sDate').textContent = new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  setInterval(() => {
    document.getElementById('sessionClock').textContent = new Date().toLocaleTimeString('en-US',{hour12:false});
    if (SESSION?.started && !SESSION?.ended) {
      const secs = Math.floor((Date.now() - new Date(SESSION.started)) / 1000);
      document.getElementById('sElapsed').textContent = fmtSecs(secs);
    }
  }, 1000);
}

function startDay() {
  if (SESSION?.started) { toast('Session already running'); return; }
  SESSION = { started: new Date().toISOString(), ended: null, events: [] };
  addEvent('🟢 Day started');
  applySessionUI(true);
  saveSession();
  toast('Day started!');
}

function endDay() {
  if (!SESSION?.started) { toast('No active session'); return; }
  SESSION.ended = new Date().toISOString();
  addEvent('🔴 Day ended');
  applySessionUI(false);
  saveSession();
  showSummary();
}

function logEvent() {
  const label = prompt('What happened? (e.g. Lunch break, Finished task, Back from walk)');
  if (!label) return;
  addEvent(label);
  toast('Event logged ✓');
}

function addEvent(label) {
  if (!SESSION) return;
  SESSION.events.push({ label, time: new Date().toISOString() });
  document.getElementById('sEvents').textContent = SESSION.events.length;
  saveSession();
}

function saveSession() {
  apiSave('session_' + todayKey(), SESSION);
}

function restoreSessionFromData(data) {
  if (!data) return;
  SESSION = data;
  document.getElementById('sStart').textContent = fmtTime(new Date(data.started));
  document.getElementById('sEvents').textContent = data.events.length;
  if (data.started && !data.ended) applySessionUI(true);
}

function applySessionUI(active) {
  document.getElementById('sessionDot').classList.toggle('on', active);
  document.getElementById('btnStartDay').style.display = active ? 'none' : '';
  document.getElementById('btnLogEvent').style.display = active ? '' : 'none';
  document.getElementById('btnEndDay').style.display = active ? '' : 'none';
  if (active && SESSION?.started) document.getElementById('sStart').textContent = fmtTime(new Date(SESSION.started));
}

function showSummary() {
  const start = new Date(SESSION.started);
  const end = new Date(SESSION.ended);
  const total = Math.floor((end - start) / 1000);
  document.getElementById('sumDateLine').textContent = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  document.getElementById('sumStats').innerHTML = `
    <div class="sum-stat"><span class="sum-key">Started</span><span class="sum-val">${fmtTime(start)}</span></div>
    <div class="sum-stat"><span class="sum-key">Ended</span><span class="sum-val">${fmtTime(end)}</span></div>
    <div class="sum-stat"><span class="sum-key">Total session</span><span class="sum-val">${fmtSecs(total)}</span></div>
    <div class="sum-stat"><span class="sum-key">Events logged</span><span class="sum-val">${SESSION.events.length}</span></div>
  `;
  document.getElementById('sumEvents').innerHTML = SESSION.events.map(e =>
    `<div class="summary-event">${fmtTime(new Date(e.time))} — ${e.label}</div>`
  ).join('');
  document.getElementById('summaryModal').classList.add('show');
}

function closeSummary() { document.getElementById('summaryModal').classList.remove('show'); }
