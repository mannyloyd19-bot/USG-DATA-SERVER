exports.requireFields = (body, fields = []) => {
  const missing = [];

  for (const f of fields) {
    if (!body[f]) missing.push(f);
  }

  if (missing.length) {
    const err = new Error('Missing fields: ' + missing.join(', '));
    err.status = 400;
    throw err;
  }
};
