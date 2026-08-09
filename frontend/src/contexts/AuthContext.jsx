import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api("/api/auth/me")
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function login(credentials) {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });

    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await api("/api/auth/logout", {
      method: "POST"
    });

    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      login,
      logout
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
