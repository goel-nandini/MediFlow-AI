const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { runAgentLoop } = require('../services/agentLoop');

// POST /api/triage/start
router.post('/start', async (req, res, next) => {
  try {
    const { symptoms, patientName } = req.body;
    
    const session = await Session.create({
      symptoms,
      patientName: patientName || 'Anonymous',
      conversationHistory: [{ role: 'user', content: symptoms }],
      questionCount: 0
    });
    
    // Run agent immediately
    const agentResult = await runAgentLoop(session);
    
    res.json({ 
      success: true, 
      sessionId: session._id,
      agentResult 
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/triage/respond
router.post('/respond', async (req, res, next) => {
  try {
    const { sessionId, answer } = req.body;
    
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    // Add answer to history
    session.conversationHistory.push({ role: 'user', content: answer });
    session.questionCount += 1;
    await session.save();
    
    // Run agent loop again
    const agentResult = await runAgentLoop(session);
    
    // If done, save results to session
    if (agentResult.done) {
      session.triageResult = agentResult.triage;
      session.decisionResult = agentResult.decision;
      session.status = 'completed';
      await session.save();
    }
    
    res.json({ success: true, agentResult });
  } catch (error) {
    next(error);
  }
});

// GET /api/triage/sessions — for doctor dashboard
router.get('/sessions', async (req, res, next) => {
  try {
    const sessions = await Session.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;