/**
 * SwitchX Authentication Context
 * Handles auth token, user data, and SwitchX WebApp bridge integration
 * Client-side only - integrates with SwitchX mini app environment
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SwitchXCore } from '../core';
import type { UserInfo } from '../types';

/**
 * SwitchX WebApp Bridge Interface
 * Available when running inside SwitchX app
 */
interface SwitchXWebApp {
  getAuthToken(): { token: string; userId: string } | null;
  getCommunityInfo?(): { id: string; name: string } | null;
  clearData(): void;
}

declare global {
  interface Window {
    SwitchX?: {
      WebApp?: SwitchXWebApp;
    };
  }
}

/**
 * Theme data from parent SwitchX app
 */
interface SwitchXTheme {
  colorScheme?: 'light' | 'dark';
  hasImageBackground?: boolean;
  backgroundImageUrl?: string | null;
  bg_color?: string;
  background?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

/**
 * Authentication Context Value
 */
interface SwitchXAuthContextValue {
  // Auth state
  token: string | null;
  userId: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  userLoading: boolean;
  communityId: string | null;

  // Auth actions
  refreshAuthFromParent: () => Promise<boolean>;
  clearAuth: () => void;
  refreshUserInfo: () => Promise<boolean>;

  // Helpers
  isEmbedded: boolean;

  // Pre-configured API client
  client: SwitchXCore | null;

  // Theme state (from parent)
  theme: SwitchXTheme | null;
  hasImageBackground: boolean;
  backgroundImageUrl: string | null;
}

// Create context
const SwitchXAuthContext = createContext<SwitchXAuthContextValue | null>(null);

/**
 * Hook to use SwitchX authentication
 * Must be used within SwitchXAuthProvider
 */
export function useAuth(): SwitchXAuthContextValue {
  const context = useContext(SwitchXAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SwitchXAuthProvider');
  }
  return context;
}

/**
 * Hook to get user information for any user
 * @param targetUserId - The ID of the user to fetch info for
 */
export function useUserInfo(targetUserId?: string) {
  const { token } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!targetUserId || !token) {
      setUserInfo(null);
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const client = new SwitchXCore(token);
      const info = await client.getUser(targetUserId);
      setUserInfo(info);
      return info;
    } catch (err: any) {
      console.error('Failed to fetch user info:', err);
      setError(err.message || 'Failed to fetch user information');
      setUserInfo(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [targetUserId, token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    userInfo,
    loading,
    error,
    refetch: fetchUser
  };
}

/**
 * SwitchX Authentication Provider Props
 */
interface SwitchXAuthProviderProps {
  children: React.ReactNode;
  /**
   * Optional callback when auth state changes
   */
  onAuthChange?: (isAuthenticated: boolean) => void;
  /**
   * Enable automatic parent window notifications
   * Default: true
   */
  notifyParent?: boolean;
  /**
   * Allowed parent origin for postMessage security
   * Default: '*' (not recommended for production)
   * Example: 'https://switchx.gg'
   */
  parentOrigin?: string;
}

/**
 * SwitchX Authentication Provider
 * Manages authentication state and SwitchX WebApp bridge integration
 */
export function SwitchXAuthProvider({
  children,
  onAuthChange,
  notifyParent = true,
  parentOrigin = '*'
}: SwitchXAuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [communityId, setCommunityId] = useState<string | null>(null);

  // Theme state from parent
  const [theme, setTheme] = useState<SwitchXTheme | null>(null);
  const [hasImageBackground, setHasImageBackground] = useState(false);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);

  /**
   * Auto-inject SwitchX bridge script if not already loaded
   * Loads from CDN: https://www.switchx.gg/switchx-app-bridge.js
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if bridge already exists
    if (window.SwitchX?.WebApp) {
      console.log('[SwitchXAuth] Bridge already loaded');
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="switchx-app-bridge.js"]');
    if (existingScript) {
      console.log('[SwitchXAuth] Bridge script already in DOM, waiting for load...');
      return;
    }

    // Inject bridge script
    console.log('[SwitchXAuth] Injecting bridge script from CDN...');
    const script = document.createElement('script');
    script.src = 'https://www.switchx.gg/switchx-app-bridge.js';
    script.async = false; // Load synchronously to ensure bridge is ready
    script.onload = () => {
      console.log('[SwitchXAuth] Bridge script loaded successfully');
    };
    script.onerror = () => {
      console.error('[SwitchXAuth] Failed to load bridge script from CDN');
    };
    document.head.appendChild(script);
  }, []); // Run once on mount

  /**
   * Listen for parent theme changes via postMessage
   * Parent sends SWITCHX_THEME message with theme data including image background
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleParentTheme = (event: MessageEvent) => {
      if (event.data?.type === 'SWITCHX_THEME' && event.data?.theme) {
        console.log('[SwitchXAuth] Received SWITCHX_THEME from parent:', event.data.theme);
        const parentTheme = event.data.theme as SwitchXTheme;

        // Update theme state
        setTheme(parentTheme);

        // Update image background state
        if (parentTheme.hasImageBackground) {
          console.log('[SwitchXAuth] Parent has image background:', parentTheme.backgroundImageUrl);
          setHasImageBackground(true);
          setBackgroundImageUrl(parentTheme.backgroundImageUrl || null);

          // Apply transparent background to html/body for parent image to show through
          const root = document.documentElement;
          root.style.setProperty('--switchx-has-image-bg', 'true');
          root.style.setProperty('--background', 'transparent');
          if (parentTheme.backgroundImageUrl) {
            root.style.setProperty('--switchx-background-image', `url(${parentTheme.backgroundImageUrl})`);
          }
          document.body.style.backgroundColor = 'transparent';
        } else {
          setHasImageBackground(false);
          setBackgroundImageUrl(null);

          // Use solid background from parent theme
          const root = document.documentElement;
          root.style.setProperty('--switchx-has-image-bg', 'false');
          if (parentTheme.bg_color || parentTheme.background) {
            const bgColor = parentTheme.bg_color || parentTheme.background;
            root.style.setProperty('--background', bgColor!);
            document.body.style.backgroundColor = bgColor!;
          }
        }

        // Apply other theme colors as CSS variables
        if (parentTheme.text_color) {
          document.documentElement.style.setProperty('--foreground', parentTheme.text_color);
        }
        if (parentTheme.hint_color) {
          document.documentElement.style.setProperty('--muted-foreground', parentTheme.hint_color);
        }
        if (parentTheme.button_color) {
          document.documentElement.style.setProperty('--primary', parentTheme.button_color);
        }
        if (parentTheme.secondary_bg_color) {
          document.documentElement.style.setProperty('--card', parentTheme.secondary_bg_color);
          document.documentElement.style.setProperty('--muted', parentTheme.secondary_bg_color);
        }
      }
    };

    window.addEventListener('message', handleParentTheme);
    return () => window.removeEventListener('message', handleParentTheme);
  }, []);

  // Create API client instance (memoized to avoid recreating on every render)
  const client = useMemo(() => {
    return token ? new SwitchXCore(token) : null;
  }, [token]);

  /**
   * Fetch user information using the stored token and userId
   */
  const fetchUserInfo = useCallback(async (signal?: AbortSignal): Promise<boolean> => {
    if (!token || !userId) return false;

    try {
      setUserLoading(true);
      const client = new SwitchXCore(token);
      const userInfo = await client.getUser(userId);

      // Check if aborted before updating state
      if (signal?.aborted) return false;

      setUser(userInfo);

      // Cache user data in localStorage with timestamp
      if (typeof window !== 'undefined') {
        localStorage.setItem('switchx_user', JSON.stringify({
          data: userInfo,
          timestamp: Date.now()
        }));
      }

      return true;
    } catch (error) {
      if (signal?.aborted) return false;
      console.error('Failed to fetch user info:', error);
      return false;
    } finally {
      if (!signal?.aborted) {
        setUserLoading(false);
      }
    }
  }, [token, userId]);

  /**
   * Notify parent window when authentication state changes
   * Memoized with useRef to avoid dependency issues
   */
  const notifyParentAuthRef = React.useRef<(authenticated: boolean) => void>();

  notifyParentAuthRef.current = (authenticated: boolean) => {
    if (!notifyParent) return;

    if (typeof window !== 'undefined' && window.parent !== window) {
      try {
        window.parent.postMessage({
          type: 'miniapp_auth_changed',
          isAuthenticated: authenticated,
          timestamp: Date.now()
        }, parentOrigin);
        console.log('[SwitchXAuth] Notified parent of auth state:', authenticated);
      } catch (e) {
        console.warn('[SwitchXAuth] Failed to notify parent:', e);
      }
    }

    // Call user callback
    onAuthChange?.(authenticated);
  };

  const notifyParentAuth = useCallback((authenticated: boolean) => {
    notifyParentAuthRef.current?.(authenticated);
  }, []);

  /**
   * Load auth from SwitchX bridge on initial render
   */
  useEffect(() => {
    const initAuth = () => {
      if (typeof window === 'undefined') return;

      let shouldNotifyParent = false;

      // Try to load from localStorage first (fast)
      try {
        const storedAuth = localStorage.getItem('switchx_auth');
        const storedUser = localStorage.getItem('switchx_user');

        if (storedAuth) {
          const { token: storedToken, userId: storedUserId, communityId: storedCommunityId } = JSON.parse(storedAuth);
          if (storedToken && storedUserId) {
            setToken(storedToken);
            setUserId(storedUserId);
            setIsAuthenticated(true);

            // Set communityId if available
            if (storedCommunityId) {
              setCommunityId(storedCommunityId);
            }

            // Load cached user data if available and not expired
            if (storedUser) {
              try {
                const { data: userData, timestamp } = JSON.parse(storedUser);
                const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
                const isExpired = Date.now() - timestamp > CACHE_DURATION;

                if (!isExpired && userData) {
                  setUser(userData);
                  shouldNotifyParent = true; // Only notify if we have complete auth + user
                  console.log('[SwitchXAuth] Auth + user loaded from cache (instant)');
                } else {
                  if (isExpired) {
                    console.log('[SwitchXAuth] Cached user data expired, will fetch fresh');
                    localStorage.removeItem('switchx_user');
                  }
                  console.log('[SwitchXAuth] Auth loaded from localStorage (will fetch user)');
                }
              } catch (e) {
                console.warn('[SwitchXAuth] Failed to parse cached user data:', e);
                console.log('[SwitchXAuth] Auth loaded from localStorage (will fetch user)');
              }
            } else {
              console.log('[SwitchXAuth] Auth loaded from localStorage (will fetch user)');
            }
          }
        }
      } catch (e) {
        console.warn('[SwitchXAuth] Failed to load from localStorage:', e);
      }

      // Check SwitchX bridge (may override localStorage)
      if (window.SwitchX?.WebApp) {
        const authData = window.SwitchX.WebApp.getAuthToken();
        const communityInfo = window.SwitchX.WebApp.getCommunityInfo?.();

        if (authData?.token && authData?.userId) {
          setToken(authData.token);
          setUserId(authData.userId);
          setIsAuthenticated(true);

          // Set communityId if available
          if (communityInfo?.id) {
            setCommunityId(communityInfo.id);
          }

          // Store in localStorage
          localStorage.setItem('switchx_auth', JSON.stringify({
            token: authData.token,
            userId: authData.userId,
            communityId: communityInfo?.id
          }));

          console.log('[SwitchXAuth] Auth loaded from SwitchX bridge');
        }
      }

      setLoading(false);

      // Notify parent after all setup is complete (only if we have cached user)
      if (shouldNotifyParent) {
        notifyParentAuth(true);
      }
    };

    // Listen for switch-bridge auth ready event
    const handleSwitchBridgeAuth = () => {
      console.log('[SwitchXAuth] Switch bridge auth ready event');

      if (typeof window !== 'undefined' && window.SwitchX?.WebApp) {
        const authData = window.SwitchX.WebApp.getAuthToken();
        const communityInfo = window.SwitchX.WebApp.getCommunityInfo?.();

        if (authData?.token && authData?.userId) {
          setToken(authData.token);
          setUserId(authData.userId);
          setIsAuthenticated(true);
          setLoading(false);

          // Set communityId if available
          if (communityInfo?.id) {
            setCommunityId(communityInfo.id);
          }

          // Store in localStorage
          localStorage.setItem('switchx_auth', JSON.stringify({
            token: authData.token,
            userId: authData.userId,
            communityId: communityInfo?.id
          }));

          console.log('[SwitchXAuth] Auth loaded from event');
        }
      }
    };

    window.addEventListener('switchAuthReady', handleSwitchBridgeAuth);

    initAuth();

    return () => {
      window.removeEventListener('switchAuthReady', handleSwitchBridgeAuth);
    };
  }, [notifyParentAuth]);

  /**
   * Fetch user info when token/userId change, then notify parent (only once)
   */
  useEffect(() => {
    if (!isAuthenticated || !token || !userId || user) {
      return;
    }

    const abortController = new AbortController();

    fetchUserInfo(abortController.signal).then((success) => {
      if (success && !abortController.signal.aborted) {
        notifyParentAuth(true);
        console.log('[SwitchXAuth] ✅ Auth complete with user data - notified parent');
      }
    });

    return () => {
      abortController.abort();
    };
  }, [isAuthenticated, token, userId, user, fetchUserInfo, notifyParentAuth]);

  /**
   * Clear user when not authenticated
   */
  useEffect(() => {
    if (!isAuthenticated && user) {
      setUser(null);
    }
  }, [isAuthenticated, user]);

  /**
   * Refresh auth token from parent app
   */
  const refreshAuthFromParent = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.SwitchX?.WebApp) {
      console.warn('[SwitchXAuth] Not embedded in parent app - cannot refresh auth');
      return false;
    }

    try {
      setLoading(true);

      const authData = window.SwitchX.WebApp.getAuthToken();
      const communityInfo = window.SwitchX.WebApp.getCommunityInfo?.();

      if (authData?.token && authData?.userId) {
        setToken(authData.token);
        setUserId(authData.userId);
        setIsAuthenticated(true);

        // Set communityId if available
        if (communityInfo?.id) {
          setCommunityId(communityInfo.id);
        }

        // Store in localStorage
        localStorage.setItem('switchx_auth', JSON.stringify({
          token: authData.token,
          userId: authData.userId,
          communityId: communityInfo?.id
        }));

        console.log('[SwitchXAuth] ✅ Auth refreshed from parent');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[SwitchXAuth] Failed to refresh auth from parent:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear local auth (logout is handled by parent app)
   */
  const clearAuth = useCallback(() => {
    setToken(null);
    setUserId(null);
    setUser(null);
    setIsAuthenticated(false);
    notifyParentAuth(false);

    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('switchx_auth');
      localStorage.removeItem('switchx_user');
    }

    // Clear from switch-bridge memory
    if (typeof window !== 'undefined' && window.SwitchX?.WebApp) {
      window.SwitchX.WebApp.clearData();
    }

    console.log('[SwitchXAuth] Auth cleared');
  }, [notifyParentAuth]);

  const value: SwitchXAuthContextValue = {
    token,
    userId,
    user,
    isAuthenticated,
    loading,
    userLoading,
    refreshAuthFromParent,
    clearAuth,
    refreshUserInfo: fetchUserInfo,
    isEmbedded: typeof window !== 'undefined' && !!window.SwitchX?.WebApp,
    client,
    communityId,
    // Theme state
    theme,
    hasImageBackground,
    backgroundImageUrl,
  };

  return (
    <SwitchXAuthContext.Provider value={value}>
      {children}
    </SwitchXAuthContext.Provider>
  );
}

// Export context for advanced usage
export { SwitchXAuthContext };
