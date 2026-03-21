const realtimeService = require('../modules/realtime/services/realtime.service');

function broadcast(event, payload = {}, options = {}) {
  try {
    realtimeService.broadcast(event, payload, options);
  } catch (error) {
    console.error(`broadcast failed for ${event}:`, error.message);
  }
}

module.exports = {
  broadcast
};
