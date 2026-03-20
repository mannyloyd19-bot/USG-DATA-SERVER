const App = require('../models/app.model');
const { exec } = require('child_process');

function run(cmd) {
  return new Promise(resolve => {
    exec(cmd, (err, stdout, stderr) => {
      resolve({ ok: !err, stdout, stderr });
    });
  });
}

exports.getApps = async (req, res) => {
  const apps = await App.findAll({ order: [['createdAt','DESC']] });
  res.json({ success: true, apps });
};

exports.createApp = async (req, res) => {
  const { name, port, domain, entry } = req.body;

  if (!name || !port) {
    return res.status(400).json({ success:false, message:'name + port required' });
  }

  const app = await App.create({
    name,
    port,
    domain,
    entry: entry || 'app.js',
    status: 'stopped'
  });

  res.json({ success:true, app });
};

exports.startApp = async (req, res) => {
  const app = await App.findByPk(req.params.id);
  if (!app) return res.status(404).json({ success:false });

  await run(`pm2 start ${app.entry} --name ${app.name} -- ${app.port}`);
  app.status = 'running';
  await app.save();

  res.json({ success:true });
};

exports.stopApp = async (req, res) => {
  const app = await App.findByPk(req.params.id);
  if (!app) return res.status(404).json({ success:false });

  await run(`pm2 stop ${app.name}`);
  app.status = 'stopped';
  await app.save();

  res.json({ success:true });
};

exports.restartApp = async (req, res) => {
  const app = await App.findByPk(req.params.id);
  if (!app) return res.status(404).json({ success:false });

  await run(`pm2 restart ${app.name}`);
  app.status = 'running';
  await app.save();

  res.json({ success:true });
};

exports.deleteApp = async (req, res) => {
  await App.destroy({ where: { id: req.params.id } });
  res.json({ success:true });
};
