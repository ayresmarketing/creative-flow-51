import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type UserRole = "GESTOR" | "CLIENTE";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AppUser | null>;
  logout: () => Promise<void>;
  addClient: (name: string, email: string) => Promise<{ user: AppUser; generatedPassword: string }>;
  addGestor: (name: string, email: string) => Promise<{ user: AppUser; generatedPassword: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

async function fetchAppUser(authUser: User): Promise<AppUser | null> {
  // Fetch role
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", authUser.id)
    .single();

  if (!roleData) return null;

  const role = roleData.role === "gestor" ? "GESTOR" : "CLIENTE";

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("user_id", authUser.id)
    .single();

  // If cliente, fetch client record
  let clientId: string | undefined;
  if (role === "CLIENTE") {
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", authUser.id)
      .single();
    clientId = client?.id;
  }

  return {
    id: authUser.id,
    name: profile?.name || authUser.email || "",
    email: profile?.email || authUser.email || "",
    role,
    clientId,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid potential deadlock with Supabase client
        setTimeout(async () => {
          const appUser = await fetchAppUser(session.user);
          setUser(appUser);
          setLoading(false);
        }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const appUser = await fetchAppUser(session.user);
        setUser(appUser);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AppUser | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return null;
    const appUser = await fetchAppUser(data.user);
    setUser(appUser);
    return appUser;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const addClient = useCallback(async (name: string, email: string) => {
    const generatedPassword = generatePassword();
    
    const response = await supabase.functions.invoke("create-user", {
      body: { name, email, password: generatedPassword, role: "cliente" },
    });

    if (response.error) throw new Error(response.error.message);

    const newUser: AppUser = {
      id: response.data.user_id,
      name,
      email,
      role: "CLIENTE",
      clientId: response.data.client_id,
    };

    return { user: newUser, generatedPassword };
  }, []);

  const addGestor = useCallback(async (name: string, email: string) => {
    const generatedPassword = generatePassword();
    
    const response = await supabase.functions.invoke("create-user", {
      body: { name, email, password: generatedPassword, role: "gestor" },
    });

    if (response.error) throw new Error(response.error.message);

    const newUser: AppUser = {
      id: response.data.user_id,
      name,
      email,
      role: "GESTOR",
    };

    return { user: newUser, generatedPassword };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, addClient, addGestor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
