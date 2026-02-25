import { useEffect, useState, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const getSessionWithTimeout = async () => {
      return Promise.race([
        supabase.auth.getSession(),
        new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), 1500)
        ),
      ]);
    };

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;
        setSession(session);
        setLoading(false);
      }
    );

    const bootstrapSession = async () => {
      try {
        for (let attempt = 0; attempt < 5; attempt++) {
          const { data } = await getSessionWithTimeout();
          if (!isMounted) return;

          if (data.session) {
            setSession(data.session);
            setLoading(false);
            return;
          }

          if (attempt < 4) await wait(200);
        }

        if (!isMounted) return;
        setSession(null);
      } catch (error) {
        console.error("Failed to read auth session:", error);
        if (!isMounted) return;
        setSession(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void bootstrapSession();

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;