import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';
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
import { ALLOWED_EMAILS } from './lib/constants';

const createProfileIfNeeded = async (user: any): Promise<{ success: boolean; error?: string }> => {
  try {
    const userEmail = user.email?.toLowerCase().trim();
    
    // SECURITY: Strictly enforce email whitelist at the core level
    if (!userEmail || !ALLOWED_EMAILS.includes(userEmail)) {
      console.error('Security Alert: Unauthorized email attempted access:', user.email);
      return { success: false, error: 'unauthorized' }; 
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
       console.error('Error fetching profile:', error);
       // If it's a real DB error, we might want to try again or stay logged in but show error
       // For now, let's treat it as a failure to ensure security
       return { success: false, error: 'db_error' };
    }

    if (!profile) {
      console.log('Creating new profile for user...', user.id);
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        email: userEmail,
        full_name: user.user_metadata?.full_name || userEmail.split('@')[0],
      } as any);
      
      if (insertError) {
          console.error('Error creating profile:', insertError);
          return { success: false, error: 'db_error' };
      }
    }
    return { success: true }; 
  } catch (err) {
      console.error('Unexpected error creating profile:', err);
      return { success: false, error: 'unexpected' };
  }
};

const ProtectedRoute = ({ children, session, loading }: { children: React.ReactNode, session: Session | null, loading: boolean }) => {
  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }
  return session ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const result = await createProfileIfNeeded(session.user);
        if (!result.success) {
          await supabase.auth.signOut();
          window.location.href = `/?error=${result.error || 'unauthorized'}`;
          return;
        }
      }
      setSession(session);
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const result = await createProfileIfNeeded(session.user);
        if (!result.success) {
          await supabase.auth.signOut();
          window.location.href = `/?error=${result.error || 'unauthorized'}`;
          return;
        }
      }
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={session ? <Navigate to="/home" /> : <Auth />} />
        
        {/* Protected Dashboard Routes */}
        <Route element={
          <ProtectedRoute session={session} loading={loading}>
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
