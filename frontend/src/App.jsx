import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Participants from './pages/Participants';
import AddParticipant from './pages/AddParticipant';
import EditParticipant from './pages/EditParticipant';
import Certificates from './pages/Certificates';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50/50">
        <div className="w-8 h-8 border-3 border-primary-300 border-t-primary-800 rounded-full animate-spin" />
      </div>
    );
  }
  if (!admin) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return null;
  if (admin) return <Navigate to="/admin" replace />;
  return children;
}

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#262626',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="participants" element={<Participants />} />
          <Route path="participants/add" element={<AddParticipant />} />
          <Route path="participants/edit/:id" element={<EditParticipant />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
