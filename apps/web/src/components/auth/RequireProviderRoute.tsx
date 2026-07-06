import { Navigate, Outlet, useLocation } from 'react-router-dom';

const getStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { token: null, role: null };
  }

  return {
    token: window.localStorage.getItem('access_token'),
    role: window.localStorage.getItem('user_role'),
  };
};

export function RequireProviderRoute() {
  const location = useLocation();
  const { token, role } = getStoredAuth();

  if (!token || role !== 'PROVIDER') {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default RequireProviderRoute;
