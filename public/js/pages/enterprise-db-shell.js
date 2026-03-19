requireAuth();
USGShell.buildShell();

async function loadEnterpriseDb() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="grid-2">
      <section class="card">
        <div class="kicker">DATABASE MODE</div>
        <h2>Current Runtime DB</h2>
        <pre id="db-info">Loading...</pre>
      </section>

      <section class="card">
        <div class="kicker">ENTERPRISE PREP</div>
        <h2>DB Switching Guide</h2>
        <pre id="db-guide">Loading...</pre>
      </section>
    </div>
  `;

  try {
    const res = await apiFetch('/health/details');
    const data = await res.json();

    document.getElementById('db-info').textContent = JSON.stringify({
      database: data?.data?.database || 'unknown',
      environment: data?.data?.environment || 'unknown',
      jwtConfigured: data?.data?.jwtConfigured || false,
      releaseLockdown: data?.data?.releaseLockdown || false
    }, null, 2);

    document.getElementById('db-guide').textContent = `
Supported DB modes:

1. SQLite
   DB_DIALECT=sqlite
   DB_STORAGE=./database.sqlite

2. MySQL
   DB_DIALECT=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_NAME=usg_data_server
   DB_USER=root
   DB_PASSWORD=your_password

3. PostgreSQL
   DB_DIALECT=postgres
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_NAME=usg_data_server
   DB_USER=postgres
   DB_PASSWORD=your_password
`.trim();
  } catch (error) {
    document.getElementById('db-info').textContent = JSON.stringify({ error: error.message }, null, 2);
  }

  USGShell.setupRawToggles(content);
}

loadEnterpriseDb();
