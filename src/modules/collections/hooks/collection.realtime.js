const { getRealtime } = require('../../../realtime');

function send(channel, payload = {}, options = {}) {
  const realtime = getRealtime();
  if (!realtime) return;
  try {
    realtime.broadcast(channel, payload, options);
  } catch (error) {
    console.error('collection realtime broadcast failed:', error.message);
  }
}

exports.afterCreate = async (collection) => {
  const data = collection?.toJSON ? collection.toJSON() : collection;
  send('collections.created', {
    collectionId: data?.id || null,
    name: data?.name || null,
    collection: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};

exports.afterUpdate = async (collection) => {
  const data = collection?.toJSON ? collection.toJSON() : collection;
  send('collections.updated', {
    collectionId: data?.id || null,
    name: data?.name || null,
    collection: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};

exports.afterDelete = async (collection) => {
  const data = collection?.toJSON ? collection.toJSON() : collection;
  send('collections.deleted', {
    collectionId: data?.id || null,
    name: data?.name || null,
    collection: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};
