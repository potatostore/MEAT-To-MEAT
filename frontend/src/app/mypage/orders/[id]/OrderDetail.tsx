"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderStatusBadge, OrderTracker } from "@/components/OrderStatus";
import { errorMessage } from "@/lib/api/client";
import { cancelOrder, getOrder } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { formatDate, won } from "@/lib/format";

// ORD-04 사용자별 특정 주문 불러오기 + 주문 취소
export function OrderDetail({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    getOrder(orderId).then(setOrder).catch((e) => setError(errorMessage(e)));
  }, [orderId]);

  if (!order) return <div className="empty">{error ?? "불러오는 중…"}</div>;

  async function cancel() {
    setPending(true);
    setError(null);
    try {
      setOrder(await cancelOrder(orderId));
      setConfirming(false);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <Link href="/mypage/orders" className="back-link">
          ← 주문 목록
        </Link>
        <h1 className="display">주문 상세</h1>
        <p>
          주문번호 #{order.id} · {formatDate(order.createdAt, true)} <OrderStatusBadge status={order.status} />
        </p>
      </div>

      <section className="panel">
        <h2 className="panel-title">배송 현황</h2>
        <OrderTracker status={order.status} />
      </section>

      <section className="panel">
        <h2 className="panel-title">주문 상품</h2>
        <ul className="order-lines">
          {order.items.map((i) => (
            <li key={i.id}>
              <span>
                <Link href={`/products/${i.productId}`}>{i.productName}</Link>
                <small>
                  주문 당시 {won(i.unitPrice)} × {i.quantity}
                </small>
              </span>
              <b>{won(i.unitPrice * i.quantity)}</b>
            </li>
          ))}
        </ul>
        <div className="summary-total">
          <span>총 주문 금액</span>
          <b>{won(order.totalPrice)}</b>
        </div>
      </section>

      {error && <p className="hint warn">{error}</p>}
      {order.status === "ORDER_RECEIVED" && (
        <div className="row-actions">
          {confirming ? (
            <>
              <span className="hint">정말 취소할까요? 재고가 다시 복구됩니다.</span>
              <button type="button" className="btn-danger" onClick={cancel} disabled={pending}>
                취소 확정
              </button>
              <button type="button" className="btn-outline" onClick={() => setConfirming(false)}>
                아니요
              </button>
            </>
          ) : (
            <button type="button" className="btn-outline" onClick={() => setConfirming(true)}>
              주문 취소
            </button>
          )}
        </div>
      )}
    </>
  );
}
