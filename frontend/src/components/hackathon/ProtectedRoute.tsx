import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Wraps dashboard/protected routes.
 * If no auth token exists redirect to landing page with replace (no back).
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const token = localStorage.getItem('auth_token');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
