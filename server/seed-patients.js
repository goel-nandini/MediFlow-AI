require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('./models/Patient');

const patientsData = [
  { name: 'Aarav Sharma', age: '45', gender: 'Male', bloodGroup: 'O+', height: '175', weight: '70', priority: 'success', status: 'Stable', conditions: ['Hypertension'], medications: 'Amlodipine', allergies: 'None' },
  { name: 'Isha Singh', age: '32', gender: 'Female', bloodGroup: 'A+', height: '162', weight: '58', priority: 'success', status: 'Stable', conditions: [], medications: '', allergies: 'Penicillin' },
  { name: 'Rohan Gupta', age: '50', gender: 'Male', bloodGroup: 'B+', height: '180', weight: '85', priority: 'warning', status: 'Under Observation', conditions: ['Diabetes Type 2'], medications: 'Metformin', allergies: 'None' },
  { name: 'Priya Patel', age: '28', gender: 'Female', bloodGroup: 'AB+', height: '165', weight: '60', priority: 'success', status: 'Stable', conditions: ['Asthma'], medications: 'Salbutamol Inhaler', allergies: 'Dust' },
  { name: 'Vikram Singh', age: '60', gender: 'Male', bloodGroup: 'O-', height: '170', weight: '75', priority: 'emergency', status: 'Critical', conditions: ['Heart Disease'], medications: 'Aspirin, Atorvastatin', allergies: 'None' },
  { name: 'Neha Reddy', age: '22', gender: 'Female', bloodGroup: 'A-', height: '160', weight: '55', priority: 'success', status: 'Stable', conditions: [], medications: '', allergies: 'Peanuts' },
  { name: 'Karan Malhotra', age: '38', gender: 'Male', bloodGroup: 'B-', height: '178', weight: '82', priority: 'warning', status: 'Recovering', conditions: ['Post-surgery'], medications: 'Painkillers', allergies: 'None' },
  { name: 'Meera Desai', age: '55', gender: 'Female', bloodGroup: 'AB-', height: '158', weight: '65', priority: 'success', status: 'Stable', conditions: ['Osteoarthritis'], medications: 'Ibuprofen', allergies: 'None' },
  { name: 'Rahul Joshi', age: '29', gender: 'Male', bloodGroup: 'O+', height: '172', weight: '68', priority: 'success', status: 'Stable', conditions: [], medications: '', allergies: 'Pollen' },
  { name: 'Anjali Verma', age: '42', gender: 'Female', bloodGroup: 'A+', height: '163', weight: '62', priority: 'warning', status: 'Under Observation', conditions: ['Migraine'], medications: 'Sumatriptan', allergies: 'None' },
  { name: 'Aditya Kumar', age: '35', gender: 'Male', bloodGroup: 'B+', height: '176', weight: '78', priority: 'success', status: 'Stable', conditions: [], medications: '', allergies: 'None' },
  { name: 'Sneha Rao', age: '26', gender: 'Female', bloodGroup: 'O+', height: '167', weight: '59', priority: 'success', status: 'Stable', conditions: ['PCOS'], medications: 'Oral Contraceptives', allergies: 'None' },
  { name: 'Sanjay Dutt', age: '65', gender: 'Male', bloodGroup: 'A-', height: '168', weight: '72', priority: 'emergency', status: 'Critical', conditions: ['COPD'], medications: 'Bronchodilators', allergies: 'None' },
  { name: 'Pooja Sharma', age: '31', gender: 'Female', bloodGroup: 'B-', height: '155', weight: '54', priority: 'success', status: 'Stable', conditions: [], medications: '', allergies: 'Sulfa Drugs' },
  { name: 'Ravi Teja', age: '48', gender: 'Male', bloodGroup: 'AB+', height: '174', weight: '80', priority: 'warning', status: 'Under Observation', conditions: ['High Cholesterol'], medications: 'Statins', allergies: 'None' },
  { name: 'Kavita Iyer', age: '52', gender: 'Female', bloodGroup: 'O-', height: '160', weight: '66', priority: 'success', status: 'Stable', conditions: ['Hypothyroidism'], medications: 'Levothyroxine', allergies: 'None' },
  { name: 'Arjun Kapoor', age: '24', gender: 'Male', bloodGroup: 'A+', height: '182', weight: '76', priority: 'success', status: 'Stable', conditions: [], medications: '', allergies: 'None' },
  { name: 'Riya Sen', age: '27', gender: 'Female', bloodGroup: 'B+', height: '164', weight: '57', priority: 'success', status: 'Stable', conditions: [], medications: '', allergies: 'Latex' },
  { name: 'Manish Pandey', age: '40', gender: 'Male', bloodGroup: 'O+', height: '170', weight: '74', priority: 'warning', status: 'Recovering', conditions: ['Fractured Arm'], medications: 'Analgesics', allergies: 'None' },
  { name: 'Kanika', age: '14', gender: 'Female', bloodGroup: 'B-', height: '122', weight: '25', priority: 'success', status: 'Stable', conditions: [], medications: 'cd', allergies: 'eeq' }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow');
    console.log('✅ Connected to MongoDB');

    let count = await Patient.countDocuments();
    // Get the maximum patientId to avoid conflicts
    const lastPatient = await Patient.findOne().sort({ createdAt: -1 });
    let highestIdNum = 0;
    if (lastPatient && lastPatient.patientId) {
       const match = lastPatient.patientId.match(/P-(\d+)/);
       if (match) {
         highestIdNum = parseInt(match[1], 10);
       }
    }
    
    // start from max of count and highestIdNum
    let nextIdNum = Math.max(count, highestIdNum) + 1;

    let inserted = 0;
    for (let i = 0; i < patientsData.length; i++) {
      const data = patientsData[i];
      // Generate email from name to ensure uniqueness
      const email = data.name.toLowerCase().replace(/\s+/g, '') + Date.now().toString().slice(-4) + i + '@gmail.com';
      
      const patientId = `P-${String(nextIdNum).padStart(3, '0')}`;
      nextIdNum++;

      const patientObj = {
        ...data,
        patientId,
        email: email,
        password: 'password123',
        role: 'patient',
        phone: '98765432' + String(i).padStart(2, '0'),
        address: '123 Fake Street, City ' + i,
        medicalHistory: data.conditions.join(', '),
        condition: data.conditions.length > 0 ? data.conditions[0] : 'Healthy',
      };

      try {
        await Patient.create(patientObj);
        console.log(`✅ Inserted patient: ${data.name} (${email}) | ID: ${patientId}`);
        inserted++;
      } catch(err) {
        if (err.code === 11000) {
           console.log(`⚠️ Skipping duplicate email/id for: ${data.name}`);
        } else {
           throw err;
        }
      }
    }

    console.log(`🎉 Successfully seeded ${inserted} patients!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding patients:', error);
    process.exit(1);
  }
}

seed();
