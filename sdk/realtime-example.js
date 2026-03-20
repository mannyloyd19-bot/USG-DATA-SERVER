const USGRealtimeClient = require('./usg-realtime-client');

const realtime = new USGRealtimeClient({
  baseURL: 'http://localhost:3000',
  apiKey: 'usg_sk_live_xxxxx',
  tenantId: 'your-tenant-id'
});

async function run() {
  try {
    await realtime.connect();
    console.log('Realtime connected');

    realtime.subscribe('*', (event) => {
      console.log('Realtime event:', event);
    });

    realtime.subscribe('records.updated', (event) => {
      console.log('Record updated event:', event);
    });

    realtime.subscribe('files.uploaded', (event) => {
      console.log('File uploaded event:', event);
    });
  } catch (error) {
    console.error('Realtime connection failed:', error.message || error);
  }
}

run();
