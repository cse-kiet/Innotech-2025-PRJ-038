import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if user completed onboarding
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        if (profile && !profile.onboarding_completed) {
          setNeedsOnboarding(true);
        }
      }
      
      setSession(session);
      setLoading(false);
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5EFE6]">
        <div className="text-xl text-[#352414]">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  // Redirect to onboarding if not completed (except if already on onboarding page)
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  return children;
};

export default ProtectedRoute;
