window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function section(title, body, kicker = 'SDK') {
  return `
    <section class="card" style="margin-top:18px">
      <div class="kicker">${kicker}</div>
      <h2>${title}</h2>
      ${body}
    </section>
  `;
}

function item(title, desc) {
  return `
    <div class="list-card">
      <strong>${title}</strong><br>
      <span class="muted">${desc}</span>
    </div>
  `;
}

function codeBlock(code, lang = '') {
  const safe = String(code || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

  return `
    <pre data-code-lang="${lang}" style="white-space:pre-wrap">${safe}</pre>
  `;
}

function copyBlock(id, code) {
  const safe = JSON.stringify(code);
  return `
    <div class="actions" style="margin-top:10px">
      <button class="ghost-btn" type="button" data-copy-sdk="${id}">Copy Code</button>
    </div>
    <script>
      window.__sdkCopies = window.__sdkCopies || {};
      window.__sdkCopies["${id}"] = ${safe};
    </script>
  `;
}

function bindCopyButtons() {
  document.querySelectorAll('[data-copy-sdk]').forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-copy-sdk');
      const value = window.__sdkCopies?.[id] || '';
      try {
        await navigator.clipboard.writeText(value);
        USGIOSAlert.show({ title: 'SDK', message: 'Code copied.' });
      } catch {
        USGIOSAlert.show({ title: 'SDK', message: 'Copy failed.', type: 'error' });
      }
    };
  });
}

function renderSDK() {
  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DEVELOPER TOOLS',
    title: 'SDK',
    subtitle: 'Developer integration guide, API patterns, and code examples for NexaCore'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Developer Resources</h2>
      </div>
      <div class="actions">
        <a href="/pages/docs.html" class="ghost-btn">Docs</a>
        <a href="/pages/api-keys.html" class="ghost-btn">API Keys</a>
        <a href="/pages/query-builder.html" class="primary-btn">Query Builder</a>
      </div>
    </div>
  `;
  content.appendChild(top);

  const baseUrlExample = `const BASE_URL = window.location.origin;`;
  const authJwtExample = `const token = "YOUR_JWT_TOKEN";

async function api(path, options = {}) {
  const res = await fetch(\`\${BASE_URL}\${path}\`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": \`Bearer \${token}\`,
      ...(options.headers || {})
    }
  });

  return res.json();
}`;
  const authApiKeyExample = `const apiKey = "YOUR_API_KEY";

async function api(path, options = {}) {
  const res = await fetch(\`\${BASE_URL}\${path}\`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      ...(options.headers || {})
    }
  });

  return res.json();
}`;
  const listCollectionsExample = `const data = await api("/api/collections");
console.log(data);`;
  const createCollectionExample = `await api("/api/collections", {
  method: "POST",
  body: JSON.stringify({
    name: "Products",
    key: "products",
    description: "Product catalog"
  })
});`;
  const createFieldExample = `await api("/api/collections/products/fields", {
  method: "POST",
  body: JSON.stringify({
    name: "Price",
    type: "NUMBER",
    required: true,
    sortable: true
  })
});`;
  const createRecordExample = `await api("/api/records", {
  method: "POST",
  body: JSON.stringify({
    collectionId: "YOUR_COLLECTION_ID",
    data: {
      name: "Sample Item",
      price: 100
    }
  })
});`;
  const uploadFileExample = `const form = new FormData();
form.append("file", fileInput.files[0]);

const res = await fetch(\`\${BASE_URL}/api/files\`, {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${token}\`
  },
  body: form
});

const data = await res.json();
console.log(data);`;
  const listDomainsExample = `const domains = await api("/api/domains");
console.log(domains);`;
  const realtimeExample = `const source = new EventSource("/api/realtime/stream");

source.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  console.log("Realtime Event:", payload);
};`;

  content.innerHTML += section('Quick Start', `
    ${item('Choose Auth Mode', 'Use JWT for operator sessions and API Keys for app/server integrations')}
    ${item('Base URL', 'Point your client to the running NexaCore instance')}
    ${codeBlock(baseUrlExample, 'javascript')}
    ${copyBlock('sdk-base-url', baseUrlExample)}
  `);

  content.innerHTML += section('Authentication', `
    <div class="grid-2">
      <div>
        ${item('JWT Authentication', 'Recommended for admin/operator dashboards and authenticated user sessions')}
        ${codeBlock(authJwtExample, 'javascript')}
        ${copyBlock('sdk-auth-jwt', authJwtExample)}
      </div>
      <div>
        ${item('API Key Authentication', 'Recommended for app-to-server integrations and automated services')}
        ${codeBlock(authApiKeyExample, 'javascript')}
        ${copyBlock('sdk-auth-apikey', authApiKeyExample)}
      </div>
    </div>
  `);

  content.innerHTML += section('Collections', `
    ${item('List Collections', 'Fetch available collections from the platform')}
    ${codeBlock(listCollectionsExample, 'javascript')}
    ${copyBlock('sdk-list-collections', listCollectionsExample)}

    ${item('Create Collection', 'Create a new collection for your app data')}
    ${codeBlock(createCollectionExample, 'javascript')}
    ${copyBlock('sdk-create-collection', createCollectionExample)}
  `);

  content.innerHTML += section('Fields & Records', `
    ${item('Create Field', 'Define schema fields inside a collection')}
    ${codeBlock(createFieldExample, 'javascript')}
    ${copyBlock('sdk-create-field', createFieldExample)}

    ${item('Create Record', 'Insert records into a collection')}
    ${codeBlock(createRecordExample, 'javascript')}
    ${copyBlock('sdk-create-record', createRecordExample)}
  `);

  content.innerHTML += section('Files & Storage', `
    ${item('Upload File', 'Send multipart file uploads to the server')}
    ${codeBlock(uploadFileExample, 'javascript')}
    ${copyBlock('sdk-upload-file', uploadFileExample)}
  `);

  content.innerHTML += section('Domains & Routing', `
    ${item('List Domains', 'Read configured domains and routing state')}
    ${codeBlock(listDomainsExample, 'javascript')}
    ${copyBlock('sdk-list-domains', listDomainsExample)}
  `);

  content.innerHTML += section('Realtime', `
    ${item('Subscribe to Events', 'Listen for server-sent realtime events')}
    ${codeBlock(realtimeExample, 'javascript')}
    ${copyBlock('sdk-realtime', realtimeExample)}
  `);

  content.innerHTML += section('Best Practices', `
    ${item('Use API Keys for External Apps', 'Avoid embedding operator JWT tokens in external deployments')}
    ${item('Design Collections First', 'Model collections and fields before building record workflows')}
    ${item('Enable Backups', 'Protect your private server state before production usage')}
    ${item('Monitor with Health & Diagnostics', 'Use System Health, Diagnostics Console, and Log Viewer during development')}
  `);

  content.innerHTML += section('Developer Shortcuts', `
    <div class="actions" style="flex-wrap:wrap">
      <a href="/pages/docs.html" class="ghost-btn">Documentation</a>
      <a href="/pages/api-keys.html" class="ghost-btn">API Keys</a>
      <a href="/pages/system-health.html" class="ghost-btn">System Health</a>
      <a href="/pages/diagnostics-console.html" class="ghost-btn">Diagnostics</a>
      <a href="/pages/query-builder.html" class="primary-btn">Query Builder</a>
    </div>
  `, 'LINKS');

  if (window.USGShell && typeof window.USGShell.setupRawToggles === 'function') {
    window.USGShell.setupRawToggles(content);
  }

  bindCopyButtons();
}

renderSDK();
