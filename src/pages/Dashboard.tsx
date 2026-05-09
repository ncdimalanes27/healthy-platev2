import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { calculateTargetCalories, calculateBMI, getBMICategory } from '../utils/calculations';
import { TrendingUp, Droplets, Scale, ChevronRight, Flame, Star, AlertTriangle, TrendingUp as ProgressIcon, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { HealthProfile, DailyLog, DieticianNote } from '../types';

function StatCard({ label, value, unit, color, icon: Icon }: any) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        <span className="text-sm text-gray-400 mb-0.5">{unit}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { currentUser, getProfile, getTodayLog, getNotesForCurrentPatient } = useStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [notes, setNotes] = useState<DieticianNote[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (currentUser?.id) {
        const userProfile = await getProfile(currentUser.id);
        const log = await getTodayLog(currentUser.id);
        const userNotes = await getNotesForCurrentPatient();
        setProfile(userProfile);
        setTodayLog(log);
        setNotes(userNotes);
      }
    };
    loadData();
  }, [currentUser?.id, getProfile, getTodayLog, getNotesForCurrentPatient]);

  const targetCals = profile ? calculateTargetCalories(profile) : 2000;
  const consumed = todayLog?.total_calories || 0;
  const remaining = targetCals - consumed;
  const progressPct = Math.min((consumed / targetCals) * 100, 100);

  const bmi = profile ? calculateBMI(profile.weight, profile.height) : null;
  const bmiInfo = bmi ? getBMICategory(bmi) : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-green-600 font-semibold text-sm">{greeting} 👋</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
          {currentUser?.name}
        </h1>
        <p className="text-gray-400 text-sm mt-1">{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Calorie ring + stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Calorie progress */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm md:col-span-1">
          <p className="text-sm font-medium text-gray-500 mb-4">Today's Calories</p>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#dcfce7" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke="#16a34a" strokeWidth="8"
                  strokeDasharray={`${(progressPct / 100) * 201} 201`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">{Math.round(progressPct)}%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div>
                <span className="text-2xl font-bold text-gray-900">{consumed}</span>
                <span className="text-sm text-gray-400"> / {targetCals}</span>
              </div>
              <p className="text-xs text-gray-500">
                {remaining > 0 ? (
                  <span className="text-green-600 font-medium">{remaining} kcal remaining</span>
                ) : (
                  <span className="text-orange-500 font-medium">Over by {Math.abs(remaining)} kcal</span>
                )}
              </p>
            </div>
          </div>
          {/* Macro bars */}
          <div className="mt-4 space-y-2">
            {[
              { label: 'Protein', val: todayLog?.total_protein || 0, max: 120, color: 'bg-blue-500' },
              { label: 'Carbs', val: todayLog?.total_carbs || 0, max: 250, color: 'bg-amber-400' },
              { label: 'Fat', val: todayLog?.total_fat || 0, max: 65, color: 'bg-pink-400' },
            ].map(({ label, val, max, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-12">{label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min((val / max) * 100, 100)}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">{val}g</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <StatCard label="BMI" value={bmi || '--'} unit={bmiInfo?.label} color="bg-green-500" icon={Scale} />
          <StatCard label="Target Calories" value={targetCals} unit="kcal" color="bg-orange-400" icon={Flame} />
          <StatCard label="Blood Sugar" value={todayLog?.blood_sugar || '--'} unit="mg/dL" color="bg-purple-500" icon={Droplets} />
          <StatCard
            label="Blood Pressure"
            value={todayLog?.blood_pressure_systolic ? `${todayLog.blood_pressure_systolic}/${todayLog.blood_pressure_diastolic}` : '--'}
            unit="mmHg"
            color="bg-red-400"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Health conditions */}
      {profile?.healthConditions && profile.healthConditions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <p className="text-sm font-semibold text-amber-800 mb-2">Health Conditions to Note</p>
          <div className="flex flex-wrap gap-2">
            {profile.healthConditions.map((c) => (
              <span key={c} className="bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1 rounded-full">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'Log a Meal', desc: 'Add your latest meal to track calories', path: '/health-data', color: 'bg-green-600', emoji: '🍽️' },
          { label: 'View Meal Plans', desc: 'Get a personalized Filipino meal plan', path: '/meal-plans', color: 'bg-blue-600', emoji: '📋' },
          { label: 'Health Monitoring', desc: 'Track weight, sugar & blood pressure', path: '/monitoring', color: 'bg-purple-600', emoji: '📈' },
          { label: 'Update Profile', desc: 'Keep your health profile up-to-date', path: '/profile', color: 'bg-orange-500', emoji: '👤' },
        ].map(({ label, desc, path, emoji }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="bg-white border border-gray-100 rounded-2xl p-4 text-left hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{emoji}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {/* Professional Notes Section */}
      {notes.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-green-600" />
            <p className="text-sm font-semibold text-gray-700">Notes from your dietician/nutritionist</p>
          </div>
          <div className="space-y-3">
            {notes.slice(0, 3).map((note) => {
              const categoryStyles: Record<string, { bg: string; color: string; icon: any; label: string }> = {
                recommendation: { bg: 'bg-blue-50 border-blue-200', color: 'text-blue-700', icon: Star, label: 'Recommendation' },
                warning: { bg: 'bg-red-50 border-red-200', color: 'text-red-700', icon: AlertTriangle, label: 'Warning' },
                progress: { bg: 'bg-green-50 border-green-200', color: 'text-green-700', icon: ProgressIcon, label: 'Progress' },
                general: { bg: 'bg-gray-50 border-gray-200', color: 'text-gray-700', icon: MessageSquare, label: 'General' },
              };
              const style = categoryStyles[note.category] || categoryStyles.general;
              const Icon = style.icon;
              
              return (
                <div key={note.id} className={`border rounded-xl p-4 ${style.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-3.5 h-3.5 ${style.color}`} />
                    <span className={`text-xs font-semibold uppercase ${style.color}`}>{style.label}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(note.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-2">— {note.dieticianName}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}