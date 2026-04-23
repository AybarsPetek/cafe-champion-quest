import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isApproved: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  isAdmin: false,
  isApproved: false,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      // Invalidate cached auth queries on user change
      queryClient.invalidateQueries({ queryKey: ["auth-meta"] });
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Cached single query for admin role + approval status
  const { data: meta } = useQuery({
    queryKey: ["auth-meta", user?.id],
    queryFn: async () => {
      if (!user?.id) return { isAdmin: false, isApproved: false };
      const [{ data: roleData }, { data: profileData }] = await Promise.all([
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("is_approved")
          .eq("id", user.id)
          .maybeSingle(),
      ]);
      return {
        isAdmin: !!roleData,
        isApproved: !!profileData?.is_approved,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin: meta?.isAdmin ?? false,
        isApproved: meta?.isApproved ?? false,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
