import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend,
} from 'recharts';
import { Save } from 'lucide-react';

export default function HealthMonitoring() {
  const { currentUser, getLogs, updateHealthMetrics } = useStore();
  const logs = getLogs(currentUser?.id || '');

  const [form, setForm] = useState({ weight: '', bloodSugar: '', systolic: '', diastolic: '' });
  const [saved, setSaved] = useState(false);

  const chartData = logs.slice(-14).map((log) => ({
    date: new Date(log.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
    calories: log.totalCalories,
    weight: log.weight,
    bloodSugar: log.bloodSugar,
    systolic: log.bloodPressureSystolic,
    diastolic: log.bloodPressureDiastolic,
  }));

  const handleSave = () => {
    updateHealthMetrics(currentUser!.id, {
      weight: form.weight ? parseFloat(form.weight) : undefined,
      bloodSugar: form.bloodSugar ? parseFloat(form.bloodSugar) : undefined,
      bloodPressureSystolic: form.systolic ? parseFloat(form.systolic) : undefined,
      bloodPressureDiastolic: form.diastolic ? parseFloat(form.diastolic) : undefined,
    });
    setSaved(true);
    setForm({ weight: '', bloodSugar: '', systolic: '', diastolic: '' });
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Health Monitoring</h1>
        <p className="text-gray-400 text-sm mt-1">Track your weight, blood sugar, and blood pressure over time.</p>
      </div>

      {/* Log metrics */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Log Today's Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Weight (kg)</label>
            <input type="number" placeholder="68.5" value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Blood Sugar (mg/dL)</label>
            <input type="number" placeholder="100" value={form.bloodSugar}
              onChange={(e) => setForm({ ...form, bloodSugar: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Systolic (mmHg)</label>
            <input type="number" placeholder="120" value={form.systolic}
              onChange={(e) => setForm({ ...form, systolic: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Diastolic (mmHg)</label>
            <input type="number" placeholder="80" value={form.diastolic}
              onChange={(e) => setForm({ ...form, diastolic: e.target.value })} className={inputClass} />
          </div>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            saved ? 'bg-green-100 text-green-700' : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Metrics'}
        </button>
      </div>

      {chartData.length > 0 ? (
        <div className="space-y-6">
          {/* Calorie intake */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">📊 Daily Calorie Intake</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="calories" stroke="#22c55e" fill="url(#calGrad)" strokeWidth={2} name="Calories" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weight */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">⚖️ Weight (kg)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Blood Sugar */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">🩸 Blood Sugar (mg/dL)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="bsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="bloodSugar" stroke="#f97316" fill="url(#bsGrad)" strokeWidth={2} name="Blood Sugar" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Blood Pressure */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">💓 Blood Pressure (mmHg)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="systolic" fill="#ef4444" radius={[4, 4, 0, 0]} name="Systolic" />
                <Bar dataKey="diastolic" fill="#fca5a5" radius={[4, 4, 0, 0]} name="Diastolic" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center">
          <p className="text-4xl mb-3">📈</p>
          <p className="text-gray-500 font-medium">No data yet.</p>
          <p className="text-gray-400 text-sm mt-1">Log your health metrics above to see charts here.</p>
        </div>
      )}
    </div>
  );
}
