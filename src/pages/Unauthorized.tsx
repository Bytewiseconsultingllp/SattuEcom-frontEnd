import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, LogOut, Lock } from 'lucide-react';
import { removeUserCookie, getUserCookie } from '@/utils/cookie';

/**
 * Unauthorized page - displayed when user tries to access restricted content
 * Shows a professional GIF with action buttons
 */
export const Unauthorized = () => {
  const navigate = useNavigate();
  const userData = getUserCookie();
  const userRole = userData?.role || userData?.user?.role;
  console.log(userData, userRole);

  const handleLogout = () => {
    removeUserCookie();
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToDashboard = () => {
    if (userRole === 'admin') {
      navigate('/admin/dashboard');
    } else if (userRole === 'user') {
      navigate('/user/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Lock Icon Animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-red-500 to-red-600 p-8 rounded-full">
              <Lock className="h-16 w-16 text-white animate-bounce" />
            </div>
          </div>
        </div>

        {/* Unauthorized GIF */}
        <div className="space-y-4">
          <img
            src="https://media.giphy.com/media/l0HlDy9x8FZo0XO1i/giphy.gif"
            alt="Access Denied"
            className="w-full rounded-lg shadow-2xl"
          />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-white">Access Denied</h1>
          <p className="text-lg text-slate-300">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-slate-400">
            Your current role: <span className="font-semibold text-blue-400 capitalize">{userRole || 'guest'}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={handleGoToDashboard}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Go to My Dashboard
          </Button>

          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white font-semibold py-6 rounded-lg transition-all duration-200"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 rounded-lg transition-all duration-200"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>

        {/* Additional Info */}
        <div className="pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-500">
            If you believe this is a mistake, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
