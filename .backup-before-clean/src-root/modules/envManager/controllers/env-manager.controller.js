const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(process.cwd(), '.env');

function parseEnv(raw = '') {
  return raw.split(/\r?\n/).filter(Boolean).filter(line => !line.trim().startsWith('#')).map(line => {
    const idx = line.indexOf('=');
    if (idx === -1) return { key: line.trim(), value: '' };
    return {
      key: line.slice(0, idx).trim(),
      value: line.slice(idx + 1)
    };
  });
}

function maskValue(key, value) {
  const sensitive = /(token|secret|password|key)/i.test(key);
  if (!sensitive) return value;
  if (!value) return '';
  if (value.length <= 6) return '******';
  return value.slice(0, 3) + '******' + value.slice(-2);
}

exports.list = async (req, res) => {
  try {
    if (!fs.existsSync(ENV_PATH)) {
      return res.json({ success: true, env: [], envPath: ENV_PATH });
    }

    const raw = fs.readFileSync(ENV_PATH, 'utf8');
    const env = parseEnv(raw).map(item => ({
      key: item.key,
      value: maskValue(item.key, item.value),
      rawLength: item.value.length
    }));

    return res.json({ success: true, env, envPath: ENV_PATH });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.save = async (req, res) => {
  try {
    const { key, value } = req.body || {};
    if (!key) {
      return res.status(400).json({ success: false, message: 'key is required' });
    }

    let lines = [];
    if (fs.existsSync(ENV_PATH)) {
      lines = fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/);
    }

    let found = false;
    lines = lines.map(line => {
      if (line.startsWith(`${key}=`)) {
        found = true;
        return `${key}=${value ?? ''}`;
      }
      return line;
    });

    if (!found) {
      lines.push(`${key}=${value ?? ''}`);
    }

    fs.writeFileSync(ENV_PATH, lines.filter(x => x !== undefined).join('\n'));
    return res.json({ success: true, message: 'Env variable saved' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
