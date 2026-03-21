const { exec } = require('child_process');

function run(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: 15000, maxBuffer: 1024 * 1024 * 8 }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        output: [stdout, stderr].filter(Boolean).join('\n').trim()
      });
    });
  });
}

exports.unified = async (req, res) => {
  try {
    const lines = Number(req.query.lines || 120);
    const pm2 = await run(`pm2 logs --lines ${lines} --nostream`);
    return res.json({
      success: true,
      logs: {
        source: 'pm2',
        lines,
        output: pm2.output || ''
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
