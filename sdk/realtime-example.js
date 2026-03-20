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
      console.log('ANY EVENT:', event.type, event);
    });

    realtime.subscribe('records.created', (event) => {
      console.log('records.created:', event);
    });

    realtime.subscribe('records.updated', (event) => {
      console.log('records.updated:', event);
    });

    realtime.subscribe('records.deleted', (event) => {
      console.log('records.deleted:', event);
    });

    realtime.subscribe('files.uploaded', (event) => {
      console.log('files.uploaded:', event);
    });

    realtime.subscribe('files.deleted', (event) => {
      console.log('files.deleted:', event);
    });

    realtime.subscribe('collections.created', (event) => {
      console.log('collections.created:', event);
    });

    realtime.subscribe('collections.updated', (event) => {
      console.log('collections.updated:', event);
    });

    realtime.subscribe('collections.deleted', (event) => {
      console.log('collections.deleted:', event);
    });
  } catch (error) {
    console.error('Realtime connection failed:', error.message || error);
  }
}

run();
