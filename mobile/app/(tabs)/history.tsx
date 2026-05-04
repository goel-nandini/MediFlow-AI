import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { triageApi, recordsApi, TriageSession, MedicalRecord } from '../../lib/api';
import { useState, useCallback, useEffect } from 'react';
import { Activity, Pill, CalendarPlus, FileText, Bot } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HistoryScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<TriageSession[]>([]);
  const [prescriptions, setPrescriptions] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    try {
      // Fetch Triage Sessions
      const triageRes = await triageApi.getSessions(user.id);
      if (triageRes.success && triageRes.data) {
        setSessions(triageRes.data);
      }

      // Fetch Medical Records (Prescriptions)
      const recordsRes = await recordsApi.getAll({ patient: user.id, type: 'Prescription' });
      if (recordsRes.success && recordsRes.data) {
        setPrescriptions(recordsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [user]);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900 pt-12">
      <View className="px-5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <Text className="text-2xl font-bold text-slate-900 dark:text-white">Health History</Text>
        <Text className="text-slate-500 dark:text-slate-400 mt-1">Past assessments and prescriptions</Text>
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
          <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">Doctor Prescriptions</Text>
          
          {prescriptions.length === 0 ? (
            <View className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 items-center justify-center mb-6">
              <Pill size={32} color="#cbd5e1" className="mb-2" />
              <Text className="text-slate-500 text-center">No prescriptions found.</Text>
            </View>
          ) : (
            prescriptions.map((record) => (
              <View key={record._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 shadow-sm">
                <View className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 pr-2">
                      <Text className="text-lg font-bold text-slate-900 dark:text-white">
                        {record.title || 'Prescription'}
                      </Text>
                      {record.doctor?.name && (
                        <Text className="text-primary-600 dark:text-primary-400 font-medium">
                          Dr. {record.doctor.name}
                        </Text>
                      )}
                    </View>
                    <Text className="text-slate-500 dark:text-slate-400 text-sm">
                      {new Date(record.recordDate).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  {record.diagnosis && (
                    <Text className="text-slate-700 dark:text-slate-300 mb-2">
                      <Text className="font-semibold">Diagnosis: </Text>{record.diagnosis}
                    </Text>
                  )}
                  
                  {record.medications && record.medications.length > 0 && (
                    <View className="mt-2 space-y-2">
                      <Text className="font-semibold text-slate-900 dark:text-white mb-1">Medications:</Text>
                      {record.medications.map((med, idx) => (
                        <View key={idx} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex-row items-center">
                          <View className="w-2 h-2 rounded-full bg-primary-500 mr-3" />
                          <View>
                            <Text className="font-bold text-slate-900 dark:text-white">{med.name} - {med.dosage}</Text>
                            <Text className="text-slate-600 dark:text-slate-400 text-xs">
                              {med.frequency} • {med.duration}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                
                <TouchableOpacity 
                  onPress={() => router.push('/appointments')}
                  className="bg-primary-50 dark:bg-primary-900/20 py-3 flex-row items-center justify-center"
                >
                  <CalendarPlus size={18} color="#3b82f6" className="mr-2" />
                  <Text className="text-primary-600 font-semibold">Book Follow-up</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4 mt-2">AI Triage History</Text>
          
          {sessions.length === 0 ? (
            <View className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 items-center justify-center mb-6">
              <Bot size={32} color="#cbd5e1" className="mb-2" />
              <Text className="text-slate-500 text-center">No AI assessments found.</Text>
            </View>
          ) : (
            sessions.map((session) => (
              <View key={session._id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-3 flex-row items-center">
                <View className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl mr-4">
                  <Activity size={24} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-slate-900 dark:text-white text-base">
                    Assessment Session
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="text-slate-500 dark:text-slate-400 text-sm">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </Text>
                    <View className="mx-2 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <Text className={`text-xs font-semibold ${session.status === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {session.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
          
        </ScrollView>
      )}
    </View>
  );
}
