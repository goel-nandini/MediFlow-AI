'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Activity, FileText, CheckCircle } from 'lucide-react';
import { appointmentsData } from '@/data/appointmentsData';

export default function CheckupPage() {
  const params = useParams();
  const router = useRouter();
  
  const patient = appointmentsData.find((p) => p.id === params.id);

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F7FF]">
        <p className="text-gray-500">Patient not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F7FF] p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <button className="flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803d] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
            <CheckCircle size={18} />
            Mark as Completed
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Patient Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${patient.avatarColor} ${patient.avatarText}`}>
                  {patient.initials}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1B4965]">{patient.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{patient.age}, {patient.gender === 'M' ? 'Male' : 'Female'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase text-gray-400 font-semibold mb-1">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    In Consultation
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400 font-semibold mb-1">Symptoms Overview</p>
                  <p className="text-sm text-gray-700">{patient.symptomsShort}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4 text-[#1B4965]">
                <Activity size={18} />
                <h3 className="font-semibold">Vitals (Last taken)</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-semibold">BP</p>
                  <p className="font-bold text-gray-800">120/80</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Heart Rate</p>
                  <p className="font-bold text-gray-800">72 bpm</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Temp</p>
                  <p className="font-bold text-gray-800">98.6°F</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Weight</p>
                  <p className="font-bold text-gray-800">165 lbs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Consultation Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full min-h-[500px] flex flex-col">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4 text-[#1B4965]">
                <FileText size={20} />
                <h3 className="font-semibold text-lg">Consultation Notes</h3>
              </div>
              
              <div className="flex-1 flex flex-col gap-4">
                <textarea 
                  className="w-full flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5FA8D3] focus:border-transparent resize-none text-gray-700"
                  placeholder="Start typing your consultation notes here..."
                ></textarea>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prescription / Recommendations</label>
                  <textarea 
                    className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5FA8D3] focus:border-transparent resize-none text-gray-700"
                    placeholder="Add medications, tests, or advice..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
