requireAuth();

const dbInfoBox = document.getElementById('db-info');
const dbGuideBox = document.getElementById('db-guide');

async function loadEnterpriseDbInfo() {
  try {
    const res = await apiFetch('/health/details');
    const data = await res.json();

    dbInfoBox.textContent = JSON.stringify({
      database: data?.data?.database || 'unknown',
      environment: data?.data?.environment || 'unknown',
      jwtConfigured: data?.data?.jwtConfigured || false,
      releaseLockdown: data?.data?.releaseLockdown || false
    }, null, 2);

    dbGuideBox.textContent = `
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

After changing .env:
- restart the server
- verify /health/details
    `.trim();
  } catch (error) {
    dbInfoBox.textContent = JSON.stringify({ error: error.message }, null, 2);
  }
}

loadEnterpriseDbInfo();
