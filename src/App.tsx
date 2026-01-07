import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Home } from './pages/Home';
import { Events } from './pages/Events';
import { EventDossier } from './pages/EventDossier';
import { Teams } from './pages/Teams';
import { TeamReport } from './pages/TeamReport';
import { Database } from './pages/Database';
import { Profile } from './pages/Profile';
import { LogisticsDashboard } from './pages/logistics/LogisticsDashboard';
import { LogisticsForm } from './pages/logistics/LogisticsForm';
import { SponsoringEvents } from './pages/sponsoring/SponsoringEvents';
import { SponsoringDashboard } from './pages/sponsoring/SponsoringDashboard';
import { SponsoringForm } from './pages/sponsoring/SponsoringForm';
import { DatabaseForm } from './pages/DatabaseForm';

// Mock Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  // For development ease, we can start with true or check mock.
  // The 'Landing' flow sets it.
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        {/* Protected Dashboard Routes */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/home" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id/dossier" element={<EventDossier />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id/report" element={<TeamReport />} />
          
          {/* Logistics Routes */}
          <Route path="/teams/logistics" element={<LogisticsDashboard />} />
          <Route path="/teams/logistics/add" element={<LogisticsForm />} />

          {/* Sponsoring Routes */}
          <Route path="/teams/sponsoring" element={<SponsoringEvents />} />
          <Route path="/teams/sponsoring/:eventId" element={<SponsoringDashboard />} />
          <Route path="/teams/sponsoring/:eventId/add" element={<SponsoringForm />} />

          <Route path="/database" element={<Database />} />
          <Route path="/database/add" element={<DatabaseForm />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
