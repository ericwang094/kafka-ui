import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSessionLostError, handleSessionLoss } from 'lib/apiErrorHandler';

/**
 * Hook to handle session loss events globally
 * Listens for session loss errors and redirects to login
 */
export function useSessionLossHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for custom session-lost event
    const handleSessionLost = () => {
      const currentPath = window.location.pathname;
      const loginPath = '/login';
      
      if (!currentPath.includes(loginPath)) {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        navigate(loginPath);
      }
    };

    window.addEventListener('session-lost', handleSessionLost);

    return () => {
      window.removeEventListener('session-lost', handleSessionLost);
    };
  }, [navigate]);
}


