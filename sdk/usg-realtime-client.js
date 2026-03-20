class USGRealtimeClient {
  constructor({
    baseURL,
    apiKey = null,
    tenantId = null,
    tenantSlug = null,
    reconnect = true,
    reconnectInterval = 3000
  }) {
    this.baseURL = String(baseURL || '').replace(/\/$/, '');
    this.apiKey = apiKey;
    this.tenantId = tenantId;
    this.tenantSlug = tenantSlug;
    this.reconnect = reconnect;
    this.reconnectInterval = reconnectInterval;

    this.socket = null;
    this.handlers = new Map();
    this.connected = false;
    this.manualClose = false;
  }

  setApiKey(key) {
    this.apiKey = key;
    return this;
  }

  setTenant({ tenantId = null, tenantSlug = null } = {}) {
    this.tenantId = tenantId;
    this.tenantSlug = tenantSlug;
    return this;
  }

  buildURL() {
    const wsBase = this.baseURL
      .replace(/^http:/i, 'ws:')
      .replace(/^https:/i, 'wss:');

    const url = new URL(`${wsBase}/realtime`);

    if (this.apiKey) url.searchParams.set('apiKey', this.apiKey);
    if (this.tenantId) url.searchParams.set('tenantId', this.tenantId);
    if (this.tenantSlug) url.searchParams.set('tenantSlug', this.tenantSlug);

    return url.toString();
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.manualClose = false;
        this.socket = new WebSocket(this.buildURL());

        this.socket.addEventListener('open', () => {
          this.connected = true;
          resolve(true);
        });

        this.socket.addEventListener('message', (event) => {
          let payload = null;

          try {
            payload = JSON.parse(event.data);
          } catch {
            payload = { type: 'raw', data: event.data };
          }

          const eventType = payload?.type || 'message';

          if (this.handlers.has(eventType)) {
            for (const handler of this.handlers.get(eventType)) {
              try {
                handler(payload);
              } catch (err) {
                console.error('Realtime handler error:', err);
              }
            }
          }

          if (this.handlers.has('*')) {
            for (const handler of this.handlers.get('*')) {
              try {
                handler(payload);
              } catch (err) {
                console.error('Realtime wildcard handler error:', err);
              }
            }
          }
        });

        this.socket.addEventListener('close', () => {
          this.connected = false;

          if (!this.manualClose && this.reconnect) {
            setTimeout(() => {
              this.connect().catch(() => {});
            }, this.reconnectInterval);
          }
        });

        this.socket.addEventListener('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    this.manualClose = true;
    if (this.socket) {
      this.socket.close();
    }
    this.connected = false;
  }

  send(type, payload = {}) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Realtime socket is not connected');
    }

    this.socket.send(JSON.stringify({
      type,
      ...payload
    }));
  }

  subscribe(channel, handler) {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }

    this.handlers.get(channel).add(handler);

    if (this.connected) {
      try {
        this.send('subscribe', { channel });
      } catch {}
    }

    return () => this.unsubscribe(channel, handler);
  }

  unsubscribe(channel, handler) {
    if (!this.handlers.has(channel)) return;

    this.handlers.get(channel).delete(handler);

    if (this.handlers.get(channel).size === 0) {
      this.handlers.delete(channel);

      if (this.connected) {
        try {
          this.send('unsubscribe', { channel });
        } catch {}
      }
    }
  }
}

module.exports = USGRealtimeClient;
