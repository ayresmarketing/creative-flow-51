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
  clientName?: string;
  clientLogoUrl?: string | null;
  teamRole?: "admin" | "colaborador";
  isTeamMember?: boolean;
  avatarUrl?: string | null;
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
  const [{ data: roleData }, { data: profile }] = await Promise.all([
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", authUser.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("name, email")
      .eq("user_id", authUser.id)
      .maybeSingle(),
  ]);

  if (!roleData) return null;

  const role = roleData.role === "gestor" ? "GESTOR" : "CLIENTE";
  const normalizedEmail = (profile?.email || authUser.email || "").trim().toLowerCase();

  let clientId: string | undefined;
  let clientName: string | undefined;
  let clientLogoUrl: string | null = null;
  let teamRole: "admin" | "colaborador" | undefined;
  let isTeamMember = false;
  let avatarUrl: string | null = null;

  if (role === "CLIENTE") {
    const [clientByUser, teamMemberByUser, clientByEmail, teamMemberByEmail] = await Promise.all([
      supabase
        .from("clients")
        .select("id, name, logo_url")
        .eq("user_id", authUser.id)
        .maybeSingle(),
      supabase
        .from("client_team_members")
        .select("client_id, team_role, avatar_url, member_name")
        .eq("user_id", authUser.id)
        .limit(1)
        .maybeSingle(),
      normalizedEmail
        ? supabase
            .from("clients")
            .select("id, name, logo_url")
            .eq("email", normalizedEmail)
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      normalizedEmail
        ? supabase
            .from("client_team_members")
            .select("client_id, team_role, avatar_url, member_name")
            .eq("email", normalizedEmail)
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    const teamMembership = teamMemberByUser.data || teamMemberByEmail.data || null;
    const ownedClient = clientByUser.data || clientByEmail.data || null;

    clientId =
      ownedClient?.id ||
      teamMembership?.client_id ||
      undefined;

    if (teamMembership) {
      isTeamMember = true;
      teamRole = teamMembership.team_role as "admin" | "colaborador" | undefined;
      avatarUrl = teamMembership.avatar_url || null;
    }

    if (ownedClient) {
      clientName = ownedClient.name;
      clientLogoUrl = ownedClient.logo_url || null;
    } else if (clientId) {
      const { data: teamClient } = await supabase
        .from("clients")
        .select("name, logo_url")
        .eq("id", clientId)
        .maybeSingle();

      clientName = teamClient?.name;
      clientLogoUrl = teamClient?.logo_url || null;
    }
  }

  return {
    id: authUser.id,
    name: profile?.name || authUser.user_metadata?.name || authUser.email || "",
    email: profile?.email || authUser.email || "",
    role,
    clientId,
    clientName,
    clientLogoUrl,
    teamRole,
    isTeamMember,
    avatarUrl,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rememberMe = localStorage.getItem("remember_me");
    const tabAlive = sessionStorage.getItem("tab_alive");
    if (rememberMe === "false" && !tabAlive) {
      supabase.auth.signOut();
      localStorage.removeItem("remember_me");
    } else if (tabAlive) {
      sessionStorage.setItem("tab_alive", "1");
    }
  }, []);

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
