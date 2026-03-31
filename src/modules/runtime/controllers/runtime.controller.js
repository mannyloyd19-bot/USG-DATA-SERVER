const { exec } = require('child_process');
const os = require('os');

function run(command) {
  return new Promise((resolve) => {
    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout: stdout ? stdout.trim() : '',
        stderr: stderr ? stderr.trim() : '',
        error: error ? error.message : null
      });
    });
  });
}

exports.status = async (req, res) => {
  try {
    const [pm2, uptime] = await Promise.all([
      run('pm2 jlist'),
      run('pm2 list')
    ]);

    return res.json({
      success: true,
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        uptimeSeconds: os.uptime(),
        freeMem: os.freemem(),
        totalMem: os.totalmem(),
        cpuCount: os.cpus().length
      },
      pm2Json: pm2.stdout || '[]',
      pm2Text: uptime.stdout || ''
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to read runtime status',
      error: error.message
    });
  }
};

exports.pm2Restart = async (req, res) => {
  const name = req.body?.name || 'all';
  const cmd = name === 'all' ? 'pm2 restart all' : `pm2 restart ${name}`;
  const result = await run(cmd);
  return res.json({ success: result.ok, result });
};

exports.pm2Stop = async (req, res) => {
  const name = req.body?.name || 'all';
  const cmd = name === 'all' ? 'pm2 stop all' : `pm2 stop ${name}`;
  const result = await run(cmd);
  return res.json({ success: result.ok, result });
};

exports.pm2Start = async (req, res) => {
  const script = req.body?.script || 'src/server.js';
  const name = req.body?.name || 'nexacore';
  const result = await run(`pm2 start ${script} --name ${name}`);
  return res.json({ success: result.ok, result });
};

exports.pm2Logs = async (req, res) => {
  const lines = Number(req.query?.lines || 60);
  const result = await run(`pm2 logs --lines ${lines} --nostream`);
  return res.json({ success: result.ok, result });
};
