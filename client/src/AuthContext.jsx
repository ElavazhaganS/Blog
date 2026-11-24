import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, tokenStore } from "./api.js";
const AuthContext = createContext(null);
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
        const currentUser = await api.me();
        if (isMounted && currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);
  const login = useCallback(async (email, password) => {
    const { token, user: signedIn } = await api.login(email, password);
    tokenStore.set(token);
    setUser(signedIn);
    return signedIn;
  }, []);
  const register = useCallback(async (username, email, password) => {
    const { token, user: created } = await api.register(username, email, password);
    tokenStore.set(token);
    setUser(created);
    return created;
  }, []);
  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);
  return <AuthContext.Provider
    value={{
      user,
      isAuthenticated: Boolean(user),
      loading,
      isLoading: loading,
      login,
      register,
      logout
    }}
  >
      {children}
    </AuthContext.Provider>;
}
export default AuthContext;
