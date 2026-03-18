requireAuth();

const releaseBox = document.getElementById('release-box');

async function loadRelease() {
  try {
    const res = await apiFetch('/api/system/release');
    const data = await res.json();
    releaseBox.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    releaseBox.textContent = JSON.stringify({ error: error.message }, null, 2);
  }
}

loadRelease();
