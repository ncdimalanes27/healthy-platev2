import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2 } from 'lucide-react';

export default function Settings() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleClearData = () => {
    if (confirm('Clear all local data? This cannot be undone.')) {
      localStorage.removeItem('healthyplate-store');
      window.location.reload();
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account and app preferences.</p>
      </div>

      <div className="space-y-4">
        {/* Account info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3">Account</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
              {currentUser?.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{currentUser?.name}</p>
              <p className="text-sm text-gray-400">{currentUser?.email}</p>
              <p className="text-xs text-green-600 capitalize font-medium">{currentUser?.role}</p>
            </div>
          </div>
        </div>

        {/* App info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3">About HealthyPlate</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span>Version</span><span className="font-medium">1.0.0</span></div>
            <div className="flex justify-between"><span>Food Database</span><span className="font-medium">50+ Filipino dishes</span></div>
            <div className="flex justify-between"><span>Storage</span><span className="font-medium">Local (browser)</span></div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-800 mb-1">Actions</h2>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <button
            onClick={handleClearData}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
