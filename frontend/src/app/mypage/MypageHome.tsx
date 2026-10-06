"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { OrderStatusBadge } from "@/components/OrderStatus";
import { getOrders } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { formatDate, won } from "@/lib/format";

export function MypageHome() {
  const { member, cartCount } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  const inProgress = orders?.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED").length ?? 0;

  return (
    <>
      <div className="page-header">
        <h1 className="display">{member?.name}님, 반가워요</h1>
        <p>{member?.email}</p>
      </div>
      <div className="stat-row stat-cards">
        <Link href="/mypage/orders" className="stat">
          <b>{orders?.length ?? "-"}</b>
          <span>전체 주문</span>
        </Link>
        <Link href="/mypage/orders" className="stat">
          <b>{orders ? inProgress : "-"}</b>
          <span>배송 진행중</span>
        </Link>
        <Link href="/cart" className="stat">
          <b>{cartCount}</b>
          <span>장바구니</span>
        </Link>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2 className="panel-title">최근 주문</h2>
          <Link href="/mypage/orders">전체 보기</Link>
        </div>
        {!orders ? (
          <div className="empty">불러오는 중…</div>
        ) : orders.length === 0 ? (
          <div className="empty">아직 주문 내역이 없습니다.</div>
        ) : (
          <ul className="order-list">
            {orders.slice(0, 3).map((o) => (
              <li key={o.id}>
                <Link href={`/mypage/orders/${o.id}`}>
                  <span className="order-date">{formatDate(o.createdAt)}</span>
                  <span className="order-name">
                    {o.items[0].productName}
                    {o.items.length > 1 && ` 외 ${o.items.length - 1}건`}
                  </span>
                  <OrderStatusBadge status={o.status} />
                  <b>{won(o.finalPrice)}</b>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
