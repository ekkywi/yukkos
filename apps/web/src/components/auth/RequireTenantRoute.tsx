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

export function RequireTenantRoute() {
  const location = useLocation();
  const { token, role } = getStoredAuth();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role !== 'TENANT') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RequireTenantRoute;
