window.USGValidationKit = {
  required(value, label) {
    if (value === undefined || value === null || String(value).trim() === '') {
      return `${label} is required`;
    }
    return null;
  },

  minLength(value, label, min) {
    if (String(value || '').trim().length < min) {
      return `${label} must be at least ${min} characters`;
    }
    return null;
  },

  email(value, label = 'Email') {
    const v = String(value || '').trim();
    if (!v) return null;
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    return ok ? null : `${label} is invalid`;
  },

  domain(value, label = 'Domain') {
    const v = String(value || '').trim().toLowerCase();
    if (!v.endsWith('.usg')) return `${label} must end with .usg`;
    return null;
  },

  route(value, label = 'Route Path') {
    const v = String(value || '').trim();
    if (!v.startsWith('/')) return `${label} must start with /`;
    return null;
  },

  collect(errors) {
    return errors.filter(Boolean);
  }
};
