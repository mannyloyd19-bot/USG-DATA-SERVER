const statusBox = document.getElementById('install-status');
const checkBox = document.getElementById('system-check');
const installForm = document.getElementById('install-form');
const installMessage = document.getElementById('install-message');

async function loadInstallerStatus() {
  try {
    const [statusRes, checkRes] = await Promise.all([
      fetch('/api/installer/status'),
      fetch('/api/installer/check')
    ]);

    const status = await statusRes.json();
    const check = await checkRes.json();

    statusBox.textContent = JSON.stringify(status, null, 2);
    checkBox.innerHTML = (check.checks || []).map(item => `
      <div class="check-item">
        <strong>${item.label}</strong>
        <span class="${item.ok ? 'ok' : 'bad'}">${item.ok ? 'Ready' : 'Missing'}</span>
      </div>
    `).join('');

    if (status?.data?.isInstalled) {
      installMessage.textContent = 'System is already installed.';
      installMessage.dataset.state = 'success';
      installForm.style.display = 'none';
    }
  } catch (error) {
    statusBox.textContent = JSON.stringify({ error: error.message }, null, 2);
  }
}

installForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  installMessage.textContent = '';

  const payload = {
    appName: document.getElementById('installer-app-name').value.trim(),
    companyName: document.getElementById('installer-company-name').value.trim(),
    adminUsername: document.getElementById('installer-admin-username').value.trim(),
    adminPassword: document.getElementById('installer-admin-password').value
  };

  try {
    const res = await fetch('/api/installer/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Installation failed');
    }

    installMessage.textContent = 'Installation completed successfully. You can now sign in.';
    installMessage.dataset.state = 'success';
    installForm.reset();
    loadInstallerStatus();
  } catch (error) {
    installMessage.textContent = error.message;
    installMessage.dataset.state = 'error';
  }
});

loadInstallerStatus();
