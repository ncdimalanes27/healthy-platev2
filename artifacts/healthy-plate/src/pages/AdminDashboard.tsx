import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Users, Shield, Settings, BarChart3, UserCog, Trash2, Edit, Plus, X, AlertTriangle, ExternalLink, Copy, Check, RefreshCw } from 'lucide-react';
import type { User, HealthProfile, DailyLog } from '../types/index';

const SUPABASE_PROJECT = 'dshtyziehvtghcrmypow';
const SUPABASE_SQL_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT}/sql/new`;

const FIX_SQL = `-- Run this once to fix all 8 broken features
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE SQL SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Professionals can view patient profiles" ON profiles;
CREATE POLICY "Professionals can view patient profiles" ON profiles
  FOR SELECT USING (
    public.get_my_role() IN ('dietician', 'nutritionist') AND role = 'patient'
  );

DROP POLICY IF EXISTS "Professionals can view patient health profiles" ON health_profiles;
CREATE POLICY "Professionals can view patient health profiles" ON health_profiles
  FOR SELECT USING (public.get_my_role() IN ('dietician', 'nutritionist'));

DROP POLICY IF EXISTS "Professionals can view patient daily logs" ON daily_logs;
CREATE POLICY "Professionals can view patient daily logs" ON daily_logs
  FOR SELECT USING (public.get_my_role() IN ('dietician', 'nutritionist'));

DROP POLICY IF EXISTS "Professionals can view patient meal plans" ON meal_plans;
CREATE POLICY "Professionals can view patient meal plans" ON meal_plans
  FOR SELECT USING (public.get_my_role() IN ('dietician', 'nutritionist'));

DROP POLICY IF EXISTS "Admins can view all notes" ON dietician_notes;
CREATE POLICY "Admins can view all notes" ON dietician_notes
  FOR SELECT USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can view all assignments" ON assigned_meal_plans;
CREATE POLICY "Admins can view all assignments" ON assigned_meal_plans
  FOR SELECT USING (public.get_my_role() = 'admin');

SELECT 'Done! All features fixed.' AS result;`;

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: (userId: string, data: Partial<User>) => void;
  onSavePassword: (userId: string, newPassword: string) => void;
}

function EditUserModal({ user, onClose, onSave, onSavePassword }: EditUserModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(user.id, { name, email, role });
    if (password.trim()) {
      await onSavePassword(user.id, password);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as User['role'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
              <option value="patient">Patient</option>
              <option value="dietician">Dietician</option>
              <option value="nutritionist">Nutritionist</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DbFixBanner({ onRetry }: { onRetry: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(FIX_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-amber-800">Database setup required</p>
          <p className="text-sm text-amber-700 mt-1">
            A one-time SQL fix is needed to enable user management. Copy the SQL below, paste it in
            your Supabase SQL Editor, and click Run.
          </p>
        </div>
      </div>

      <div className="bg-white border border-amber-200 rounded-lg overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-2 bg-amber-100 border-b border-amber-200">
          <span className="text-xs font-mono text-amber-700">supabase-fix.sql</span>
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors">
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy SQL</>}
          </button>
        </div>
        <pre className="text-xs text-gray-600 p-4 overflow-auto max-h-40 leading-relaxed">{FIX_SQL}</pre>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a href={SUPABASE_SQL_URL} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors">
          <ExternalLink className="w-4 h-4" />
          Open Supabase SQL Editor
        </a>
        <button onClick={onRetry}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-amber-400 text-amber-700 hover:bg-amber-100 text-sm font-semibold rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
          I ran it — Reload users
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { getAllPatients, getAllProfessionals, getAllAdmins, deleteUser, updateUser, updateUserPassword } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings'>('overview');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [patients, setPatients] = useState<{ user: User; profile: HealthProfile | null; lastLog: DailyLog | null }[]>([]);
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);

  const allUsers = React.useMemo(() => [
    ...patients.map(p => p.user),
    ...professionals,
    ...admins,
  ], [patients, professionals, admins]);

  const loadData = async () => {
    setLoading(true);
    setDbError(false);
    try {
      const [allPatients, allProfessionals, allAdmins] = await Promise.all([
        getAllPatients(),
        getAllProfessionals(),
        getAllAdmins(),
      ]);
      setPatients(allPatients);
      setProfessionals(allProfessionals);
      setAdmins(allAdmins);
      // If all three returned empty, likely a DB error
      if (allPatients.length === 0 && allProfessionals.length === 0 && allAdmins.length === 0) {
        setDbError(true);
      }
    } catch {
      setDbError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const success = await deleteUser(userId);
    if (success) loadData();
  };

  const stats = [
    { label: 'Total Users', value: allUsers.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Patients', value: patients.length, icon: UserCog, color: 'bg-green-500' },
    { label: 'Professionals', value: professionals.length, icon: Shield, color: 'bg-purple-500' },
    { label: 'Admins', value: admins.length, icon: Settings, color: 'bg-orange-500' },
  ];

  const roleColors: Record<string, string> = {
    patient: 'bg-green-100 text-green-700',
    dietician: 'bg-blue-100 text-blue-700',
    nutritionist: 'bg-purple-100 text-purple-700',
    admin: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Manage users and system settings</p>
      </div>

      {/* DB fix banner — shown when users can't be loaded */}
      {!loading && dbError && <DbFixBanner onRetry={loadData} />}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? <span className="text-gray-300">—</span> : stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex gap-1 p-1">
            {(['overview', 'users', 'settings'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === tab ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                {tab === 'overview' && <BarChart3 className="w-4 h-4" />}
                {tab === 'users' && <Users className="w-4 h-4" />}
                {tab === 'settings' && <Settings className="w-4 h-4" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">User Distribution</h4>
                  {allUsers.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No users loaded yet</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(roleColors).map(([role, color]) => {
                        const count = allUsers.filter(u => u.role === role).length;
                        const pct = allUsers.length ? ((count / allUsers.length) * 100).toFixed(0) : 0;
                        return (
                          <div key={role} className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-gray-500 w-12 text-right">{count} ({pct}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Recent Patients</h4>
                  {patients.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No patients yet</p>
                  ) : (
                    <div className="space-y-2">
                      {patients.slice(0, 5).map(({ user }) => (
                        <div key={user.id} className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-semibold text-green-700">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 leading-tight">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Users
                  {allUsers.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-400">({allUsers.length})</span>
                  )}
                </h3>
                <div className="flex gap-2">
                  <button onClick={loadData}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                    <Plus className="w-4 h-4" /> Add User
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading users...</p>
                </div>
              ) : allUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No users found</p>
                  <p className="text-xs mt-1">Run the database fix above, then click Refresh</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-green-700">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900 text-sm">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-400">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                onClick={() => setEditingUser(user)} title="Edit user">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                onClick={() => handleDeleteUser(user.id)} title="Delete user">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
              <div className="space-y-3">
                {[
                  { label: 'User Registration', desc: 'Allow new users to register', defaultChecked: true },
                  { label: 'Email Notifications', desc: 'Send email notifications to users', defaultChecked: true },
                  { label: 'Maintenance Mode', desc: 'Temporarily disable access for all users', defaultChecked: false },
                ].map(({ label, desc, defaultChecked }) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)}
          onSave={updateUser} onSavePassword={updateUserPassword} />
      )}
    </div>
  );
}
