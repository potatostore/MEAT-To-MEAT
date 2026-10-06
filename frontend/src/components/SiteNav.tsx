"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

const links = [
  { href: "/products", label: "전체 상품" },
  { href: "/deals", label: "오늘의 특가" },
  { href: "/delivery", label: "배송 안내" },
  { href: "/support", label: "고객센터" },
];

export function SiteNav() {
  const pathname = usePathname();
  const { member, loading, cartCount } = useAuth();

  return (
    <nav>
      <Link href="/" className="nav-mark">
        고기서<span>고기</span>
      </Link>
      <ul className="nav-links">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={pathname.startsWith(link.href) ? "active" : undefined}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="nav-right">
        {!loading &&
          (member ? (
            <Link href="/mypage" className="nav-user">
              {member.name}님
            </Link>
          ) : (
            <Link href="/login" className="nav-user">
              로그인
            </Link>
          ))}
        <Link href="/cart" className="nav-cta">
          장바구니{cartCount > 0 && <span className="nav-count">{cartCount}</span>}
        </Link>
      </div>
    </nav>
  );
}
