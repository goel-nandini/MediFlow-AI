import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { Activity, Calendar as CalendarIcon, Clock, HeartPulse } from 'lucide-react-native';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { appointmentsApi, Appointment } from '../../lib/api';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      if (!user) return;
      const res = await appointmentsApi.getAll({ patientId: user.id });
      if (res.success && res.appointments.length > 0) {
        // Filter for scheduled appointments in the future, sort by closest date
        const scheduled = res.appointments
          .filter(a => a.status === 'Scheduled' && new Date(a.dateTime || 0).getTime() > Date.now())
          .sort((a, b) => new Date(a.dateTime || 0).getTime() - new Date(b.dateTime || 0).getTime());
        
        if (scheduled.length > 0) {
          setUpcomingAppointment(scheduled[0]);
        } else {
          // Fallback to most recent completed or any
          setUpcomingAppointment(res.appointments[0]);
        }
      } else {
        setUpcomingAppointment(null);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, [user]);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900 pt-12">
      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-500 dark:text-slate-400 text-base">Welcome back,</Text>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{user?.name || 'Patient'}</Text>
          </View>
          <View className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full">
            <UserAvatar name={user?.name || 'P'} />
          </View>
        </View>

        <View className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
          <View className="flex-row items-center mb-4">
            <View className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg mr-3">
              <Activity size={20} color="#3b82f6" />
            </View>
            <Text className="text-lg font-semibold text-slate-900 dark:text-white">AI Health Triage</Text>
          </View>
          <Text className="text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
            Not feeling well? Describe your symptoms to our AI agent to get an immediate preliminary assessment.
          </Text>
          <TouchableOpacity 
            onPress={() => router.push('/chat')}
            className="bg-primary-600 py-3 rounded-xl items-center"
          >
            <Text className="text-white font-medium">Start Assessment</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Appointments</Text>
          <TouchableOpacity onPress={() => router.push('/appointments')}>
            <Text className="text-primary-600 text-sm font-medium">See all</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-3 items-center justify-center">
            <ActivityIndicator color="#3b82f6" />
          </View>
        ) : upcomingAppointment ? (
          <TouchableOpacity 
            onPress={() => router.push('/appointments')}
            className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <View className="bg-green-100 dark:bg-green-900/40 p-3 rounded-xl mr-4">
                <CalendarIcon size={24} color="#10b981" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="font-semibold text-slate-900 dark:text-white text-base truncate" numberOfLines={1}>
                  Dr. {upcomingAppointment.doctorName || 'Unknown'}
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-sm truncate" numberOfLines={1}>
                  {upcomingAppointment.specialization || 'General'}
                </Text>
              </View>
            </View>
            <View className="items-end pl-2 border-l border-slate-100 dark:border-slate-700">
              <Text className="font-medium text-slate-900 dark:text-white">
                {upcomingAppointment.dateTime ? new Date(upcomingAppointment.dateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs">
                {upcomingAppointment.dateTime ? new Date(upcomingAppointment.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-3 items-center justify-center">
            <CalendarIcon size={32} color="#cbd5e1" className="mb-2" />
            <Text className="text-slate-500 text-center">No upcoming appointments.</Text>
          </View>
        )}

        <View className="flex-row justify-between mt-4">
          <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex-1 mr-2 shadow-sm">
            <HeartPulse size={24} color="#ef4444" className="mb-2" />
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">72</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm">BPM</Text>
          </View>
          <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex-1 ml-2 shadow-sm">
            <Clock size={24} color="#8b5cf6" className="mb-2" />
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">120/80</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm">BP</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

function UserAvatar({ name }: { name: string }) {
  return (
    <View className="w-10 h-10 bg-primary-600 rounded-full items-center justify-center">
      <Text className="text-white font-bold text-lg">{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}
