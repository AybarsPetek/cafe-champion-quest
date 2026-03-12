import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowPasswordChange?: boolean;
}

const ProtectedRoute = ({ children, allowPasswordChange = false }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async (userId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_approved, must_change_password')
        .eq('id', userId)
        .single();
      
      setIsApproved(profile?.is_approved ?? false);
      setMustChangePassword(profile?.must_change_password ?? false);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserStatus(session.user.id);
      } else {
        setIsApproved(null);
        setMustChangePassword(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isApproved) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (mustChangePassword && !allowPasswordChange) {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
