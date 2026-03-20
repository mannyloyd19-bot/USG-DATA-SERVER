class USGError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'USGError';
    this.status = details.status || 500;
    this.code = details.code || null;
    this.details = details.details || null;
    this.response = details.response || null;
  }
}

class USGClient {
  constructor({
    baseURL,
    apiKey = null,
    tenantId = null,
    tenantSlug = null,
    timeout = 15000,
    retries = 2,
    cacheTTL = 0
  }) {
    this.baseURL = String(baseURL || '').replace(/\/$/, '');
    this.apiKey = apiKey;
    this.tenantId = tenantId;
    this.tenantSlug = tenantSlug;
    this.timeout = timeout;
    this.retries = retries;
    this.cacheTTL = cacheTTL;
    this.cache = new Map();
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

  clearTenant() {
    this.tenantId = null;
    this.tenantSlug = null;
    return this;
  }

  clearCache() {
    this.cache.clear();
    return this;
  }

  buildHeaders(extra = {}) {
    return {
      ...(this.apiKey ? { Authorization: `ApiKey ${this.apiKey}` } : {}),
      ...(this.tenantId ? { 'x-tenant-id': this.tenantId } : {}),
      ...(this.tenantSlug ? { 'x-tenant-slug': this.tenantSlug } : {}),
      ...extra
    };
  }

  makeURL(path, query) {
    const url = new URL(`${this.baseURL}${path}`);
    if (query && typeof query === 'object') {
      Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }

  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async request(path, options = {}, config = {}) {
    const {
      retries = this.retries,
      cacheTTL = this.cacheTTL,
      query = null,
      useCache = false
    } = config;

    const method = String(options.method || 'GET').toUpperCase();
    const url = this.makeURL(path, query);

    const headers = this.buildHeaders(options.headers || {});
    const cacheKey = `${method}:${url}:${options.body || ''}`;

    if (useCache && cacheTTL > 0 && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() < cached.expiresAt) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await this.fetchWithTimeout(url, {
          ...options,
          headers
        });

        const contentType = res.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const payload = isJson ? await res.json().catch(() => ({})) : await res.text();

        if (!res.ok) {
          throw new USGError(
            (payload && payload.message) || `Request failed with status ${res.status}`,
            {
              status: res.status,
              response: payload,
              details: payload
            }
          );
        }

        if (useCache && cacheTTL > 0) {
          this.cache.set(cacheKey, {
            data: payload,
            expiresAt: Date.now() + cacheTTL
          });
        }

        return payload;
      } catch (error) {
        lastError = error;
        if (attempt === retries) break;
      }
    }

    if (lastError instanceof USGError) throw lastError;
    throw new USGError(lastError?.message || 'USG request failed', {
      details: lastError
    });
  }

  async paginate(path, { page = 1, limit = 10, ...query } = {}, options = {}) {
    return this.request(path, {}, {
      ...options,
      query: { page, limit, ...query },
      useCache: false
    });
  }

  auth = {
    login: async ({ username, password }) =>
      this.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      }),

    me: async () =>
      this.request('/api/auth/me', {}, { useCache: false })
  };

  tenants = {
    list: () => this.request('/api/tenants', {}, { useCache: false }),
    memberships: () => this.request('/api/tenant-memberships', {}, { useCache: false })
  };

  collections = {
    list: () =>
      this.request('/api/collections', {}, {
        useCache: true,
        cacheTTL: 5000
      }),

    create: payload =>
      this.request('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
  };

  records = {
    find: (collection, query = {}) =>
      this.request(`/api/records/${collection}`, {}, {
        query,
        useCache: true,
        cacheTTL: 3000
      }),

    paginate: (collection, opts = {}) =>
      this.paginate(`/api/records/${collection}`, opts),

    create: (collection, payload) =>
      this.request(`/api/records/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }),

    update: (collection, id, payload) =>
      this.request(`/api/records/${collection}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }),

    delete: (collection, id) =>
      this.request(`/api/records/${collection}/${id}`, {
        method: 'DELETE'
      })
  };

  query = {
    run: payload =>
      this.request('/api/query/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
  };

  files = {
    upload: async file => {
      const form = new FormData();
      form.append('file', file);

      const res = await this.fetchWithTimeout(`${this.baseURL}/api/files/upload`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: form
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new USGError(payload.message || 'Upload failed', {
          status: res.status,
          response: payload
        });
      }
      return payload;
    },

    list: () => this.request('/api/files')
  };

  webhooks = {
    list: () => this.request('/api/webhooks'),
    create: payload =>
      this.request('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
  };

  apiKeys = {
    list: () => this.request('/api/api-keys'),
    analytics: () => this.request('/api/api-key-analytics'),
    logs: () => this.request('/api/api-key-logs')
  };

  settings = {
    list: () => this.request('/api/settings'),
    create: payload =>
      this.request('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
  };
}

module.exports = {
  USGClient,
  USGError
};
