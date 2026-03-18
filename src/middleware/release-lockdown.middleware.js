function isTrue(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

exports.checkBootstrapAllowed = (req, res, next) => {
  const releaseLockdown = isTrue(process.env.RELEASE_LOCKDOWN, false);
  const allowBootstrap = isTrue(process.env.ALLOW_BOOTSTRAP, true);

  if (releaseLockdown || !allowBootstrap) {
    return res.status(403).json({
      message: 'Bootstrap actions are disabled in the current release mode.'
    });
  }

  next();
};

exports.checkInstallerAllowed = (req, res, next) => {
  const releaseLockdown = isTrue(process.env.RELEASE_LOCKDOWN, false);
  const allowInstaller = isTrue(process.env.ALLOW_INSTALLER, true);

  if (releaseLockdown || !allowInstaller) {
    return res.status(403).json({
      message: 'Installer is disabled in the current release mode.'
    });
  }

  next();
};
