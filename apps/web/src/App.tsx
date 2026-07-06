import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './features/public/LandingPage';
import ErrorBoundary from './components/ui/ErrorBoundary';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import { RequireProviderRoute } from './components/auth/RequireProviderRoute';
import { ProviderLayout } from './features/provider/ProviderLayout';
import { ProviderDashboardPage } from './features/provider/ProviderDashboardPage';
import { ProviderKostPage } from './features/provider/ProviderKostPage';
import { ProviderBookingPage } from './features/provider/ProviderBookingPage';
import { KosDetailPage } from './features/public/KosDetailPage';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/kos/:id"
            element={<KosDetailPage />}
          />

          <Route path="/provider" element={<RequireProviderRoute />}>
            <Route element={<ProviderLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ProviderDashboardPage />} />
              <Route path="kos" element={<ProviderKostPage />} />
              <Route path="bookings" element={<ProviderBookingPage />} />
            </Route>
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
