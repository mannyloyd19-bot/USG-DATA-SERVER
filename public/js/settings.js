requireAuth();

const settingsList = document.getElementById('settings-list');
const systemInfoEl = document.getElementById('system-info');
const settingForm = document.getElementById('setting-form');

async function loadSettings() {
  settingsList.innerHTML = '<div class="muted">Loading settings...</div>';

  try {
    const [settingsRes, infoRes] = await Promise.all([
      apiFetch('/api/settings'),
      apiFetch('/api/settings/system-info')
    ]);

    const settings = await settingsRes.json();
    const info = await infoRes.json();

    systemInfoEl.textContent = JSON.stringify(info, null, 2);

    if (!Array.isArray(settings) || settings.length === 0) {
      settingsList.innerHTML = '<div class="muted">No settings found.</div>';
      return;
    }

    settingsList.innerHTML = settings.map(item => `
      <div class="item-card">
        <div><strong>${item.label || item.key}</strong></div>
        <div class="muted">${item.key}</div>
        <div class="muted">group: ${item.group}</div>
        <pre>${JSON.stringify(item.value, null, 2)}</pre>
      </div>
    `).join('');
  } catch (error) {
    settingsList.innerHTML = `<div class="muted">${error.message}</div>`;
  }
}

settingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const key = document.getElementById('setting-key').value.trim();
  const group = document.getElementById('setting-group').value.trim();
  const label = document.getElementById('setting-label').value.trim();
  const description = document.getElementById('setting-description').value.trim();
  const valueText = document.getElementById('setting-value').value.trim();

  let value;
  try {
    value = valueText ? JSON.parse(valueText) : null;
  } catch {
    alert('Setting value must be valid JSON');
    return;
  }

  try {
    const res = await apiFetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        group: group || 'general',
        label: label || key,
        description: description || null,
        value
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to save setting');

    settingForm.reset();
    loadSettings();
  } catch (error) {
    alert(error.message);
  }
});

loadSettings();
