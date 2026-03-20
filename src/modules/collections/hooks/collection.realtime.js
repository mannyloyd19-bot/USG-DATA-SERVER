const { broadcast } = require('../../../realtime/broadcast');

exports.afterCreate = async (collection) => {
  const data = collection?.toJSON ? collection.toJSON() : collection;
  broadcast('collections.created', {
    collectionId: data?.id || null,
    name: data?.name || null,
    key: data?.key || null,
    collection: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};

exports.afterUpdate = async (collection) => {
  const data = collection?.toJSON ? collection.toJSON() : collection;
  broadcast('collections.updated', {
    collectionId: data?.id || null,
    name: data?.name || null,
    key: data?.key || null,
    collection: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};

exports.afterDelete = async (collection) => {
  const data = collection?.toJSON ? collection.toJSON() : collection;
  broadcast('collections.deleted', {
    collectionId: data?.id || null,
    name: data?.name || null,
    key: data?.key || null,
    collection: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};
