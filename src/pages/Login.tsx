import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabaseClient';
import { Leaf, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed');
      return;
    }

    const user = useStore.getState().currentUser;
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'nutritionist') {
      navigate('/nutritionist');
    } else if (user?.role === 'dietician') {
      navigate('/dietician');
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/register` },
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4 shadow-lg">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            HealthyPlate
          </h1>
          <p className="text-gray-500 mt-1">Your Filipino Nutrition Companion</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Sign In
            </button>
          </form>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="mt-4 w-full border border-gray-200 bg-white text-gray-700 hover:bg-slate-50 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-3"
          >
            <img src="https://www.svgrepo.com/show/452224/google.svg" alt="Google logo" className="w-5 h-5" />
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            No account?{' '}
            <a href="/register" className="text-green-600 hover:underline font-medium">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
