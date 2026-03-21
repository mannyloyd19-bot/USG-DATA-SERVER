const Func = require('../models/function.model');

exports.runFunctions = async (event, payload) => {
  const funcs = await Func.findAll({
    where: { event, isActive: true }
  });

  for (const fn of funcs) {
    try {
      const handler = new Function('payload', fn.code);
      await handler(payload);
    } catch (err) {
      console.error('Function error:', err.message);
    }
  }
};
