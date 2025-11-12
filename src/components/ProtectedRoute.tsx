import { Navigate } from 'react-router-dom';
import { getUserCookie } from '@/utils/cookie';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

/**
 * ProtectedRoute component for role-based access control
 * - Checks if user is authenticated
 * - Verifies user role matches required role
 * - Redirects to unauthorized page if access denied
 */
export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const userData = getUserCookie();

  // No user data - redirect to login
  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  // Extract role from user data (handle different data structures)
  const rawRole = (userData?.role || userData?.data?.role || userData?.user?.role) as string | undefined;
  const userRole = rawRole ? String(rawRole).toLowerCase() as 'admin' | 'user' : undefined;

  // If role is required, check if user has the correct role
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authorized
  return <>{children}</>;
};

export default ProtectedRoute;
