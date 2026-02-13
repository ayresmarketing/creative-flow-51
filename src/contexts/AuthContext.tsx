import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type UserRole = "GESTOR" | "CLIENTE";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  clientId?: string;
}

interface AuthContextType {
  user: AppUser | null;
  users: AppUser[];
  login: (email: string, password: string) => AppUser | null;
  logout: () => void;
  addClient: (name: string, email: string) => { user: AppUser; generatedPassword: string };
}

const AuthContext = createContext<AuthContextType | null>(null);

const initialUsers: AppUser[] = [
  {
    id: "gestor-1",
    name: "João Silva",
    email: "gestor@ayresmarketing.com",
    password: "123456",
    role: "GESTOR",
  },
  {
    id: "client-1",
    name: "Maria Santos",
    email: "cliente@empresa.com",
    password: "123456",
    role: "CLIENTE",
    clientId: "client-1",
  },
];

function generatePassword(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>(initialUsers);

  const login = useCallback(
    (email: string, password: string): AppUser | null => {
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (found) {
        setUser(found);
        return found;
      }
      return null;
    },
    [users]
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const addClient = useCallback(
    (name: string, email: string) => {
      const generatedPassword = generatePassword();
      const newUser: AppUser = {
        id: `client-${Date.now()}`,
        name,
        email,
        password: generatedPassword,
        role: "CLIENTE",
        clientId: `client-${Date.now()}`,
      };
      setUsers((prev) => [...prev, newUser]);
      return { user: newUser, generatedPassword };
    },
    []
  );

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addClient }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
