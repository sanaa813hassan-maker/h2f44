import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// ─── Simple fetch-based auth helpers ────────────────────────────────────────
// These replace the @base44/sdk methods that were removed.
// Wire `checkMe` to your real /api/auth/me endpoint when you add auth.

async function checkMe() {
  // TODO: replace with a real call, e.g.:
  // const res = await fetch('/api/auth/me');
  // if (!res.ok) throw Object.assign(new Error('Unauthenticated'), { status: res.status });
  // return res.json();
  throw Object.assign(new Error('Not authenticated'), { status: 401 });
}

function doLogout(redirectUrl) {
  // Clear any stored tokens
  localStorage.removeItem('base44_access_token');
  localStorage.removeItem('token');
  if (redirectUrl) {
    window.location.href = redirectUrl;
  }
}

function redirectToLogin(fromUrl) {
  // TODO: replace with your real login URL, e.g. '/login'
  const loginUrl = `/login${fromUrl ? `?from=${encodeURIComponent(fromUrl)}` : ''}`;
  window.location.href = loginUrl;
}

// ────────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      const currentUser = await checkMe();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      if (error.status === 401 || error.status === 403) {
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    doLogout(shouldRedirect ? window.location.href : undefined);
  };

  const navigateToLogin = () => {
    redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
