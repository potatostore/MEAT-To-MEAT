"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { errorMessage } from "@/lib/api/client";
import { getOrder } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { formatDate, ORDER_STATUS_LABEL, won } from "@/lib/format";

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
        주문번호 <b>#{order.id}</b>
      </p>
      <dl className="spec">
        <dt>주문 금액</dt>
        <dd>{won(order.totalPrice)}</dd>
        <dt>주문 상태</dt>
        <dd>{ORDER_STATUS_LABEL[order.status]}</dd>
        <dt>주문 일시</dt>
        <dd>{formatDate(order.createdAt, true)}</dd>
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
