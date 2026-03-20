let realtimeInstance = null;

function setRealtime(instance) {
  realtimeInstance = instance;
}

function getRealtime() {
  return realtimeInstance;
}

module.exports = {
  setRealtime,
  getRealtime
};
