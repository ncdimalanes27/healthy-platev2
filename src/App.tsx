import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import HealthData from './pages/HealthData';
import MealPlans from './pages/MealPlans';
import HealthMonitoring from './pages/HealthMonitoring';
import DieticianDashboard from './pages/DieticianDashboard';
import DieticianNotes from './pages/DieticianNotes';
import AssignMealPlan from './pages/AssignMealPlan';
import ProgressReport from './pages/ProgressReport';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import NutritionistDashboard from './pages/NutritionistDashboard';

// ProtectedRoute with role-based access control
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { currentUser, auth } = useStore();
  
  // Check if user is logged in
  if (!currentUser || !auth.token) {
    return <Navigate to="/" replace />;
  }
  
  // Check if token is expired
  if (auth.expiresAt && Date.now() > auth.expiresAt) {
    useStore.getState().logout();
    return <Navigate to="/" replace />;
  }
  
  // If roles are specified, check if user has permission
  if (allowedRoles && allowedRoles.length > 0) {
    const roleHierarchy: Record<string, number> = {
      admin: 4,
      nutritionist: 3,
      dietician: 2,
      patient: 1,
    };
    const userLevel = roleHierarchy[currentUser.role] || 0;
    const hasAccess = allowedRoles.some(role => (roleHierarchy[role] || 0) <= userLevel);
    
    if (!hasAccess) {
      // Redirect to appropriate dashboard based on role
      if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
      if (currentUser.role === 'nutritionist') return <Navigate to="/nutritionist" replace />;
      if (currentUser.role === 'dietician') return <Navigate to="/dietician" replace />;
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
}

// Get default dashboard path based on role
function getDefaultDashboard(role: string): string {
  switch (role) {
    case 'admin': return '/admin';
    case 'nutritionist': return '/nutritionist';
    case 'dietician': return '/dietician';
    default: return '/dashboard';
  }
}

export default function App() {
  const { currentUser } = useStore();
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes with Layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Patient routes */}
          <Route path="dashboard" element={<ProtectedRoute allowedRoles={['patient']}><Dashboard /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute allowedRoles={['patient']}><Profile /></ProtectedRoute>} />
          <Route path="health-data" element={<ProtectedRoute allowedRoles={['patient']}><HealthData /></ProtectedRoute>} />
          <Route path="meal-plans" element={<ProtectedRoute allowedRoles={['patient']}><MealPlans /></ProtectedRoute>} />
          <Route path="monitoring" element={<ProtectedRoute allowedRoles={['patient']}><HealthMonitoring /></ProtectedRoute>} />
          
          {/* Dietician routes */}
          <Route path="dietician" element={<ProtectedRoute allowedRoles={['dietician']}><DieticianDashboard /></ProtectedRoute>} />
          <Route path="dietician/notes" element={<ProtectedRoute allowedRoles={['dietician']}><DieticianNotes /></ProtectedRoute>} />
          <Route path="dietician/assign" element={<ProtectedRoute allowedRoles={['dietician']}><AssignMealPlan /></ProtectedRoute>} />
          <Route path="dietician/progress" element={<ProtectedRoute allowedRoles={['dietician']}><ProgressReport /></ProtectedRoute>} />
          
          {/* Nutritionist routes */}
          <Route path="nutritionist" element={<ProtectedRoute allowedRoles={['nutritionist']}><NutritionistDashboard /></ProtectedRoute>} />
          <Route path="nutritionist/patients" element={<ProtectedRoute allowedRoles={['nutritionist']}><DieticianDashboard /></ProtectedRoute>} />
          <Route path="nutritionist/notes" element={<ProtectedRoute allowedRoles={['nutritionist']}><DieticianNotes /></ProtectedRoute>} />
          <Route path="nutritionist/assign" element={<ProtectedRoute allowedRoles={['nutritionist']}><AssignMealPlan /></ProtectedRoute>} />
          
          {/* Admin routes */}
          <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
          
          {/* Shared routes (accessible by all authenticated users) */}
          <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Route>
        
        {/* Redirect unknown routes to appropriate dashboard */}
        <Route path="*" element={<Navigate to={currentUser ? getDefaultDashboard(currentUser.role) : '/'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
