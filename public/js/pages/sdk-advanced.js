requireAuth();
USGShell.buildShell();

async function loadSDKAdvanced() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SDK ADVANCED',
    title: 'SDK Advanced',
    subtitle: 'Advanced integration patterns'
  });

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <section class="card" style="margin-top:18px">
      <h2>Realtime Example</h2>
      <pre>
const socket = new WebSocket("wss://usgdataserver/realtime");
socket.onmessage = (msg) => console.log(msg.data);
      </pre>
    </section>

    <section class="card" style="margin-top:18px">
      <h2>Webhook Example</h2>
      <pre>
POST /webhook
{
  "event": "record.created"
}
      </pre>
    </section>
  `;
  content.appendChild(wrap);
}
loadSDKAdvanced();
