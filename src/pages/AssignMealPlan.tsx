import { useState } from 'react';
import { useStore } from '../store/useStore';
import { calculateTargetCalories } from '../utils/calculations';
import { ClipboardList, CheckCircle } from 'lucide-react';

export default function AssignMealPlan() {
  const { currentUser, getAllPatients, getProfile, assignMealPlan, getAssignedPlansForPatient } = useStore();
  const patients = getAllPatients();

  const [selectedPatient, setSelectedPatient] = useState(patients[0]?.user.id || '');
  const [planName, setPlanName] = useState('');
  const [targetCalories, setTargetCalories] = useState('');
  const [note, setNote] = useState('');
  const [assigned, setAssigned] = useState(false);

  const patient = patients.find((p) => p.user.id === selectedPatient);
  const profile = getProfile(selectedPatient);
  const defaultTargetCals = profile ? calculateTargetCalories(profile) : 1800;
  const assignedPlans = getAssignedPlansForPatient(selectedPatient);

  const handleAssign = () => {
    if (!currentUser || !patient || !planName.trim()) return;
    
    const calories = targetCalories ? parseInt(targetCalories) : defaultTargetCals;
    
    assignMealPlan({
      mealPlanId: `manual-${Date.now()}`,
      mealPlanName: planName.trim(),
      patientId: selectedPatient,
      dieticianId: currentUser.id,
      dieticianName: currentUser.name,
      targetCalories: calories,
      note: note.trim(),
    });
    
    setPlanName('');
    setTargetCalories('');
    setNote('');
    setAssigned(true);
    setTimeout(() => setAssigned(false), 2500);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Assign Meal Plan
        </h1>
        <p className="text-gray-400 text-sm mt-1">Mag-assign ng manual meal plan sa iyong patient.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient selector */}
        <div className="md:col-span-1 space-y-2">
          <p className="text-sm font-semibold text-gray-600 mb-3">Piliin ang Patient</p>
          {patients.map(({ user, profile: prof }) => (
            <button key={user.id} onClick={() => setSelectedPatient(user.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                selectedPatient === user.id ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white hover:border-green-200'
              }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-400">{prof ? calculateTargetCalories(prof) : '—'} kcal target</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Main panel */}
        <div className="md:col-span-2 space-y-4">
          {/* Patient info */}
          {profile && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">{patient?.user.name}'s Profile</p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[
                  { label: 'Goal', val: profile.goal === 'lose' ? '🔻 Lose' : profile.goal === 'gain' ? '📈 Gain' : '⚖️ Maintain' },
                  { label: 'Target', val: `${defaultTargetCals} kcal` },
                  { label: 'Activity', val: profile.activityLevel },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-white rounded-xl px-3 py-2">
                    <p className="text-xs text-blue-400">{label}</p>
                    <p className="text-sm font-semibold text-blue-800">{val}</p>
                  </div>
                ))}
              </div>
              {profile.healthConditions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {profile.healthConditions.map((c) => (
                    <span key={c} className="bg-amber-100 text-amber-700 text-xs px-2.5 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Manual assignment form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-gray-800">Mag-assign ng Meal Plan</p>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Pangalan ng Meal Plan *</label>
                <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g., 7-Day Weight Loss Plan, Diabetic Meal Plan"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Target Calories per day</label>
                <input type="number" value={targetCalories} onChange={(e) => setTargetCalories(e.target.value)}
                  placeholder={`Default: ${defaultTargetCals} kcal`}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Note para sa patient (optional)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Sundin ito ng 2 linggo, iwasan ang maalat na pagkain..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <button onClick={handleAssign} disabled={!planName.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 font-semibold rounded-xl text-sm transition-all ${
                assigned 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-40 disabled:cursor-not-allowed'
              }`}>
              {assigned ? <CheckCircle className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
              {assigned ? 'Assigned na!' : 'I-assign sa Patient'}
            </button>
          </div>

          {/* Previously assigned */}
          {assignedPlans.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-3">Previously Assigned ({assignedPlans.length})</p>
              <div className="space-y-2">
                {assignedPlans.map((plan) => (
                  <div key={plan.id} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{plan.mealPlanName}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(plan.assignedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })} · {plan.dieticianName}
                      </p>
                      {plan.note && <p className="text-xs text-gray-500 mt-1 italic">{plan.note}</p>}
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      {plan.targetCalories} kcal/day
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
