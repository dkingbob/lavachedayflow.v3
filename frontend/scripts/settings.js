function showSettingsTab(name, el) {
  document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#page-settings .sidebar-item').forEach(i => i.classList.remove('active'));
  document.getElementById('stab-' + name).classList.add('active');
  if (el) el.classList.add('active');
}

async function exportData() {
  try {
    const data = await apiLoadAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dayflow-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    toast('Data exported!');
  } catch(e) { toast('Export failed'); }
}

async function importData(input) {
  const file = input.files[0]; if (!file) return;
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    const keys = Object.keys(data);
    for (const key of keys) {
      await apiSave(key, data[key]);
    }
    toast('Data imported! Refreshing...');
    setTimeout(() => location.reload(), 1200);
  } catch(e) { toast('Invalid backup file'); }
  input.value = '';
}

async function resetAllData() {
  if (!confirm('This will permanently delete ALL your data. Are you sure?')) return;
  if (!confirm('This cannot be undone. Confirm again to proceed.')) return;
  try {
    const data = await apiLoadAll();
    for (const key of Object.keys(data)) {
      await apiDel(key);
    }
    toast('All data reset. Refreshing...');
    setTimeout(() => location.reload(), 1200);
  } catch(e) { toast('Reset failed'); }
}
