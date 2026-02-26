import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from 'react-router-dom';

import { HackathonLanding } from './HackathonLanding';
import { HackathonAuth } from './HackathonAuth';
import { OrganizerAuth } from './OrganizerAuth';
import { ParticipantDashboard } from './ParticipantDashboard';
import { AdminDashboard } from './AdminDashboard';
import { OrganizerDashboard } from './OrganizerDashboard';
import { ExploreHackathons } from './ExploreHackathons';
import { EmailVerification } from './EmailVerification';
import { ProjectSubmission } from './ProjectSubmission';
import { ProtectedRoute } from './ProtectedRoute';
import { Toaster } from '../ui/sonner';
import { api } from '../../utils/api';

function SubmissionWrapper({ navigate }: { navigate: any }) {
  const { hackathonId } = useParams();

  return (
    <ProjectSubmission
      hackathonId={hackathonId}
      onComplete={() => {
        console.log('Submission completed, staying on submission page');
        // DO NOT NAVIGATE BACK - let user stay on submission page
      }}
    />
  );
}

function AppContent() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Step 5: Prevent browser back-button from showing cached auth/dashboard pages
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        // No token — force replace to landing page
        window.history.pushState(null, '', window.location.href);
        navigate('/', { replace: true });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Session check - NO NAVIGATION ALLOWED
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const storedUserData = localStorage.getItem('user_data');

        if (token && storedUserData) {
          const user = await api.getCurrentUser();
          const parsedUserData = JSON.parse(storedUserData);

          const updatedUserData = {
            ...parsedUserData,
            role: user.role?.toLowerCase() || parsedUserData.role,
            status: user.status,
            emailVerified: (user as any).emailVerified || parsedUserData.emailVerified,
          };

          setUserData(updatedUserData);
          localStorage.setItem('user_data', JSON.stringify(updatedUserData));
        } else {
          // Clear invalid session - NO NAVIGATION
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          api.clearToken();
        }
      } catch (error) {
        // Clear invalid session - NO NAVIGATION
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        api.clearToken();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /**
   * Re-init when navigating to /dashboard with stale (null) userData.
   * This happens after email OTP verification: the token is set in localStorage
   * but init() already ran (once on mount) before the token existed.
   */
  useEffect(() => {
    if (location.pathname === '/dashboard' && !userData && !loading) {
      const token = localStorage.getItem('auth_token');
      const storedUserData = localStorage.getItem('user_data');
      if (token && storedUserData) {
        try {
          const parsed = JSON.parse(storedUserData);
          api.setToken(token);
          setUserData(parsed);
        } catch {
          // malformed — clear and redirect
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          navigate('/', { replace: true });
        }
      }
    }
  }, [location.pathname, userData, loading]);

  const handleAuthSuccess = (user: any) => {
    setUserData(user);
    localStorage.setItem('user_data', JSON.stringify(user));

    if (user.emailVerified) {
      navigate('/dashboard', { replace: true });
    }
    // If not verified, auth component will handle navigation to /verify-email
  };

  const handleLogout = () => {
    console.log('🔴 Logout triggered — clearing all session data');

    // Clear ALL auth-related storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('role');
    localStorage.removeItem('pending_registration_hackathon');
    localStorage.removeItem('auth_return_url');

    // Clear API token
    api.clearToken();

    // Reset state
    setUserData(null);

    // Redirect to landing page — replace:true prevents back navigation to dashboard
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />

      <Routes>
        {/* Landing Page - Always accessible */}
        <Route
          path="/"
          element={
            <HackathonLanding onNavigate={(page) => navigate(`/${page}`)} />
          }
        />

        {/* Auth Page - Always render, no guards */}
        <Route
          path="/auth"
          element={
            <HackathonAuth
              onAuthSuccess={handleAuthSuccess}
              onBack={() => navigate('/')}
            />
          }
        />

        {/* Email Verification Page - Always render */}
        <Route
          path="/verify-email"
          element={<EmailVerification onAuthSuccess={handleAuthSuccess} />}
        />

        {/* Organizer Auth Page - Always render */}
        <Route
          path="/organizer-auth"
          element={
            <OrganizerAuth
              onAuthSuccess={handleAuthSuccess}
              onBack={() => navigate('/')}
            />
          }
        />

        {/* Dashboard - Protected: requires auth token */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {userData && userData.emailVerified ? (
                userData.role === 'admin' ? (
                  <AdminDashboard
                    userData={userData}
                    onLogout={handleLogout}
                    onBack={() => navigate('/')}
                  />
                ) : userData.role === 'host' || userData.role === 'organizer' ? (
                  <OrganizerDashboard
                    userData={userData}
                    onLogout={handleLogout}
                    onBack={() => navigate('/')}
                  />
                ) : (
                  <ParticipantDashboard
                    userData={userData}
                    onLogout={handleLogout}
                    onBack={() => navigate('/')}
                  />
                )
              ) : (
                <Navigate to="/" replace />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/explore"
          element={
            <ExploreHackathons
              onBack={() => navigate('/')}
              onNavigateToAuth={(returnUrl, hackathonId) => {
                if (returnUrl) {
                  localStorage.setItem('auth_return_url', returnUrl);
                }
                if (hackathonId) {
                  localStorage.setItem('pending_registration_hackathon', hackathonId);
                }
                navigate('/auth');
              }}
            />
          }
        />

        {/* Submission Route - Protected */}
        <Route
          path="/submit/:hackathonId"
          element={
            <ProtectedRoute>
              {userData && userData.emailVerified ? (
                <SubmissionWrapper navigate={navigate} />
              ) : (
                <Navigate to="/" replace />
              )}
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export function HackathonApp() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
