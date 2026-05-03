import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { calculateBMI, getBMICategory, calculateTargetCalories } from '../utils/calculations';
import type { User, HealthProfile, DailyLog } from '../types';
import { 
  Users, TrendingUp, AlertCircle, ChevronDown, ChevronUp, 
  Target, FileText, MessageSquare, ClipboardList,
  AlertTriangle
} from 'lucide-react';

// Compliance scoring based on meal logging
function calculateComplianceScore(patient: any): { score: number; level: string; color: string } {
  if (!patient.lastLog) return { score: 0, level: 'No Data', color: 'gray' };
  
  const calories = patient.lastLog?.total_calories || 0;
  const target = patient.profile ? calculateTargetCalories(patient.profile) : 2000;
  const ratio = calories / target;
  
  if (ratio >= 0.8 && ratio <= 1.2) return { score: 90, level: 'Excellent', color: 'green' };
  if (ratio >= 0.6 && ratio <= 1.4) return { score: 70, level: 'Good', color: 'blue' };
  if (ratio >= 0.4) return { score: 50, level: 'Fair', color: 'yellow' };
  return { score: 30, level: 'Poor', color: 'red' };
}

// Intervention recommendations based on conditions
function getInterventions(patient: any): string[] {
  const interventions: string[] = [];
  const conditions = patient.profile?.healthConditions || [];
  const bmi = patient.profile ? calculateBMI(patient.profile.weight, patient.profile.height) : null;
  
  if (conditions.includes('Type 2 Diabetes') || conditions.includes('Type 1 Diabetes')) {
    interventions.push('Review glucose monitoring frequency');
    interventions.push('Adjust carbohydrate distribution');
  }
  if (conditions.includes('Hypertension')) {
    interventions.push('Check sodium intake this week');
    interventions.push('Recommend DASH diet adherence');
  }
  if (bmi && bmi > 30) {
    interventions.push('Set realistic weight loss targets (0.5kg/week)');
    interventions.push('Increase physical activity recommendation');
  }
  if (!patient.lastLog?.total_calories) {
    interventions.push('Patient has not logged meals recently');
  }
  
  return interventions;
}

function PatientRow({ patient }: { patient: any }) {
  const [open, setOpen] = useState(false);
  const { user, profile, lastLog } = patient;

  const bmi = profile ? calculateBMI(profile.weight, profile.height) : null;
  const bmiInfo = bmi ? getBMICategory(bmi) : null;
  const target = profile ? calculateTargetCalories(profile) : null;
  const compliance = calculateComplianceScore(patient);
  const interventions = getInterventions(patient);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
          {user.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800">{user.name}</p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
        {bmiInfo && (
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: bmiInfo.color + '20', color: bmiInfo.color }}
          >
            BMI {bmi} · {bmiInfo.label}
          </span>
        )}
        {/* Compliance Score */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          compliance.color === 'green' ? 'bg-green-100 text-green-700' :
          compliance.color === 'blue' ? 'bg-blue-100 text-blue-700' :
          compliance.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {compliance.level}
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-700">{lastLog?.total_calories ?? '--'} kcal</p>
          <p className="text-xs text-gray-400">Last logged</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && profile && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4">
          {/* Quick Actions */}
          <div className="flex gap-2 mb-4">
            <a href={`/dietician/notes?patient=${user.id}`} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100">
              <MessageSquare className="w-3 h-3" /> Add Note
            </a>
            <a href={`/dietician/assign?patient=${user.id}`} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100">
              <ClipboardList className="w-3 h-3" /> Assign Plan
            </a>
            <a href={`/dietician/progress?patient=${user.id}`} className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100">
              <FileText className="w-3 h-3" /> View Report
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Age', val: profile.age + ' yrs' },
              { label: 'Height', val: profile.height + ' cm' },
              { label: 'Weight', val: profile.weight + ' kg' },
              { label: 'Goal', val: profile.goal === 'lose' ? '🔻 Lose' : profile.goal === 'gain' ? '📈 Gain' : '⚖️ Maintain' },
              { label: 'Activity', val: profile.activityLevel },
              { label: 'Target Calories', val: target + ' kcal' },
              { label: 'Gender', val: profile.gender },
              { label: 'Conditions', val: profile.healthConditions.join(', ') || 'None' },
            ].map(({ label, val }) => (
              <div key={label} className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{val}</p>
              </div>
            ))}
          </div>

          {/* Compliance Details */}
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Compliance Score</span>
              <span className="text-lg font-bold text-gray-800">{compliance.score}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  compliance.color === 'green' ? 'bg-green-500' :
                  compliance.color === 'blue' ? 'bg-blue-500' :
                  compliance.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${compliance.score}%` }}
              />
            </div>
          </div>

          {lastLog && lastLog.meals.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Meal Log</p>
              <div className="space-y-1.5">
                {lastLog.meals.slice(0, 5).map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{m.foodName}</span>
                    <span className="text-green-600 font-medium">{m.calories} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Conditions with Alerts */}
          {profile.healthConditions.length > 0 && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <p className="text-xs font-semibold text-amber-700">Health Alerts</p>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {profile.healthConditions.map((c: string) => (
                  <span key={c} className="bg-amber-100 text-amber-700 text-xs px-2.5 py-0.5 rounded-full">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Intervention Recommendations */}
          {interventions.length > 0 && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <p className="text-xs font-semibold text-red-700">Recommended Interventions</p>
              </div>
              <ul className="space-y-1">
                {interventions.map((intervention, i) => (
                  <li key={i} className="text-xs text-red-600 flex items-center gap-2">
                    <Target className="w-3 h-3" /> {intervention}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DieticianDashboard() {
  const { currentUser, getAllPatients } = useStore();
  const [patients, setPatients] = useState<{ user: User; profile: HealthProfile | null; lastLog: DailyLog | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCondition, setFilterCondition] = useState<HealthCondition | ''>('');

  useEffect(() => {
    const loadPatients = async () => {
      const allPatients = await getAllPatients();
      setPatients(allPatients);
      setLoading(false);
    };
    loadPatients();
  }, [getAllPatients]);

  const filtered = patients.filter(
    (p) =>
      (p.user.name.toLowerCase().includes(search.toLowerCase()) ||
      p.user.email.toLowerCase().includes(search.toLowerCase())) &&
      (!filterCondition || (p.profile?.healthConditions && p.profile.healthConditions.includes(filterCondition)))
  );

  const withConditions = patients.filter((p) => p.profile?.healthConditions.length);
  const needsAttention = patients.filter(p => {
    const compliance = calculateComplianceScore(p);
    return compliance.score < 50;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-green-600 font-semibold text-sm">Welcome back 👋</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
          {currentUser?.name}
        </h1>
        <p className="text-gray-400 text-sm mt-1">Dietician Dashboard · Patient Overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Patients', val: patients.length, icon: Users, color: 'bg-blue-500' },
          { label: 'With Conditions', val: withConditions.length, icon: AlertCircle, color: 'bg-amber-500' },
          { label: 'Needs Attention', val: needsAttention.length, icon: Target, color: 'bg-red-500' },
          { label: 'Active Today', val: patients.filter((p) => p.lastLog?.total_calories).length, icon: TrendingUp, color: 'bg-green-500' },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{label}</span>
              <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{val}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search patients by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
        </div>
        <select
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value as HealthCondition)}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="">All Conditions</option>
          <option value="Type 2 Diabetes">Diabetes</option>
          <option value="Hypertension">Hypertension</option>
          <option value="Obesity">Obesity</option>
          <option value="High Cholesterol">High Cholesterol</option>
        </select>
      </div>

      {/* Patient list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>No patients found.</p>
          </div>
        ) : (
          filtered.map((patient) => (
            <PatientRow key={patient.user.id} patient={patient} />
          ))
        )}
      </div>
    </div>
  );
}
