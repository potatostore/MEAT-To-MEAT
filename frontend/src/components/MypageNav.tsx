"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

const links = [
  { href: "/mypage", label: "마이페이지 홈" },
  { href: "/mypage/orders", label: "주문 · 배송 조회" },
  { href: "/mypage/profile", label: "회원 정보" },
  { href: "/mypage/addresses", label: "배송지 관리" },
  { href: "/mypage/inquiries", label: "1:1 문의 내역" },
];

export function MypageNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <aside className="side-nav">
      <h2 className="display">마이페이지</h2>
      {links.map((link) => {
        const active = link.href === "/mypage" ? pathname === "/mypage" : pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} className={active ? "on" : undefined}>
            {link.label}
          </Link>
        );
      })}
      <button
        type="button"
        className="link-btn"
        onClick={async () => {
          await logout();
          router.replace("/");
        }}
      >
        로그아웃
      </button>
    </aside>
  );
}
