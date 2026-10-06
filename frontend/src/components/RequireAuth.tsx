"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

// 로그인이 필요한 화면을 감싼다. 비로그인 상태면 /login?next=현재경로 로 보낸다.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { member, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !member) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, member, pathname, router]);

  if (loading || !member) return <div className="empty">불러오는 중…</div>;
  return <>{children}</>;
}
