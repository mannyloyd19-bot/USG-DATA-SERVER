const { exec } = require('child_process');
const path = require('path');
const Deployment = require('../models/deployment.model');

function run(command, cwd) {
  return new Promise((resolve) => {
    exec(command, { cwd, timeout: 120000, maxBuffer: 1024 * 1024 * 8 }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        output: [stdout, stderr, error ? error.message : ''].filter(Boolean).join('\n').trim()
      });
    });
  });
}

exports.getAll = async (req, res) => {
  try {
    const rows = await Deployment.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ success: true, deployments: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      appName,
      appPath,
      buildCommand,
      startCommand,
      pm2Name,
      port,
      domain
    } = req.body || {};

    if (!appName || !appPath || !pm2Name) {
      return res.status(400).json({
        success: false,
        message: 'appName, appPath, pm2Name are required'
      });
    }

    const item = await Deployment.create({
      appName,
      appPath,
      buildCommand: buildCommand || '',
      startCommand: startCommand || 'npm run dev',
      pm2Name,
      port: port || null,
      domain: domain || null,
      status: 'idle'
    });

    return res.json({ success: true, deployment: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deploy = async (req, res) => {
  try {
    const item = await Deployment.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Deployment not found' });
    }

    const cwd = path.resolve(item.appPath);
    item.status = 'deploying';
    await item.save();

    const outputs = [];

    if (item.buildCommand && String(item.buildCommand).trim()) {
      const build = await run(item.buildCommand, cwd);
      outputs.push(`$ ${item.buildCommand}\n${build.output}`);
      if (!build.ok) {
        item.status = 'failed';
        item.lastOutput = outputs.join('\n\n');
        await item.save();
        return res.status(500).json({
          success: false,
          message: 'Build failed',
          output: item.lastOutput
        });
      }
    }

    await run(`pm2 delete ${item.pm2Name}`, cwd);

    const start = await run(`pm2 start ${item.startCommand} --name ${item.pm2Name}`, cwd);
    outputs.push(`$ pm2 start ${item.startCommand} --name ${item.pm2Name}\n${start.output}`);

    item.status = start.ok ? 'running' : 'failed';
    item.lastOutput = outputs.join('\n\n');
    await item.save();

    return res.json({
      success: start.ok,
      message: start.ok ? 'Deployment completed' : 'Deployment failed',
      output: item.lastOutput
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.stop = async (req, res) => {
  try {
    const item = await Deployment.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Deployment not found' });
    }

    const result = await run(`pm2 stop ${item.pm2Name}`, process.cwd());
    item.status = 'stopped';
    item.lastOutput = result.output;
    await item.save();

    return res.json({ success: result.ok, output: result.output });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.restart = async (req, res) => {
  try {
    const item = await Deployment.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Deployment not found' });
    }

    const result = await run(`pm2 restart ${item.pm2Name}`, process.cwd());
    item.status = result.ok ? 'running' : item.status;
    item.lastOutput = result.output;
    await item.save();

    return res.json({ success: result.ok, output: result.output });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOne = async (req, res) => {
  try {
    const item = await Deployment.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Deployment not found' });
    }

    await run(`pm2 delete ${item.pm2Name}`, process.cwd());
    await item.destroy();

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
