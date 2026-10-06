"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderStatusBadge } from "@/components/OrderStatus";
import { errorMessage } from "@/lib/api/client";
import { getOrders } from "@/lib/api/orders";
import type { Order, OrderStatus } from "@/lib/api/types";
import { formatDate, ORDER_STATUS_LABEL, won } from "@/lib/format";

export function OrderList() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrders().then(setOrders).catch((e) => setError(errorMessage(e)));
  }, []);

  const visible = orders?.filter((o) => filter === "ALL" || o.status === filter) ?? [];

  return (
    <>
      <div className="page-header">
        <h1 className="display">주문 · 배송 조회</h1>
      </div>
      <div className="chips">
        {(["ALL", ...Object.keys(ORDER_STATUS_LABEL)] as (OrderStatus | "ALL")[]).map((s) => (
          <button key={s} type="button" className={`chip${filter === s ? " on" : ""}`} onClick={() => setFilter(s)}>
            {s === "ALL" ? "전체" : ORDER_STATUS_LABEL[s]}
          </button>
        ))}
      </div>
      {!orders ? (
        <div className="empty">{error ?? "불러오는 중…"}</div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <p>주문 내역이 없습니다.</p>
          <Link href="/products" className="btn-primary">
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <ul className="order-cards">
          {visible.map((o) => (
            <li key={o.id} className="panel">
              <div className="panel-head">
                <span>
                  <b>{formatDate(o.createdAt)}</b> · {o.orderNumber}
                </span>
                <Link href={`/mypage/orders/${o.id}`}>상세 보기</Link>
              </div>
              <div className="order-card-body">
                <div>
                  <OrderStatusBadge status={o.status} />
                  <p className="order-name">
                    {o.items[0].productName}
                    {o.items.length > 1 && ` 외 ${o.items.length - 1}건`}
                  </p>
                </div>
                <b className="order-price">{won(o.finalPrice)}</b>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
