import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { User, HealthProfile, DailyLog, AssignedMealPlan, DieticianNote } from '../types';
import { Users, FileText, TrendingUp, MessageSquare, ClipboardList } from 'lucide-react';

export default function NutritionistDashboard() {
  const { currentUser, getAllPatients, getAssignedPlansByProfessional, getNotesForPatient } = useStore();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patients, setPatients] = useState<{ user: User; profile: HealthProfile | null; lastLog: DailyLog | null }[]>([]);
  const [myAssignments, setMyAssignments] = useState<AssignedMealPlan[]>([]);
  const [recentNotes, setRecentNotes] = useState<Array<DieticianNote & { patientName: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const allPatients = await getAllPatients();
      setPatients(allPatients);
      
      if (currentUser) {
        const assignments = await getAssignedPlansByProfessional(currentUser.id);
        setMyAssignments(assignments);
      }
      
      // Get recent notes from patients
      const notes = allPatients.slice(0, 3).flatMap(async (p) => {
        const patientNotes = await getNotesForPatient(p.user.id);
        return patientNotes.slice(0, 1).map(n => ({ ...n, patientName: p.user.name }));
      });
      const resolvedNotes = await Promise.all(notes);
      setRecentNotes(resolvedNotes.flat());
      
      setLoading(false);
    };
    loadData();
  }, [currentUser, getAllPatients, getAssignedPlansByProfessional, getNotesForPatient]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading dashboard...</div>
    );
  }

  const stats = [
    { label: 'Total Patients', value: patients.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Plans', value: myAssignments.length, icon: ClipboardList, color: 'bg-green-500' },
    { label: 'Notes Written', value: recentNotes.length, icon: MessageSquare, color: 'bg-purple-500' },
    { label: 'This Month', value: patients.length, icon: TrendingUp, color: 'bg-orange-500' },
  ];

  const getStatusColor = (condition: string[]) => {
    if (!condition || condition.length === 0) return 'bg-green-100 text-green-700';
    if (condition.includes('Type 2 Diabetes') || condition.includes('Type 1 Diabetes')) return 'bg-red-100 text-red-700';
    if (condition.includes('Hypertension')) return 'bg-orange-100 text-orange-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nutritionist Dashboard</h1>
        <p className="text-gray-500">Manage patient nutrition programs</p>
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 mb-8 text-white">
        <h2 className="text-xl font-semibold">Welcome back, {currentUser?.name}!</h2>
        <p className="text-purple-100 mt-1">You have {patients.length} patients under your care</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              My Patients
            </h3>
          </div>
          <div className="p-6">
            {patients.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No patients assigned yet</p>
            ) : (
              <div className="space-y-4">
                {patients.map((patient) => (
                  <div
                    key={patient.user.id}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      selectedPatient === patient.user.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedPatient(patient.user.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-700">
                            {patient.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{patient.user.name}</h4>
                          <p className="text-sm text-gray-500">{patient.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {patient.profile ? (
                          <>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(patient.profile.healthConditions)}`}>
                              {patient.profile.healthConditions.length > 0 
                                ? patient.profile.healthConditions[0] 
                                : 'Healthy'}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Last log: {patient.lastLog?.date || 'No data'}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">No profile</span>
                        )}
                      </div>
                    </div>
                    {patient.profile && (
                      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Weight</span>
                          <p className="font-medium">{patient.profile.weight} kg</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Goal</span>
                          <p className="font-medium capitalize">{patient.profile.goal}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Activity</span>
                          <p className="font-medium capitalize">{patient.profile.activityLevel}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Recent Notes */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/nutritionist/assign"
                className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
              >
                <ClipboardList className="w-5 h-5" />
                <span className="font-medium">Assign Meal Plan</span>
              </a>
              <a
                href="/nutritionist/notes"
                className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">Write Notes</span>
              </a>
              <a
                href="/nutritionist/patients"
                className="flex items-center gap-3 p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">View Reports</span>
              </a>
            </div>
          </div>

          {/* Recent Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notes</h3>
            {recentNotes.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent notes</p>
            ) : (
              <div className="space-y-3">
                {recentNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{note.patientName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}