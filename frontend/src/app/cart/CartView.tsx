"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ProductThumb } from "@/components/ProductThumb";
import { QuantityInput } from "@/components/QuantityInput";
import * as cartApi from "@/lib/api/cart";
import { errorMessage } from "@/lib/api/client";
import type { Cart } from "@/lib/api/types";
import { won } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/policy";

export function CartView() {
  const router = useRouter();
  const { refreshCart } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    cartApi
      .getCart()
      .then((c) => {
        setCart(c);
        setSelected(new Set(c.items.map((i) => i.id)));
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  async function run(action: () => Promise<Cart | void>) {
    setBusy(true);
    setError(null);
    try {
      const next = (await action()) ?? (await cartApi.getCart());
      setCart(next);
      setSelected((prev) => new Set(next.items.filter((i) => prev.has(i.id)).map((i) => i.id)));
      await refreshCart();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (!cart) return <div className="empty">{error ?? "불러오는 중…"}</div>;

  if (cart.items.length === 0) {
    return (
      <div className="empty">
        <p>장바구니가 비어 있습니다.</p>
        <Link href="/products" className="btn-primary">
          상품 보러 가기
        </Link>
      </div>
    );
  }

  const chosen = cart.items.filter((i) => selected.has(i.id));
  const total = chosen.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const shipping = total === 0 || total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const allChecked = chosen.length === cart.items.length;

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="cart-layout">
      <div>
        <div className="cart-toolbar">
          <label className="check">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={() => setSelected(allChecked ? new Set() : new Set(cart.items.map((i) => i.id)))}
            />
            전체 선택 ({chosen.length}/{cart.items.length})
          </label>
          <button
            type="button"
            className="link-btn"
            disabled={busy || chosen.length === 0}
            onClick={() =>
              run(async () => {
                for (const item of chosen) await cartApi.removeCartItem(item.id);
              })
            }
          >
            선택 삭제
          </button>
        </div>

        <ul className="line-items">
          {cart.items.map((item) => (
            <li key={item.id} className="line-item">
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={() => toggle(item.id)}
                aria-label={`${item.productName} 선택`}
              />
              <ProductThumb name={item.productName} category={item.category} size="sm" />
              <div className="line-info">
                <Link href={`/products/${item.productId}`} className="line-name">
                  {item.productName}
                </Link>
                <div className="line-sub">
                  {item.optionName ?? "기본"} · {item.unit} · {won(item.unitPrice)}
                </div>
                <QuantityInput
                  value={item.quantity}
                  max={item.stock}
                  disabled={busy}
                  onChange={(q) => run(() => cartApi.updateCartItem(item.id, q))}
                />
              </div>
              <div className="line-price">{won(item.unitPrice * item.quantity)}</div>
              <button
                type="button"
                className="line-remove"
                disabled={busy}
                onClick={() => run(() => cartApi.removeCartItem(item.id))}
                aria-label="삭제"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        {error && <p className="hint warn">{error}</p>}
      </div>

      <aside className="summary">
        <h3 className="display">결제 예정 금액</h3>
        <dl>
          <dt>상품 금액</dt>
          <dd>{won(total)}</dd>
          <dt>배송비</dt>
          <dd>{shipping === 0 ? "무료" : won(shipping)}</dd>
        </dl>
        {total > 0 && total < FREE_SHIPPING_THRESHOLD && (
          <p className="hint">{won(FREE_SHIPPING_THRESHOLD - total)} 더 담으면 무료배송</p>
        )}
        <div className="summary-total">
          <span>합계</span>
          <b>{won(total + shipping)}</b>
        </div>
        <button
          type="button"
          className="btn-primary btn-block"
          disabled={busy || chosen.length === 0}
          onClick={() => router.push(`/checkout?items=${chosen.map((i) => i.id).join(",")}`)}
        >
          {chosen.length}개 상품 주문하기
        </button>
      </aside>
    </div>
  );
}
