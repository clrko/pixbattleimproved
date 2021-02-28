const { getGlobalCountOfBattles } = require('../models/status');

exports.getAndSendTotalCountOfBattles = async (req, res) => {
  const uptime = Number(process.uptime().toFixed(1));
  try {
    const count = await getGlobalCountOfBattles();
    return res.send({ uptime, battles: count });
  } catch (err) {
    return res.status(500).json({ uptime, error: err.message });
  }
};
