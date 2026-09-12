// Vercel Serverless Function Adapter for RuralCare API
const app = require('../server/index');

module.exports = (req, res) => {
  return app(req, res);
};
