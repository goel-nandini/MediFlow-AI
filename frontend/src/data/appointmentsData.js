export const appointmentsData = [
  {
    id: '1',
    name: "Mark Smith", initials: "MS", age: 28, gender: "M",
    time: "10:30 AM - 11:00 AM", date: "Today", status: "Urgent", risk: "HIGH", severity: 8,
    symptomsShort: "Persistent cough, mild fever (3 days)",
    symptomsFull: "Patient reports persistent dry cough for 3 days accompanied by mild fever of 99.5F, fatigue, and slight shortness of breath. No improvement with OTC medication.",
    duration: "3 days",
    avatarColor: "bg-red-200", avatarText: "text-red-700",
    history: { conditions: ["Asthma", "Hypertension"], allergies: ["Penicillin"], medications: ["Salbutamol", "Amlodipine"] },
    recommendation: "Chest X-ray recommended. Consider pulmonology referral if no improvement in 48 hours."
  },
  {
    id: '2',
    name: "Emily Lee", initials: "EL", age: 34, gender: "F",
    time: "11:15 AM - 11:45 AM", date: "Today", status: "Upcoming", risk: "LOW", severity: 2,
    symptomsShort: "Routine check-up, Prenatal care",
    symptomsFull: "Routine prenatal visit at 24 weeks gestation. Patient reports mild back pain and occasional ankle swelling. No bleeding or contractions.",
    duration: "Ongoing",
    avatarColor: "bg-green-200", avatarText: "text-green-700",
    history: { conditions: ["Gestational Diabetes (monitored)"], allergies: ["None"], medications: ["Folic Acid", "Iron supplements"] },
    recommendation: "Continue prenatal vitamins. Schedule glucose tolerance test. Next visit in 4 weeks."
  },
  {
    id: '3',
    name: "James Davis", initials: "JD", age: 62, gender: "M",
    time: "12:00 PM - 12:30 PM", date: "Today", status: "Urgent", risk: "HIGH", severity: 9,
    symptomsShort: "High blood pressure, mild headaches",
    symptomsFull: "Patient presents with BP reading of 180/110 mmHg, persistent frontal headache for 2 days, slight blurred vision, and dizziness on standing. History of uncontrolled hypertension.",
    duration: "2 days",
    avatarColor: "bg-yellow-200", avatarText: "text-yellow-700",
    history: { conditions: ["Hypertension", "Type 2 Diabetes", "High Cholesterol"], allergies: ["Sulfa drugs"], medications: ["Metformin", "Atorvastatin", "Lisinopril"] },
    recommendation: "Immediate BP management required. ECG and renal function tests advised. Consult Cardiologist urgently."
  },
  {
    id: '4',
    name: "Sarah Chen", initials: "SC", age: 28, gender: "F",
    time: "10:30 AM - 11:00 AM", date: "Today", status: "Completed", risk: "LOW", severity: 3,
    symptomsShort: "Persistent cough, mild fever (3 days)",
    symptomsFull: "Follow-up visit for upper respiratory tract infection. Patient reports significant improvement after antibiotic course. Mild residual cough remains.",
    duration: "7 days",
    avatarColor: "bg-purple-200", avatarText: "text-purple-700",
    history: { conditions: ["None"], allergies: ["Dust", "Pollen"], medications: ["Cetirizine"] },
    recommendation: "Complete remaining antibiotic course. Antihistamine prescribed for allergic rhinitis. Follow up if symptoms return."
  },
  {
    id: '5',
    name: "Robert Jones", initials: "RJ", age: 34, gender: "M",
    time: "11:15 AM - 11:45 AM", date: "Today", status: "Upcoming", risk: "MEDIUM", severity: 5,
    symptomsShort: "Routine check-up, Prenatal care",
    symptomsFull: "Annual physical examination. Patient reports intermittent lower back pain over 2 weeks, likely due to prolonged sitting at desk job. Mild fatigue noted.",
    duration: "2 weeks",
    avatarColor: "bg-blue-200", avatarText: "text-blue-700",
    history: { conditions: ["Mild Lumbar Spondylosis"], allergies: ["NSAIDs (mild reaction)"], medications: ["Vitamin D", "Calcium supplements"] },
    recommendation: "Physiotherapy referral recommended. Ergonomic workspace assessment advised. MRI of lumbar spine if no improvement in 3 weeks."
  },
  {
    id: '6',
    name: "Laura Wilson", initials: "LW", age: 62, gender: "F",
    time: "11:00 PM - 12:30 PM", date: "Today", status: "Upcoming", risk: "MEDIUM", severity: 6,
    symptomsShort: "Routine check-up, mild headaches",
    symptomsFull: "Patient reports recurring mild headaches 3–4 times per week for the past month, fatigue, and unexpected weight loss of 4kg over 6 weeks. Thyroid function pending review.",
    duration: "1 month",
    avatarColor: "bg-red-200", avatarText: "text-red-700",
    history: { conditions: ["Hypothyroidism", "Anemia"], allergies: ["Iodine contrast"], medications: ["Levothyroxine", "Iron tablets"] },
    recommendation: "Thyroid panel and CBC blood work required. Review Levothyroxine dosage. Oncology screening referral to rule out underlying causes of weight loss."
  }
];
