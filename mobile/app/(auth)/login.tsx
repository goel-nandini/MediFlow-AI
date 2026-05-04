import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { authApi, setToken } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Activity, Lock, Mail } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res.success) {
        await setToken(res.token);
        setUser(res.user, res.token);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', 'Invalid credentials');
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-12">
          <View className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-full mb-4">
            <Activity size={48} color="#3b82f6" />
          </View>
          <Text className="text-3xl font-bold text-slate-900 dark:text-white">MediFlow AI</Text>
          <Text className="text-slate-500 dark:text-slate-400 mt-2">Patient Portal</Text>
        </View>

        <View className="space-y-4">
          <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex-row items-center px-4 py-3">
            <Mail size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-slate-900 dark:text-white text-base"
              placeholder="Email address"
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
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
            className={`bg-primary-600 rounded-xl py-4 items-center flex-row justify-center ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : null}
            <Text className="text-white font-semibold text-lg">Sign In</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-slate-500 dark:text-slate-400">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text className="text-primary-600 dark:text-primary-400 font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
