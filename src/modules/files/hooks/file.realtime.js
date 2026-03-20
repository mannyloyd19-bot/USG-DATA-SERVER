const { broadcast } = require('../../../realtime/broadcast');

exports.afterUpload = async (file) => {
  const data = file?.toJSON ? file.toJSON() : file;
  broadcast('files.uploaded', {
    fileId: data?.id || null,
    fileName: data?.originalName || data?.name || null,
    file: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};

exports.afterDelete = async (file) => {
  const data = file?.toJSON ? file.toJSON() : file;
  broadcast('files.deleted', {
    fileId: data?.id || null,
    fileName: data?.originalName || data?.name || null,
    file: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};
