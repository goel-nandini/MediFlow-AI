import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { authApi, setToken } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Activity, Lock, Mail, User, Droplets, Ruler, Weight, Users, ActivitySquare, Pill, Stethoscope } from 'lucide-react-native';

const BLOOD_GROUPS = ["Select blood group", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const GENDERS = ["Select gender", "Male", "Female", "Non-binary", "Prefer not to say"];
const CONDITIONS = ["Diabetes", "Hypertension", "Asthma", "Heart Disease", "Thyroid Disorder", "Arthritis", "Depression/Anxiety", "None"];

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bloodGroup, setBloodGroup] = useState('Select blood group');
  const [gender, setGender] = useState('Select gender');
  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const toggleCondition = (c: string) =>
    setConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const handleRegister = async () => {
    if (!name || !email || !password || !age || !height || !weight || bloodGroup === 'Select blood group' || gender === 'Select gender') {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name, email, password, role: 'patient',
        age, height, weight, bloodGroup, gender,
        conditions, medications, allergies
      };
      
      const res = await authApi.register(payload);
      if (res.success) {
        await setToken(res.token);
        setUser(res.user, res.token);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Registration Failed', 'Could not create account');
      }
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: 60, paddingHorizontal: 24 }}>
        <View className="items-center mb-8">
          <View className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-full mb-4">
            <Activity size={48} color="#3b82f6" />
          </View>
          <Text className="text-3xl font-bold text-slate-900 dark:text-white">Create Account</Text>
          <Text className="text-slate-500 dark:text-slate-400 mt-2">Join MediFlow AI</Text>
        </View>

        <View className="space-y-4">
          <Text className="text-slate-700 dark:text-slate-300 font-semibold mb-[-8px] ml-1">Basic Details</Text>
          <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex-row items-center px-4 py-3">
            <User size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-slate-900 dark:text-white text-base"
              placeholder="Full Name *"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex-row items-center px-4 py-3">
            <Mail size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-slate-900 dark:text-white text-base"
              placeholder="Email address *"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex-row items-center px-4 py-3">
            <Lock size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-slate-900 dark:text-white text-base"
              placeholder="Password *"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Text className="text-slate-700 dark:text-slate-300 font-semibold mt-4 mb-[-8px] ml-1">Health Metrics</Text>
          <View className="flex-row space-x-3">
            <View className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
              <TextInput
                className="text-slate-900 dark:text-white text-base text-center"
                placeholder="Age *"
                placeholderTextColor="#94a3b8"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 flex-row items-center">
              <Ruler size={16} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-2 text-slate-900 dark:text-white text-base"
                placeholder="Height(cm)*"
                placeholderTextColor="#94a3b8"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View className="flex-row space-x-3">
             <View className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 flex-row items-center">
              <Weight size={16} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-2 text-slate-900 dark:text-white text-base"
                placeholder="Weight(kg)*"
                placeholderTextColor="#94a3b8"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* We use basic buttons for Dropdowns to avoid complex pickers on raw React Native */}
          <Text className="text-slate-500 dark:text-slate-400 text-xs ml-1 mt-2">Blood Group *</Text>
          <View className="flex-row flex-wrap gap-2">
            {BLOOD_GROUPS.filter(b => b !== 'Select blood group').map(b => (
              <TouchableOpacity 
                key={b} 
                onPress={() => setBloodGroup(b)}
                className={`px-3 py-2 rounded-lg border ${bloodGroup === b ? 'bg-primary-600 border-primary-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
              >
                <Text className={`${bloodGroup === b ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-slate-500 dark:text-slate-400 text-xs ml-1 mt-2">Gender *</Text>
          <View className="flex-row flex-wrap gap-2">
            {GENDERS.filter(g => g !== 'Select gender').map(g => (
              <TouchableOpacity 
                key={g} 
                onPress={() => setGender(g)}
                className={`px-3 py-2 rounded-lg border ${gender === g ? 'bg-primary-600 border-primary-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
              >
                <Text className={`${gender === g ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-slate-700 dark:text-slate-300 font-semibold mt-4 mb-[-4px] ml-1">Medical Background</Text>
          
          <Text className="text-slate-500 dark:text-slate-400 text-xs ml-1 mt-2">Pre-existing Conditions</Text>
          <View className="flex-row flex-wrap gap-2">
            {CONDITIONS.map(c => (
              <TouchableOpacity 
                key={c} 
                onPress={() => toggleCondition(c)}
                className={`px-3 py-2 rounded-full border ${conditions.includes(c) ? 'bg-slate-700 border-slate-700 dark:bg-slate-600 dark:border-slate-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
              >
                <Text className={`text-xs ${conditions.includes(c) ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex-row items-center px-4 py-3 mt-4">
            <Pill size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-slate-900 dark:text-white text-base"
              placeholder="Current Medications"
              placeholderTextColor="#94a3b8"
              value={medications}
              onChangeText={setMedications}
            />
          </View>

          <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex-row items-center px-4 py-3">
            <ActivitySquare size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-slate-900 dark:text-white text-base"
              placeholder="Known Allergies"
              placeholderTextColor="#94a3b8"
              value={allergies}
              onChangeText={setAllergies}
            />
          </View>

          <TouchableOpacity 
            onPress={handleRegister}
            disabled={loading}
            className={`bg-primary-600 rounded-xl py-4 items-center flex-row justify-center mt-6 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : null}
            <Text className="text-white font-semibold text-lg">Complete Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8 pb-10">
          <Text className="text-slate-500 dark:text-slate-400">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary-600 dark:text-primary-400 font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
