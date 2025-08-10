import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    console.log('Auth hook initializing...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Never await inside this callback to avoid deadlocks
        console.log('Setting auth loading to false (auth callback)');
        setLoading(false);
        
        // Defer admin role check when session changes
        if (session?.user) {
          const uid = session.user.id;
          console.log('Queueing admin role check for:', uid);
          setTimeout(() => {
            if (!mounted) return;
            checkAdminRole(uid);
          }, 0);
        } else {
          console.log('No user session, setting admin to false');
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    const initSession = async () => {
      try {
        console.log('Checking existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        if (!mounted) return;
        
        console.log('Existing session:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Do not block on admin check; mark as not loading immediately
        console.log('Setting initial auth loading to false');
        setLoading(false);
        
        if (session?.user) {
          const uid = session.user.id;
          console.log('Queueing admin role check for existing session:', uid);
          setTimeout(() => {
            if (!mounted) return;
            checkAdminRole(uid);
          }, 0);
        } else {
          console.log('No existing session');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error in initSession:', error);
        setLoading(false);
      }
    };

    initSession();

    return () => {
      console.log('Auth hook cleanup');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      console.log('Checking admin role for user:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      console.log('Admin role check result:', { data, error, userId });
      
      if (!error && data) {
        console.log('User is admin');
        setIsAdmin(true);
      } else {
        console.log('User is not admin or no role found:', error?.message);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}