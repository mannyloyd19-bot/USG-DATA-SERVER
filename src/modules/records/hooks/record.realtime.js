const { broadcast } = require('../../../realtime/broadcast');

exports.afterCreate = async (record) => {
  const data = record?.toJSON ? record.toJSON() : record;
  broadcast('records.created', {
    recordId: data?.id || null,
    collectionId: data?.collectionId || null,
    record: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};

exports.afterUpdate = async (record) => {
  const data = record?.toJSON ? record.toJSON() : record;
  broadcast('records.updated', {
    recordId: data?.id || null,
    collectionId: data?.collectionId || null,
    record: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};

exports.afterDelete = async (record) => {
  const data = record?.toJSON ? record.toJSON() : record;
  broadcast('records.deleted', {
    recordId: data?.id || null,
    collectionId: data?.collectionId || null,
    record: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};
