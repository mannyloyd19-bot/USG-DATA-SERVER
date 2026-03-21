exports.required = (value, label) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${label} is required`;
  }
  return null;
};

exports.minLength = (value, label, min) => {
  if (String(value || '').trim().length < min) {
    return `${label} must be at least ${min} characters`;
  }
  return null;
};

exports.email = (value, label = 'Email') => {
  const v = String(value || '').trim();
  if (!v) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : `${label} is invalid`;
};

exports.domain = (value, label = 'Domain') => {
  const v = String(value || '').trim().toLowerCase();
  return v.endsWith('.usg') ? null : `${label} must end with .usg`;
};

exports.route = (value, label = 'Route Path') => {
  const v = String(value || '').trim();
  return v.startsWith('/') ? null : `${label} must start with /`;
};

exports.collect = (...errors) => errors.filter(Boolean);
