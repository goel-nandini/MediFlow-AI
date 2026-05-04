import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { removeToken } from '../../lib/api';
import { useRouter } from 'expo-router';
import { User, LogOut, Settings, Bell, CircleHelp } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: async () => {
          await removeToken();
          logout();
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900 pt-12">
      <View className="px-5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <Text className="text-2xl font-bold text-slate-900 dark:text-white">Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-primary-600 rounded-full items-center justify-center mb-4">
            <Text className="text-white text-4xl font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">{user?.name || 'Patient Name'}</Text>
          <Text className="text-slate-500 dark:text-slate-400 mt-1">{user?.email || 'patient@example.com'}</Text>
        </View>

        <View className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
          <TouchableOpacity className="flex-row items-center px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <User size={20} color="#64748b" className="mr-4" />
            <Text className="flex-1 text-base text-slate-700 dark:text-slate-200">Personal Information</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <Bell size={20} color="#64748b" className="mr-4" />
            <Text className="flex-1 text-base text-slate-700 dark:text-slate-200">Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <Settings size={20} color="#64748b" className="mr-4" />
            <Text className="flex-1 text-base text-slate-700 dark:text-slate-200">Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center px-5 py-4">
            <CircleHelp size={20} color="#64748b" className="mr-4" />
            <Text className="flex-1 text-base text-slate-700 dark:text-slate-200">Help & Support</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-red-100 dark:border-red-900/30 px-5 py-4 flex-row items-center justify-center"
        >
          <LogOut size={20} color="#ef4444" className="mr-2" />
          <Text className="text-red-500 font-semibold text-lg">Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
