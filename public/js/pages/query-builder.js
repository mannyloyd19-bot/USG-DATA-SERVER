requireAuth();
USGShell.buildShell();

async function loadQueryBuilder() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'QUERY BUILDER',
    title: 'Query Builder',
    subtitle: 'Test API queries and explore data'
  });

  const card = document.createElement('section');
  card.className = 'card';
  card.style.marginTop = '18px';

  card.innerHTML = `
    <div class="kicker">REQUEST</div>
    <h2>Test API</h2>

    <input id="qb-url" placeholder="/api/collections" style="width:100%;margin:10px 0;padding:12px;border-radius:12px">
    <select id="qb-method" style="width:100%;margin:10px 0;padding:12px;border-radius:12px">
      <option>GET</option>
      <option>POST</option>
    </select>

    <textarea id="qb-body" placeholder="JSON Body" style="width:100%;height:120px"></textarea>

    <div class="actions">
      <button id="run-query-btn" class="primary-btn">Run</button>
    </div>

    <pre id="qb-result" style="margin-top:16px"></pre>
  `;

  content.appendChild(card);

  document.getElementById('run-query-btn').onclick = async () => {
    const url = document.getElementById('qb-url').value;
    const method = document.getElementById('qb-method').value;
    const body = document.getElementById('qb-body').value;

    try {
      const res = await apiFetch(url, {
        method,
        body: body ? body : undefined
      });
      const txt = await res.text();
      document.getElementById('qb-result').textContent = txt;
    } catch (e) {
      document.getElementById('qb-result').textContent = e.message;
    }
  };
}
loadQueryBuilder();
