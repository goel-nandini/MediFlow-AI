const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Original: system + single user message
const callLLM = async (systemPrompt, userMessage) => {
  return callLLMMessages([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ]);
};

// ✅ New: accepts full messages array (for multi-turn history)
const callLLMMessages = async (messages) => {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.3,
    });
    return completion.choices[0].message.content;
  } catch (err) {
    console.error('Groq API Error:', err.message);
    return "Could you tell me more about your symptoms?";
  }
};

module.exports = { callLLM, callLLMMessages };