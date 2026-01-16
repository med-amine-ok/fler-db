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
    
    console.log('Profile check for user:', userEmail);
    
    // SECURITY: Strictly enforce email whitelist at the core level
    if (!userEmail || !ALLOWED_EMAILS.includes(userEmail)) {
      console.error('Security Alert: Unauthorized email attempted access:', user.email);
      return { success: false, error: 'unauthorized' }; 
    }

    console.log('Email authorized, checking profile...');

    // Quick check with short timeout
    try {
      const { data: profile, error } = await Promise.race([
        supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]) as any;

      // If profile doesn't exist, create it in the background (don't wait)
      if (!profile || (error && error.code === 'PGRST116')) {
        console.log('Creating new profile for user in background...', user.id);
        // Fire and forget - don't await this
        supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: userEmail,
            full_name: user.user_metadata?.full_name || userEmail.split('@')[0],
          } as any)
          .then(() => {
            console.log('Background profile created successfully');
          })
         
      }
    } catch (timeoutErr) {
      console.log('Profile check timed out - creating in background...');
      // Timeout or error - create profile in background
      supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: userEmail,
          full_name: user.user_metadata?.full_name || userEmail.split('@')[0],
        } as any)
        .then(() => {
          console.log('Background profile created successfully');
        })
        
    }
    
    console.log('Profile check completed - proceeding with login');
    return { success: true }; 
  } catch (err) {
      console.error('Profile check error:', err);
      // Allow login even if profile check fails - it will be created in background
      return { success: true };
  }
};

const ProtectedRoute = ({ children, session }: { children: React.ReactNode, session: Session | null }) => {
  return session ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Add overall timeout for session initialization
    const initTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Session initialization timeout - proceeding without full profile check');
        setLoading(false);
        setAuthInitialized(true);
      }
    }, 5000);

    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      
      console.log('Initial session check:', session ? 'Session found' : 'No session');
      
      if (session?.user) {
        const result = await createProfileIfNeeded(session.user);
        if (!result.success) {
          console.log('Profile check failed, signing out');
          await supabase.auth.signOut();
          if (isMounted) {
            setSession(null);
            setLoading(false);
            setAuthInitialized(true);
            window.location.href = `/?error=${result.error || 'unauthorized'}`;
          }
          return;
        }
      }
      if (isMounted) {
        setSession(session);
        setLoading(false);
        setAuthInitialized(true);
        clearTimeout(initTimeout);
      }
    }).catch((err) => {
      console.error('Session check error:', err);
      if (isMounted) {
        setLoading(false);
        setAuthInitialized(true);
        clearTimeout(initTimeout);
      }
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log('Auth state change event:', event);
      console.log('New session:', session ? 'Session exists' : 'No session');
      
      if (session?.user) {
        const result = await createProfileIfNeeded(session.user);
        if (!result.success) {
          console.log('Profile check failed on auth change, signing out');
          await supabase.auth.signOut();
          if (isMounted) {
            setSession(null);
            setLoading(false);
            setAuthInitialized(true);
            window.location.href = `/?error=${result.error || 'unauthorized'}`;
          }
          return;
        }
      }
      if (isMounted) {
        setSession(session);
        setLoading(false);
        setAuthInitialized(true);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Only render routes after auth initialization is complete
  if (!authInitialized) {
    return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={session ? <Navigate to="/home" replace /> : <Auth />} />
        
        {/* Protected Dashboard Routes */}
        <Route element={
          <ProtectedRoute session={session}>
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
