"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCart } from "@/lib/api/cart";
import { getToken, setToken } from "@/lib/api/client";
import * as membersApi from "@/lib/api/members";
import type { LoginRequest, Member } from "@/lib/api/types";

interface AuthContextValue {
  member: Member | null;
  loading: boolean;
  cartCount: number;
  login: (body: LoginRequest) => Promise<Member>;
  logout: () => Promise<void>;
  setMember: (member: Member | null) => void;
  refreshCart: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!getToken()) {
      setCartCount(0);
      return;
    }
    try {
      const cart = await getCart();
      setCartCount(cart.items.length);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (getToken()) {
        try {
          const me = await membersApi.getMe();
          if (!cancelled) setMember(me);
          await refreshCart();
        } catch {
          setToken(null);
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshCart]);

  const login = useCallback(
    async (body: LoginRequest) => {
      const res = await membersApi.login(body);
      setToken(res.accessToken);
      setMember(res.member);
      await refreshCart();
      return res.member;
    },
    [refreshCart],
  );

  const logout = useCallback(async () => {
    try {
      await membersApi.logout();
    } finally {
      setToken(null);
      setMember(null);
      setCartCount(0);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ member, loading, cartCount, login, logout, setMember, refreshCart }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
