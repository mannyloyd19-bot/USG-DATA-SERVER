const crypto = require('crypto');

function getSecret() {
  return process.env.SIGNED_URL_SECRET || process.env.JWT_SECRET || 'usg_signed_url_secret';
}

function createSignature(payload) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('hex');
}

function generateSignedUrl({ fileId, expiresInSeconds = 900 }) {
  const expires = Math.floor(Date.now() / 1000) + Number(expiresInSeconds || 900);
  const payload = `${fileId}:${expires}`;
  const sig = createSignature(payload);
  return {
    expires,
    signature: sig,
    query: `expires=${expires}&sig=${sig}`
  };
}

function verifySignedUrl({ fileId, expires, sig }) {
  if (!fileId || !expires || !sig) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Number(expires) < now) return false;

  const payload = `${fileId}:${expires}`;
  const expected = createSignature(payload);
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(String(sig))
  );
}

module.exports = {
  generateSignedUrl,
  verifySignedUrl
};
