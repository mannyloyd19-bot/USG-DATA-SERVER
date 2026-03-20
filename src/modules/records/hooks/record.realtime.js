const { getRealtime } = require('../../../realtime');

function send(channel, payload = {}, options = {}) {
  const realtime = getRealtime();
  if (!realtime) return;
  try {
    realtime.broadcast(channel, payload, options);
  } catch (error) {
    console.error('record realtime broadcast failed:', error.message);
  }
}

exports.afterCreate = async (record) => {
  const data = record?.toJSON ? record.toJSON() : record;
  send('records.created', {
    collection: data?.collectionKey || data?.collection || null,
    recordId: data?.id || null,
    record: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};

exports.afterUpdate = async (record) => {
  const data = record?.toJSON ? record.toJSON() : record;
  send('records.updated', {
    collection: data?.collectionKey || data?.collection || null,
    recordId: data?.id || null,
    record: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};

exports.afterDelete = async (record) => {
  const data = record?.toJSON ? record.toJSON() : record;
  send('records.deleted', {
    collection: data?.collectionKey || data?.collection || null,
    recordId: data?.id || null,
    record: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};
