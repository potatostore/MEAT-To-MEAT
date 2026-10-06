"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderStatusBadge, OrderTracker } from "@/components/OrderStatus";
import { errorMessage } from "@/lib/api/client";
import { cancelOrder, getOrder } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { formatDate, PAYMENT_LABEL, won } from "@/lib/format";

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
          {order.orderNumber} · {formatDate(order.createdAt, true)} <OrderStatusBadge status={order.status} />
        </p>
      </div>

      <section className="panel">
        <h2 className="panel-title">배송 현황</h2>
        <OrderTracker status={order.status} />
        {order.trackingNumber && <p className="hint">운송장 번호 {order.trackingNumber} (고기서고기 새벽배송)</p>}
      </section>

      <section className="panel">
        <h2 className="panel-title">주문 상품</h2>
        <ul className="order-lines">
          {order.items.map((i) => (
            <li key={i.id}>
              <span>
                <Link href={`/products/${i.productId}`}>{i.productName}</Link>
                <small>
                  {i.optionName ?? "기본"} · {i.unit} × {i.quantity}
                </small>
              </span>
              <b>{won(i.unitPrice * i.quantity)}</b>
            </li>
          ))}
        </ul>
      </section>

      <div className="two-col">
        <section className="panel">
          <h2 className="panel-title">배송지</h2>
          <dl className="spec">
            <dt>받는 분</dt>
            <dd>{order.shipping.receiver}</dd>
            <dt>연락처</dt>
            <dd>{order.shipping.phone}</dd>
            <dt>주소</dt>
            <dd>
              ({order.shipping.zipcode}) {order.shipping.address1} {order.shipping.address2}
            </dd>
            <dt>요청사항</dt>
            <dd>{order.memo || "-"}</dd>
          </dl>
        </section>
        <section className="panel">
          <h2 className="panel-title">결제 정보</h2>
          <dl className="spec">
            <dt>상품 금액</dt>
            <dd>{won(order.totalPrice)}</dd>
            <dt>배송비</dt>
            <dd>{order.shippingFee === 0 ? "무료" : won(order.shippingFee)}</dd>
            <dt>결제 수단</dt>
            <dd>{PAYMENT_LABEL[order.paymentMethod]}</dd>
            <dt>총 결제</dt>
            <dd>
              <b>{won(order.finalPrice)}</b>
            </dd>
          </dl>
        </section>
      </div>

      {error && <p className="hint warn">{error}</p>}
      <div className="row-actions">
        <Link href={`/support/inquiry?orderId=${order.id}`} className="btn-outline">
          이 주문 문의하기
        </Link>
        {order.status === "PAID" &&
          (confirming ? (
            <>
              <span className="hint">정말 취소할까요?</span>
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
          ))}
      </div>
    </>
  );
}
