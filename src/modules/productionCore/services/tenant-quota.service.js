exports.checkQuota = (tenant) => {
  const limits = {
    maxRecords: 10000,
    maxStorageMb: 500
  };

  if (tenant.recordCount > limits.maxRecords) {
    return { allowed: false, reason: 'Record limit exceeded' };
  }

  return { allowed: true };
};
