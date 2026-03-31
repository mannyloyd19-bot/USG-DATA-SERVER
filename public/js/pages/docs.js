window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function section(title, body) {
  return `
    <section class="card" style="margin-top:18px">
      <div class="kicker">DOCS</div>
      <h2>${title}</h2>
      ${body}
    </section>
  `;
}

function codeBlock(code) {
  return `<pre style="white-space:pre-wrap">${code}</pre>`;
}

function item(title, desc) {
  return `
    <div class="list-card">
      <strong>${title}</strong><br>
      <span class="muted">${desc}</span>
    </div>
  `;
}

function loadDocs() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'REFERENCE',
    title: 'Documentation',
    subtitle: 'Guides, API usage, and integration for NexaCore'
  });

  // ===== GET STARTED =====
  content.innerHTML += section('Getting Started', `
    ${item('What is NexaCore', 'Private company-owned data server with auth, collections, records, files, and APIs')}
    ${item('Core Modules', 'Auth, Collections, Fields, Records, Files, API, Realtime')}
  `);

  // ===== AUTH =====
  content.innerHTML += section('Authentication (JWT)', `
    ${item('Login', 'Authenticate user and receive JWT token')}
    ${codeBlock(`POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password"
}`)}

    ${item('Use Token', 'Include JWT in headers')}
    ${codeBlock(`Authorization: Bearer YOUR_TOKEN`)}
  `);

  // ===== API KEYS =====
  content.innerHTML += section('API Keys', `
    ${item('Create API Key', 'Generate API keys from dashboard')}
    ${item('Usage', 'Use API key instead of JWT for external apps')}
    ${codeBlock(`x-api-key: YOUR_API_KEY`)}
  `);

  // ===== COLLECTIONS =====
  content.innerHTML += section('Collections & Records', `
    ${item('Create Collection', 'Defines a data container')}
    ${codeBlock(`POST /api/collections
{
  "name": "Products",
  "key": "products"
}`)}

    ${item('Add Field', 'Define schema')}
    ${codeBlock(`POST /api/collections/products/fields
{
  "name": "Price",
  "type": "NUMBER"
}`)}

    ${item('Create Record', 'Insert data')}
    ${codeBlock(`POST /api/records
{
  "collectionId": "collection-id",
  "data": { "name": "Item", "price": 100 }
}`)}
  `);

  // ===== FILES =====
  content.innerHTML += section('Files & Storage', `
    ${item('Upload File', 'Store assets in storage system')}
    ${codeBlock(`POST /api/files/upload`)}
    ${item('Storage Buckets', 'Organize files per group')}
  `);

  // ===== DOMAINS =====
  content.innerHTML += section('Domains', `
    ${item('Connect Domain', 'Bind your domain to USG server')}
    ${item('DNS Setup', 'Configure A record and MX (optional)')}
    ${item('SSL', 'Automatic SSL handling')}
  `);

  // ===== REALTIME =====
  content.innerHTML += section('Realtime', `
    ${item('Events', 'Subscribe to live updates')}
    ${item('Use Cases', 'Notifications, dashboards, live data')}
  `);

  // ===== BACKUPS =====
  content.innerHTML += section('Backups', `
    ${item('Auto Backup', 'Automatic system backup')}
    ${item('Restore', 'Recover data from backup')}
  `);

  // ===== SYSTEM =====
  content.innerHTML += section('System & Monitoring', `
    ${item('System Health', 'Check system status')}
    ${item('Queue Monitor', 'Track jobs')}
    ${item('Diagnostics Console', 'Debug system')}
  `);

  // ===== BEST PRACTICES =====
  content.innerHTML += section('Best Practices', `
    ${item('Use API Keys for Apps', 'Avoid exposing JWT in public apps')}
    ${item('Use Collections as Schemas', 'Design your data properly')}
    ${item('Enable Backups', 'Always protect your data')}
  `);
}

loadDocs();
