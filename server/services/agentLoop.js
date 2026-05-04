const fs = require('fs');
const path = require('path');
const { callLLM, callLLMMessages } = require('./groqClient');

const getPrompt = (id) => {
  const prompts = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../prompts/prompts.json'), 'utf8')
  );
  return prompts.find(p => p.id === id)?.content || '';
};

const cleanJSON = (raw) => {
  let cleaned = raw.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
};

// Step 1: Ask follow-up question — now passes full history as real chat turns
const questioningAgent = async (symptoms, history) => {
  const systemPrompt = getPrompt('questioning_system');

  // ✅ Build proper multi-turn message array so model sees full conversation
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Patient initial symptoms: ${symptoms}` },
  ];

  // Replay conversation history as actual chat turns
  for (const turn of history) {
    if (turn.role === 'user' || turn.role === 'assistant') {
      messages.push({ role: turn.role, content: turn.content });
    }
  }

  messages.push({
    role: 'user',
    content: 'Based on the conversation so far, what is the ONE most important follow-up question you still need to ask? Do not repeat any question already asked.'
  });

  return await callLLMMessages(messages);
};

// Step 2: Assess urgency
const triageAgent = async (symptoms, history) => {
  const systemPrompt = getPrompt('triage_system');
  const userMessage = `
    Patient symptoms: ${symptoms}
    Full conversation: ${JSON.stringify(history)}
    Assess urgency and return ONLY this JSON:
    {
      "risk": "EMERGENCY|HIGH|NORMAL",
      "confidence": 0.0-1.0,
      "reason": "explanation",
      "keySymptoms": ["symptom1", "symptom2"]
    }
  `;
  const raw = await callLLM(systemPrompt, userMessage);
  try {
    return JSON.parse(cleanJSON(raw));
  } catch {
    return { risk: 'NORMAL', confidence: 0.5, reason: raw, keySymptoms: [] };
  }
};

// Step 3: Decide action
const decisionAgent = async (triageResult, symptoms) => {
  const systemPrompt = getPrompt('decision_system');
  const userMessage = `
    Triage result: ${JSON.stringify(triageResult)}
    Original symptoms: ${symptoms}
    Return ONLY this JSON:
    {
      "action": "BOOK_APPOINTMENT|EMERGENCY_CALL|SELF_CARE",
      "recommendation": "what patient should do",
      "specialistNeeded": "cardiology|general|etc"
    }
  `;
  const raw = await callLLM(systemPrompt, userMessage);
  try {
    return JSON.parse(cleanJSON(raw));
  } catch {
    return { action: 'BOOK_APPOINTMENT', recommendation: raw, specialistNeeded: 'general' };
  }
};

// MAIN AGENT LOOP
const runAgentLoop = async (session) => {
  const { symptoms, conversationHistory, questionCount } = session;

  // ✅ 3 questions max (questionCount tracks patient *answers*, not agent questions)
  if (questionCount < 3) {
    const question = await questioningAgent(symptoms, conversationHistory);

    // ✅ Save agent's question into history so next call sees it
    session.conversationHistory.push({ role: 'assistant', content: question });
    await session.save();

    return {
      state: 'QUESTIONING',
      nextQuestion: question,
      done: false
    };
  }

  // Enough info — triage now
  const triage = await triageAgent(symptoms, conversationHistory);
  const decision = await decisionAgent(triage, symptoms);

  return {
    state: 'DECIDED',
    triage,
    decision,
    done: true
  };
};

module.exports = { runAgentLoop };