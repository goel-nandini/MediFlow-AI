import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { triageApi } from '../../lib/api';
import { Send, Bot, User, CalendarPlus, Activity } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  triageData?: {
    risk: string;
    reason: string;
    recommendation: string;
  };
}

export default function ChatScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: `Hi ${user?.name || 'there'}, I'm the AI Triage Assistant. Please describe your symptoms.`, isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!inputText.trim() || loading || isDone) return;

    const userMessage = { id: Date.now().toString(), text: inputText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      if (!sessionId) {
        const res = await triageApi.start({ 
          symptoms: userMessage.text, 
          patientName: user?.name || 'Unknown',
          patientId: user?.id
        });
        if (res.success) {
          setSessionId(res.sessionId);
          handleAgentResponse(res.agentResult);
        }
      } else {
        const res = await triageApi.respond({ sessionId, answer: userMessage.text });
        if (res.success) {
          handleAgentResponse(res.agentResult);
        }
      }
    } catch (err) {
      console.error('Triage error:', err);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "I'm sorry, I'm having trouble connecting to the server.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentResponse = (agentResult: any) => {
    if (agentResult.done) {
      setIsDone(true);
      const triageObj = {
        risk: agentResult.triage?.risk || 'UNKNOWN',
        reason: agentResult.triage?.reason || '',
        recommendation: agentResult.decision?.recommendation || '',
        specialistNeeded: agentResult.decision?.specialistNeeded || ''
      };
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "Assessment Complete.", isBot: true, triageData: triageObj }]);
    } else if (agentResult.nextQuestion) {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: agentResult.nextQuestion, isBot: true }]);
    } else {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "Please wait...", isBot: true }]);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50 dark:bg-slate-900 pt-12"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="px-5 pb-4 border-b border-slate-200 dark:border-slate-800 flex-row items-center">
        <View className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-full mr-3">
          <Bot size={24} color="#3b82f6" />
        </View>
        <View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">AI Assistant</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-sm">Symptom Assessment</Text>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
      >
        {messages.map((msg) => (
          <View key={msg.id} className={`flex-row mb-4 ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            {msg.isBot && (
              <View className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-2">
                <Bot size={16} color="#3b82f6" />
              </View>
            )}
            
            <View className={`rounded-2xl max-w-[85%] ${msg.isBot ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700' : 'bg-primary-600'}`}>
              
              {!msg.triageData ? (
                <View className="p-4">
                  <Text className={`text-base ${msg.isBot ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
                    {msg.text}
                  </Text>
                </View>
              ) : (
                <View className="w-full">
                  <View className="p-4 border-b border-slate-100 dark:border-slate-700">
                    <Text className="font-bold text-lg text-slate-900 dark:text-white mb-2">Triage Report</Text>
                    
                    <View className="flex-row items-center mb-2">
                      <Activity size={16} color={msg.triageData.risk === 'EMERGENCY' ? '#ef4444' : '#f59e0b'} className="mr-2" />
                      <Text className={`font-semibold ${msg.triageData.risk === 'EMERGENCY' ? 'text-red-500' : 'text-amber-500'}`}>
                        Risk Level: {msg.triageData.risk}
                      </Text>
                    </View>
                    
                    <Text className="text-slate-700 dark:text-slate-300 font-medium mb-1 mt-2">Reasoning:</Text>
                    <Text className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                      {msg.triageData.reason}
                    </Text>

                    <Text className="text-slate-700 dark:text-slate-300 font-medium mb-1">Recommendation:</Text>
                    <Text className="text-slate-600 dark:text-slate-400 text-sm">
                      {msg.triageData.recommendation}
                    </Text>

                    {msg.triageData.specialistNeeded && (
                      <View className="mt-3 bg-primary-50 dark:bg-primary-900/20 p-3 rounded-xl border border-primary-100 dark:border-primary-900/50">
                        <Text className="text-primary-800 dark:text-primary-300 font-semibold text-sm">
                          Recommended Specialist:
                        </Text>
                        <Text className="text-primary-600 dark:text-primary-400 font-bold">
                          {msg.triageData.specialistNeeded}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <TouchableOpacity 
                    onPress={() => {
                      if (msg.triageData?.specialistNeeded) {
                        router.push(`/book-appointment?specialization=${encodeURIComponent(msg.triageData.specialistNeeded)}`);
                      } else {
                        router.push('/book-appointment');
                      }
                    }}
                    className="p-4 flex-row items-center justify-center bg-primary-50 dark:bg-primary-900/20 rounded-b-2xl"
                  >
                    <CalendarPlus size={18} color="#3b82f6" className="mr-2" />
                    <Text className="text-primary-600 font-semibold">Book Appointment</Text>
                  </TouchableOpacity>
                </View>
              )}

            </View>
            
            {!msg.isBot && (
              <View className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center ml-2">
                <User size={16} color="#64748b" />
              </View>
            )}
          </View>
        ))}
        {loading && (
          <View className="flex-row justify-start mb-4">
            <View className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-2">
              <Bot size={16} color="#3b82f6" />
            </View>
            <View className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          </View>
        )}
      </ScrollView>

      {isDone ? (
        <View className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 items-center">
          <Text className="text-slate-500 dark:text-slate-400">Assessment Complete.</Text>
          <TouchableOpacity onPress={() => { setMessages([{ id: '1', text: 'Hi again. What are your symptoms?', isBot: true }]); setSessionId(null); setIsDone(false); }} className="mt-2 py-2 px-4 rounded-full bg-slate-100 dark:bg-slate-700">
            <Text className="text-slate-700 dark:text-slate-300">Start New Assessment</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex-row items-center">
          <TextInput
            style={{ color: '#0f172a' }} // hardcoded color for visibility to avoid nativewind text color issues on inputs
            className="flex-1 bg-slate-100 dark:bg-slate-200 text-slate-900 px-4 py-3 rounded-full mr-2"
            placeholder="Type your symptoms..."
            placeholderTextColor="#64748b"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity 
            onPress={sendMessage}
            disabled={loading || !inputText.trim()}
            className={`w-12 h-12 rounded-full items-center justify-center ${loading || !inputText.trim() ? 'bg-slate-200 dark:bg-slate-700' : 'bg-primary-600'}`}
          >
            <Send size={20} color={loading || !inputText.trim() ? '#94a3b8' : 'white'} />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
