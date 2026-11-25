"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getCart } from "@/lib/api/cart";
import { errorMessage } from "@/lib/api/client";
import { createOrder } from "@/lib/api/orders";
import type { CartItem } from "@/lib/api/types";
import { won } from "@/lib/format";

// ORD-01 주문 생성: 장바구니에서 고른 항목(cart_item_id)으로 주문을 만든다
export function CheckoutForm({ itemIds }: { itemIds: number[] }) {
  const router = useRouter();
  const { member, refreshCart } = useAuth();
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [agree, setAgree] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCart()
      .then((cart) => setItems(itemIds.length ? cart.items.filter((i) => itemIds.includes(i.id)) : cart.items))
      .catch((e) => setError(errorMessage(e)));
    // itemIds 는 URL 에서 한 번만 전달된다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!items) return <div className="empty">{error ?? "불러오는 중…"}</div>;
  if (items.length === 0) {
    return (
      <div className="empty">
        <p>주문할 상품이 없습니다.</p>
        <Link href="/cart" className="btn-primary">
          장바구니로 이동
        </Link>
      </div>
    );
  }

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!items) return;
    setPending(true);
    setError(null);
    try {
      const order = await createOrder({ cartItemIds: items.map((i) => i.id) });
      await refreshCart();
      router.replace(`/checkout/complete?orderId=${order.id}`);
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  }

  return (
    <form className="cart-layout" onSubmit={submit}>
      <div className="checkout-sections">
        <section className="panel">
          <h2 className="panel-title">주문 상품 {items.length}개</h2>
          <ul className="order-lines">
            {items.map((i) => (
              <li key={i.id}>
                <span>
                  {i.productName}
                  <small>
                    {won(i.unitPrice)} × {i.quantity}
                  </small>
                </span>
                <b>{won(i.unitPrice * i.quantity)}</b>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2 className="panel-title">주문자</h2>
          <dl className="spec">
            <dt>이름</dt>
            <dd>{member?.name}</dd>
            <dt>연락처</dt>
            <dd>{member?.phone}</dd>
            <dt>이메일</dt>
            <dd>{member?.email}</dd>
          </dl>
          <p className="hint">텀 프로젝트 범위상 배송지 입력과 실제 결제는 생략합니다.</p>
        </section>
      </div>

      <aside className="summary">
        <h3 className="display">주문 금액</h3>
        <div className="summary-total">
          <span>합계</span>
          <b>{won(total)}</b>
        </div>
        <label className="check">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          주문 내용을 확인했습니다.
        </label>
        {error && <p className="hint warn">{error}</p>}
        <button type="submit" className="btn-primary btn-block" disabled={!agree || pending}>
          {pending ? "주문 처리 중…" : `${won(total)} 주문하기`}
        </button>
      </aside>
    </form>
  );
}
