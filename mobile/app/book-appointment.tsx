import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { doctorsApi, appointmentsApi, Doctor } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { User, Calendar, Clock, MapPin, ChevronLeft } from 'lucide-react-native';

export default function BookAppointmentScreen() {
  const { specialization } = useLocalSearchParams<{ specialization?: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await doctorsApi.getAll();
        if (res.success) {
          let docs = res.data;
          
          // Pre-filter or sort based on AI recommendation if provided
          if (specialization) {
            const specLower = specialization.toLowerCase();
            // Try to match specialization
            const matched = docs.filter(d => d.specialization.toLowerCase().includes(specLower));
            if (matched.length > 0) {
              docs = [...matched, ...docs.filter(d => !d.specialization.toLowerCase().includes(specLower))];
              setSelectedDoctor(matched[0]); // Auto select the first matched doctor
            }
          }
          
          setDoctors(docs);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, [specialization]);

  // Generate some upcoming dates
  const getUpcomingDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      Alert.alert('Incomplete', 'Please select a doctor, date, and time.');
      return;
    }
    
    setBooking(true);
    try {
      // Create JS Date object from selected date and time
      const dateObj = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      const isPM = selectedTime.includes('PM');
      
      let hourInt = parseInt(hours);
      if (isPM && hourInt !== 12) hourInt += 12;
      if (!isPM && hourInt === 12) hourInt = 0;
      
      dateObj.setHours(hourInt, parseInt(minutes), 0, 0);

      const payload = {
        patientId: user?.id,
        doctorId: selectedDoctor._id,
        dateTime: dateObj.toISOString(),
        reason: specialization ? `Referred for: ${specialization}` : 'General Consultation',
      };
      
      const res = await appointmentsApi.create(payload);
      if (res.success) {
        Alert.alert('Success', 'Appointment booked successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/appointments') }
        ]);
      } else {
        Alert.alert('Error', 'Failed to book appointment.');
      }
    } catch (err: any) {
      Alert.alert('Booking Failed', err.message || 'An error occurred');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900 pt-12">
      <View className="px-5 pb-4 border-b border-slate-200 dark:border-slate-800 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-slate-200 dark:bg-slate-800 rounded-full">
          <ChevronLeft size={20} color="#64748b" />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">Book Appointment</Text>
          {specialization && <Text className="text-primary-600 text-sm font-medium">Referred: {specialization}</Text>}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">Select Doctor</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
          {doctors.map(doc => (
            <TouchableOpacity 
              key={doc._id}
              onPress={() => setSelectedDoctor(doc)}
              className={`mr-4 p-4 rounded-2xl border w-64 ${selectedDoctor?._id === doc._id ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
            >
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full items-center justify-center mr-3">
                  <User size={24} color="#64748b" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-slate-900 dark:text-white" numberOfLines={1}>Dr. {doc.name}</Text>
                  <Text className="text-primary-600 text-xs">{doc.specialization}</Text>
                </View>
              </View>
              <View className="flex-row items-center mb-1">
                <MapPin size={12} color="#64748b" className="mr-1" />
                <Text className="text-slate-500 text-xs" numberOfLines={1}>{doc.clinicAddress || 'Virtual Clinic'}</Text>
              </View>
              <Text className="text-slate-700 dark:text-slate-300 font-medium text-sm mt-2">${doc.consultationFee} / session</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedDoctor && (
          <>
            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
              {getUpcomingDates().map((date, idx) => {
                const dateStr = date.toISOString();
                const isSelected = selectedDate === dateStr;
                return (
                  <TouchableOpacity 
                    key={idx}
                    onPress={() => setSelectedDate(dateStr)}
                    className={`mr-3 items-center justify-center py-3 px-4 rounded-xl border ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                  >
                    <Text className={`text-xs mb-1 ${isSelected ? 'text-primary-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {date.toLocaleDateString(undefined, { weekday: 'short' })}
                    </Text>
                    <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selectedDate && (
              <>
                <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">Select Time</Text>
                <View className="flex-row flex-wrap gap-3 mb-8">
                  {selectedDoctor.availability?.timeSlots?.length > 0 
                    ? selectedDoctor.availability.timeSlots.map((time, idx) => (
                      <TouchableOpacity 
                        key={idx}
                        onPress={() => setSelectedTime(time)}
                        className={`py-2 px-4 rounded-lg border ${selectedTime === time ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                      >
                        <Text className={`font-medium ${selectedTime === time ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))
                    : ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map((time, idx) => (
                      <TouchableOpacity 
                        key={idx}
                        onPress={() => setSelectedTime(time)}
                        className={`py-2 px-4 rounded-lg border ${selectedTime === time ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                      >
                        <Text className={`font-medium ${selectedTime === time ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))
                  }
                </View>

                <TouchableOpacity 
                  onPress={handleBook}
                  disabled={booking || !selectedTime}
                  className={`bg-primary-600 py-4 rounded-xl items-center flex-row justify-center mb-10 ${booking || !selectedTime ? 'opacity-50' : ''}`}
                >
                  {booking ? <ActivityIndicator color="white" className="mr-2" /> : <Calendar size={20} color="white" className="mr-2" />}
                  <Text className="text-white font-bold text-lg">Confirm Appointment</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
