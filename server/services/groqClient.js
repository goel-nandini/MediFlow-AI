const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const callLLM = async (systemPrompt, userMessage) => {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  }
      ],
      temperature: 0.3,
    });
    return completion.choices[0].message.content;
  } catch (err) {
    console.error('Groq API Error:', err.message);
    
    // Return a fallback response so the app does not break if the API key is invalid
    if (systemPrompt.includes('Assess urgency')) {
      return JSON.stringify({
        risk: "NORMAL",
        confidence: 0.8,
        reason: "Fallback response due to invalid API key.",
        keySymptoms: ["fever"]
      });
    } else if (systemPrompt.includes('Decide action')) {
      return JSON.stringify({
        action: "SELF_CARE",
        recommendation: "Please rest and drink plenty of fluids. (Fallback response)",
        specialistNeeded: "general"
      });
    } else {
      return "I am currently running in fallback mode because my Groq API key is invalid. Please update the API key in the server/.env file. Could you tell me more about your symptoms?";
    }
  }
};

module.exports = { callLLM };