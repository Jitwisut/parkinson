import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, saveToken, clearToken, getUser, saveUser, clearUser } from "../lib/api";

type AuthContextType = {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  signIn: (token: string, user: any) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const storedToken = await getToken();
        const storedUser = await getUser();
        if (storedToken) {
          setTokenState(storedToken);
          setUserState(storedUser);
        }
      } catch (error) {
        console.error("Failed to load auth state", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  const signIn = async (newToken: string, newUser: any) => {
    await saveToken(newToken);
    await saveUser(newUser);
    setTokenState(newToken);
    setUserState(newUser);
  };

  const signOut = async () => {
    await clearToken();
    await clearUser();
    setTokenState(null);
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
