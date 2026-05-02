const { callLLM } = require('./groqClient');
const fs = require('fs');
const path = require('path');

const getPrompt = (id) => {
  const prompts = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../prompts/prompts.json'), 'utf8')
  );
  return prompts.find(p => p.id === id)?.content || '';
};

// Step 1: Ask follow-up question
const questioningAgent = async (symptoms, history) => {
  const systemPrompt = getPrompt('questioning_system');
  const userMessage = `
    Patient symptoms: ${symptoms}
    Conversation so far: ${JSON.stringify(history)}
    What is the ONE most important follow-up question to ask?
  `;
  return await callLLM(systemPrompt, userMessage);
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

  // Agent decides: do I have enough info?
  if (questionCount < 6) {
    // Still gathering info
    const question = await questioningAgent(symptoms, conversationHistory);
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

// Add this function at the top after require statements
const cleanJSON = (raw) => {
  // Remove all markdown code blocks
  let cleaned = raw.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();

  // Find JSON object within the string
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned;
};

module.exports = { runAgentLoop };