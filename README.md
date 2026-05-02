# 🚑 MediFlow AI  
### *Agentic Clinical Triage & Workflow Orchestrator*

<p align="center">
  <img src="https://img.shields.io/badge/Hackathon-Veersa%202027-blue" />
  <img src="https://img.shields.io/badge/AI-Agentic%20System-purple" />
  <img src="https://img.shields.io/badge/Status-Active-success" />
  <img src="https://img.shields.io/badge/Built%20With-Next.js%20%7C%20Node.js%20%7C%20MongoDB-orange" />
</p>

---


> **MediFlow AI is NOT a chatbot.**  
> It is an **agentic system** that:

- Understands patient symptoms  
- Asks intelligent follow-up questions  
- Classifies urgency (**Emergency / High / Normal**)  
- Recommends doctors  
- **Executes real-world actions** (appointments, escalation)  

👉 **It THINKS → DECIDES → ACTS**

---

## ❗ Problem Statement

Healthcare systems today suffer from:

- ❌ Unstructured patient input  
- ❌ Delayed triage decisions  
- ❌ Inefficient specialist routing  
- ❌ Poor prioritization of urgent cases  

💡 **Impact:** Delayed care and overloaded doctors  

---

## 💡 Our Solution
Symptom → Adaptive Questions → Risk Analysis → Decision → Action

MediFlow AI introduces a **goal-driven agent system** that:

✔ Understands context  
✔ Adapts dynamically  
✔ Makes decisions  
✔ Executes workflows  

---

## 🧠 Why We Stand Out

| Capability | Traditional Systems | MediFlow AI |
|-----------|-------------------|------------|
| Reasoning | ❌ Static rules | ✅ Agentic loop |
| Questions | ❌ Fixed | ✅ Dynamic |
| Decision Making | ❌ Manual | ✅ Autonomous |
| Workflow Execution | ❌ None | ✅ Real actions |
| Explainability | ❌ Limited | ✅ Transparent |
| Prompt Access | ❌ Hidden | ✅ Editable UI |

---

## 🏗️ Architecture
User Input

    ↓
    
Orchestrator Agent

    ↓
    
Questioning Agent

    ↓
    
Memory + Knowledge

    ↓
    
Triage Agent

    ↓
    
Decision Agent

    ↓
    
Workflow Agent

    ↓
    
Final Output (Action + Explanation)

---

## 🔄 Core Agent Loop (USP 🚀)

```javascript
while(goal_not_achieved){
  analyze_input()
  decide_next_step()
  call_tool()
  update_state()
}
```             
👉 This ensures real reasoning, not scripted responses

---

## ⚙️ Features

### 🧠 Agentic Triage Engine
- Goal-driven reasoning system  

### 💬 Dynamic Questioning
- Context-based follow-up questions  

### ⚠️ Urgency Detection
- Classifies cases into:
  - Emergency  
  - High  
  - Normal  

### 👨‍⚕️ Specialist Recommendation
- Maps symptoms to relevant doctors  

### 🔄 Workflow Orchestration ⭐
- Book appointments  
- Emergency escalation  
- Suggest hospitals  

### 📄 Patient Summary Generator
- Structured report for doctors  

### 🎛 Prompt Control Panel
- Editable prompts via UI  

### 📊 Doctor Dashboard
- Priority-based patient queue  

### 🧪 Simulation Mode
- Test system with synthetic data

---

## 🖥️ User Flow
Patient Input → AI Questions → Risk Evaluation → Decision → Action → Doctor Dashboard


👉 Provides a seamless end-to-end clinical triage experience

---

## ⚙️ Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | Next.js, React, Tailwind CSS |
| Backend | Node.js (Express) |
| AI | LangChain / LLM APIs |
| Database | MongoDB |
| Deployment | Vercel, Render |
| DevOps | Docker (Optional) |

---

## 📡 API Endpoints

| Endpoint | Description |
|---------|------------|
| `/start-session` | Initialize patient session |
| `/ask-question` | Generate next question |
| `/submit-response` | Store user input |
| `/get-decision` | Return triage decision |

---

## 🧠 Agent Architecture (Multi-Agent System)

- **Orchestrator Agent** → Controls flow  
- **Questioning Agent** → Generates follow-ups  
- **Triage Agent** → Assesses risk  
- **Decision Agent** → Determines next steps  
- **Workflow Agent** → Executes actions  

👉 This modular design ensures **scalability and clean separation of concerns**

---

## 🧪 Testing Strategy

- ✅ Unit Testing (Agent logic)  
- ✅ API Testing (Postman)  
- ✅ Manual Testing (Real-world scenarios)  

---

## 🔐 Security

- Environment variables for API keys  
- Input validation  
- JWT-based authentication  

---

## 📁 Project Structure

```bash
/backend
  /controllers
  /routes
  /services
  /agents
  /models

/frontend
  /components
  /pages
  /hooks
  /store
```
## 🚀 Getting Started

```bash
git clone https://github.com/your-username/mediflow-ai

cd backend
npm install
npm run dev

cd frontend
npm install
npm run dev
```

---

## 🎯 Evaluation Focus

### 🔍 Key Strengths

- ✅ **Agentic reasoning**  
- ✅ **Workflow orchestration**  
- ✅ **System design**  
- ✅ **Modularity**  
- ✅ **Real-world applicability**  

---

## 🌍 Real-World Impact

### 🚀 Outcomes

- 🚀 **Faster triage decisions**  
- 👩‍⚕️ **Reduced burden on doctors**  
- ⚡ **Better emergency prioritization**  
- 📈 **Scalable healthcare automation**  

---

## 🎥 Demo

### 🔗 Resources

- 🔗 **Live App:** https://medi-flow-ai-gn16.vercel.app/
- 📂 **GitHub Repo:** https://github.com/Pratibha-Maurya23/MediFlow-AI.git  

---

## 🧠 Final Note

> **MediFlow AI is not just a chatbot.**  
> It is a **decision-making system that thinks, reasons, and acts in real workflows.**
  
  
