import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { appointmentsApi, Appointment } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Calendar, Clock, MapPin, User as UserIcon } from 'lucide-react-native';

export default function AppointmentsScreen() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentsApi.getAll({ patientId: user?.id || '' });
      if (res.success) {
        setAppointments(res.appointments);
      }
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  }, [user]);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900 pt-12">
      <View className="px-5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <Text className="text-2xl font-bold text-slate-900 dark:text-white">Appointments</Text>
        <Text className="text-slate-500 dark:text-slate-400 mt-1">Your upcoming and past visits</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {appointments.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Calendar size={64} color="#cbd5e1" />
              <Text className="text-slate-500 dark:text-slate-400 mt-4 text-lg">No appointments found</Text>
            </View>
          ) : (
            appointments.map((apt) => (
              <View key={apt._id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 mb-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      Dr. {apt.doctorName || 'Unknown Doctor'}
                    </Text>
                    <Text className="text-primary-600 dark:text-primary-400 font-medium">
                      {apt.specialization || 'General'}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${apt.status === 'Scheduled' ? 'bg-blue-100 dark:bg-blue-900/30' : apt.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <Text className={`text-xs font-semibold ${apt.status === 'Scheduled' ? 'text-blue-700 dark:text-blue-400' : apt.status === 'Completed' ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {apt.status}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center mb-2">
                  <Calendar size={16} color="#64748b" className="mr-2" />
                  <Text className="text-slate-600 dark:text-slate-300">
                    {apt.dateTime ? new Date(apt.dateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Date not set'}
                  </Text>
                </View>

                <View className="flex-row items-center mb-2">
                  <Clock size={16} color="#64748b" className="mr-2" />
                  <Text className="text-slate-600 dark:text-slate-300">
                    {apt.dateTime ? new Date(apt.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'Time not set'}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <MapPin size={16} color="#64748b" className="mr-2" />
                  <Text className="text-slate-600 dark:text-slate-300">{apt.clinicName || 'Virtual Clinic'}</Text>
                </View>
                
                {apt.reason && (
                  <View className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <Text className="text-slate-500 dark:text-slate-400 text-sm">Reason: {apt.reason}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
