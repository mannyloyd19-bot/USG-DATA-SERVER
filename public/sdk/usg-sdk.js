class USGClient {
  constructor(config = {}) {
    this.baseURL = (config.baseURL || '').replace(/\/+$/, '');
    this.token = config.token || '';
  }

  setToken(token) {
    this.token = token || '';
    return this;
  }

  clearToken() {
    this.token = '';
    return this;
  }

  _url(path) {
    const clean = String(path || '').replace(/^\/+/, '');
    return `${this.baseURL}/${clean}`;
  }

  _headers(extra = {}) {
    const headers = { ...extra };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  async _request(path, options = {}) {
    const res = await fetch(this._url(path), {
      ...options,
      headers: this._headers(options.headers || {})
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await res.json()
      : await res.text();

    if (!res.ok) {
      const message = data && data.message ? data.message : `Request failed with status ${res.status}`;
      throw new Error(message);
    }

    return data;
  }

  async login(username, password) {
    const data = await this._request('api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (data && data.token) {
      this.token = data.token;
    }

    return data;
  }

  async me() {
    return this._request('api/auth/me');
  }

  collections = {
    list: async () => this._request('api/collections'),
    get: async (key) => this._request(`api/collections/${encodeURIComponent(key)}`),
    create: async (payload) => this._request('api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    }),
    update: async (key, payload) => this._request(`api/collections/${encodeURIComponent(key)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    }),
    delete: async (key) => this._request(`api/collections/${encodeURIComponent(key)}`, {
      method: 'DELETE'
    })
  };

  fields = {
    list: async (collectionKey) => this._request(`api/collections/${encodeURIComponent(collectionKey)}/fields`),
    create: async (collectionKey, payload) => this._request(`api/collections/${encodeURIComponent(collectionKey)}/fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    })
  };

  records = {
    list: async (collectionKey, query = {}) => {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query || {})) {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      }
      const qs = params.toString();
      return this._request(`api/collections/${encodeURIComponent(collectionKey)}/records${qs ? `?${qs}` : ''}`);
    },
    get: async (collectionKey, recordId) =>
      this._request(`api/collections/${encodeURIComponent(collectionKey)}/records/${encodeURIComponent(recordId)}`),
    create: async (collectionKey, data) =>
      this._request(`api/collections/${encodeURIComponent(collectionKey)}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: data || {} })
      }),
    update: async (collectionKey, recordId, data) =>
      this._request(`api/collections/${encodeURIComponent(collectionKey)}/records/${encodeURIComponent(recordId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: data || {} })
      }),
    delete: async (collectionKey, recordId) =>
      this._request(`api/collections/${encodeURIComponent(collectionKey)}/records/${encodeURIComponent(recordId)}`, {
        method: 'DELETE'
      }),
    restore: async (collectionKey, recordId) =>
      this._request(`api/collections/${encodeURIComponent(collectionKey)}/records/${encodeURIComponent(recordId)}/restore`, {
        method: 'POST'
      })
  };

  files = {
    list: async () => this._request('api/files'),
    upload: async (file, options = {}) => {
      const form = new FormData();
      form.append('file', file);
      if (options.collectionKey) form.append('collectionKey', options.collectionKey);
      if (options.recordId) form.append('recordId', options.recordId);

      return this._request('api/files/upload', {
        method: 'POST',
        body: form
      });
    }
  };

  relational = {
    tables: {
      list: async () => this._request('api/relational/tables'),
      create: async (payload) => this._request('api/relational/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {})
      })
    },
    columns: {
      list: async (tableKey) => this._request(`api/relational/tables/${encodeURIComponent(tableKey)}/columns`),
      create: async (tableKey, payload) => this._request(`api/relational/tables/${encodeURIComponent(tableKey)}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {})
      })
    },
    rows: {
      list: async (tableKey) => this._request(`api/relational/tables/${encodeURIComponent(tableKey)}/rows`),
      create: async (tableKey, data) => this._request(`api/relational/tables/${encodeURIComponent(tableKey)}/rows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: data || {} })
      })
    }
  };

  settings = {
    list: async () => this._request('api/settings'),
    systemInfo: async () => this._request('api/settings/system-info')
  };

  backups = {
    list: async () => this._request('api/backups'),
    create: async () => this._request('api/backups', { method: 'POST' })
  };

  webhooks = {
    list: async () => this._request('api/webhooks'),
    create: async (payload) => this._request('api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    })
  };

  realtime = {
    connect: (onEvent) => {
      const token = this.token;
      if (!token) {
        throw new Error('Token is required for realtime connection');
      }

      const url = this._url(`api/realtime/stream?token=${encodeURIComponent(token)}`);
      const es = new EventSource(url);

      es.addEventListener('connected', (event) => {
        if (typeof onEvent === 'function') {
          try {
            onEvent('connected', JSON.parse(event.data));
          } catch {
            onEvent('connected', event.data);
          }
        }
      });

      es.addEventListener('activity', (event) => {
        if (typeof onEvent === 'function') {
          try {
            onEvent('activity', JSON.parse(event.data));
          } catch {
            onEvent('activity', event.data);
          }
        }
      });

      return es;
    }
  };
}

window.USGClient = USGClient;
