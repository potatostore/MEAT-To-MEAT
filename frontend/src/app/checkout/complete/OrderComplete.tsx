"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { errorMessage } from "@/lib/api/client";
import { getOrder } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { PAYMENT_LABEL, won } from "@/lib/format";

export function OrderComplete({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrder(orderId).then(setOrder).catch((e) => setError(errorMessage(e)));
  }, [orderId]);

  if (!order) return <div className="empty">{error ?? "불러오는 중…"}</div>;

  return (
    <div className="complete">
      <div className="seal complete-seal">
        <div className="seal-text">
          <div className="big display">
            주문
            <br />
            완료
          </div>
        </div>
      </div>
      <h1 className="display">주문이 접수되었습니다</h1>
      <p>
        주문번호 <b>{order.orderNumber}</b>
      </p>
      <dl className="spec">
        <dt>결제 금액</dt>
        <dd>{won(order.finalPrice)}</dd>
        <dt>결제 수단</dt>
        <dd>{PAYMENT_LABEL[order.paymentMethod]}</dd>
        <dt>배송지</dt>
        <dd>
          {order.shipping.address1} {order.shipping.address2}
        </dd>
      </dl>
      <div className="hero-actions">
        <Link href={`/mypage/orders/${order.id}`} className="btn-primary">
          주문 상세 보기
        </Link>
        <Link href="/products" className="btn-ghost">
          쇼핑 계속하기
        </Link>
      </div>
    </div>
  );
}
