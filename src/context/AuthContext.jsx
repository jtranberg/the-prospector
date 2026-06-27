import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContext } from "./authContextObject";

import {
  changePassword as changePasswordRequest,
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from "../services/authService";



const TOKEN_KEY = "prospector-auth-token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(token));

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!token) {
        setAuthLoading(false);
        setUser(null);
        return;
      }

      try {
        setAuthLoading(true);

        const currentUser = await getCurrentUser(token);

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Unable to restore auth session:", error.message);

        localStorage.removeItem(TOKEN_KEY);

        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const register = useCallback(async (credentials) => {
    const data = await registerRequest(credentials);

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);

    return data.user;
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials);

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);

    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!token) {
        throw new Error("You must be logged in to change your password");
      }

      return changePasswordRequest(
        token,
        currentPassword,
        newPassword,
      );
    },
    [token],
  );

  const value = useMemo(
    () => ({
      token,
      user,
      authLoading,
      isAuthenticated: Boolean(user && token),
      register,
      login,
      logout,
      changePassword,
    }),
    [
      token,
      user,
      authLoading,
      register,
      login,
      logout,
      changePassword,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}