const { USGClient } = require('./usg-client');

const usg = new USGClient({
  baseURL: 'http://localhost:3000',
  apiKey: 'usg_sk_live_xxxxx',
  tenantId: 'your-tenant-id',
  retries: 2,
  cacheTTL: 3000
});

async function run() {
  try {
    // Collections
    const collections = await usg.collections.list();
    console.log('Collections:', collections);

    // Records with cache
    const products = await usg.records.find('products', { limit: 10 });
    console.log('Products:', products);

    // Pagination
    const page1 = await usg.records.paginate('products', { page: 1, limit: 10 });
    console.log('Products page 1:', page1);

    // Query Builder
    const queryResult = await usg.query.run({
      collection: 'orders',
      filters: {
        status: { eq: 'pending' }
      },
      limit: 10
    });
    console.log('Query Result:', queryResult);

    // Settings
    const settings = await usg.settings.list();
    console.log('Settings:', settings);

    // API Key logs
    const logs = await usg.apiKeys.logs();
    console.log('API Key Logs:', logs);
  } catch (error) {
    console.error('USG SDK Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

run();
