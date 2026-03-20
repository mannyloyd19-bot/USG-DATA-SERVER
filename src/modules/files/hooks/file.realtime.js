const { getRealtime } = require('../../../realtime');

function send(channel, payload = {}, options = {}) {
  const realtime = getRealtime();
  if (!realtime) return;
  try {
    realtime.broadcast(channel, payload, options);
  } catch (error) {
    console.error('file realtime broadcast failed:', error.message);
  }
}

exports.afterUpload = async (file) => {
  const data = file?.toJSON ? file.toJSON() : file;
  send('files.uploaded', {
    fileId: data?.id || null,
    fileName: data?.name || data?.fileName || data?.originalName || null,
    file: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};

exports.afterDelete = async (file) => {
  const data = file?.toJSON ? file.toJSON() : file;
  send('files.deleted', {
    fileId: data?.id || null,
    fileName: data?.name || data?.fileName || data?.originalName || null,
    file: data,
    time: Date.now()
  }, {
    tenantId: data?.tenantId || null
  });
};
