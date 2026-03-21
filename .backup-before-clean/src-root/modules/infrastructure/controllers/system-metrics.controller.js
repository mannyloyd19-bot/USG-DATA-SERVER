const os = require('os');

exports.getMetrics = async (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const cpus = os.cpus();

    const metrics = {
      cpu: {
        cores: cpus.length,
        model: cpus[0].model
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usagePercent: ((usedMem / totalMem) * 100).toFixed(2)
      },
      system: {
        platform: os.platform(),
        uptime: os.uptime()
      }
    };

    res.json({ success: true, data: metrics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
