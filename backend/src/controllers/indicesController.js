const indicesService = require('../services/indicesService');

const getIndices = async (req, res, next) => {
  try {
    const indices = await indicesService.getMarketIndices();
    res.status(200).json(indices);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getIndices,
};
