const cortexService = require('../services/cortexService');
const chatActionService = require('../services/chatActionService');

exports.handleChat = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { message } = req.body || {};

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ ok: false, error: 'x-user-id header is required' });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ ok: false, error: 'message is required' });
    }

    const actionPayload = await cortexService.inferActionFromMessage(message.trim());
    const data = await chatActionService.executeChatAction(actionPayload, userId);

    return res.status(200).json({
      ok: true,
      action: actionPayload.action,
      data
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      ok: false,
      error: error.message || 'Internal server error'
    });
  }
};
