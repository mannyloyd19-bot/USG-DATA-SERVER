requireAuth();

const releaseBox = document.getElementById('release-box');
const releaseActions = document.getElementById('release-actions');

async function loadRelease() {
  try {
    const res = await apiFetch('/api/system/release');
    const data = await res.json();

    releaseBox.textContent = JSON.stringify(data, null, 2);

    const flags = data?.data || {};
    releaseActions.innerHTML = `
      <div class="flag-row">
        <strong>Release Lockdown</strong>
        <span>${flags.releaseLockdown ? 'Enabled' : 'Disabled'}</span>
      </div>
      <div class="flag-row">
        <strong>Installer</strong>
        <span>${flags.installerEnabled ? 'Enabled' : 'Disabled'}</span>
      </div>
      <div class="flag-row">
        <strong>Bootstrap</strong>
        <span>${flags.bootstrapEnabled ? 'Enabled' : 'Disabled'}</span>
      </div>
      <div class="flag-row">
        <strong>Environment</strong>
        <span>${flags.environment || 'development'}</span>
      </div>
    `;
  } catch (error) {
    releaseBox.textContent = JSON.stringify({ error: error.message }, null, 2);
  }
}

loadRelease();
