function toBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

function toStr(value, fallback = '') {
  return value === undefined || value === null || value === '' ? fallback : String(value);
}

module.exports = {
  NODE_ENV: toStr(process.env.NODE_ENV, 'development'),
  PORT: Number(process.env.PORT || 3000),
  DB_DIALECT: toStr(process.env.DB_DIALECT, 'sqlite'),
  JWT_SECRET: toStr(process.env.JWT_SECRET, ''),
  HELMET_ENABLED: toBool(process.env.HELMET_ENABLED, true),
  CORS_ENABLED: toBool(process.env.CORS_ENABLED, true),
  INSTALLER_ENABLED: toBool(process.env.INSTALLER_ENABLED, true),
  RELEASE_LOCKDOWN: toBool(process.env.RELEASE_LOCKDOWN, false),
  ALLOW_BOOTSTRAP: toBool(process.env.ALLOW_BOOTSTRAP, true),
  ALLOW_INSTALLER: toBool(process.env.ALLOW_INSTALLER, true)
};
