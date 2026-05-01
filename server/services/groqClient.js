const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const callLLM = async (systemPrompt, userMessage) => {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage  }
    ],
    temperature: 0.3,
  });
  return completion.choices[0].message.content;
};

module.exports = { callLLM };