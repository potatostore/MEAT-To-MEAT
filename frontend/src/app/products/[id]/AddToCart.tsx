"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { QuantityInput } from "@/components/QuantityInput";
import { addCartItem } from "@/lib/api/cart";
import { errorMessage } from "@/lib/api/client";
import type { Product } from "@/lib/api/types";
import { won } from "@/lib/format";

// CART-02 장바구니 상품 담기
export function AddToCart({ product }: { product: Product }) {
  const router = useRouter();
  const pathname = usePathname();
  const { member, refreshCart } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const soldOut = product.stock === 0;

  async function submit(goCheckout: boolean) {
    if (!member) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      const cart = await addCartItem({ productId: product.id, quantity });
      await refreshCart();
      const added = cart.items.find((i) => i.productId === product.id);
      if (goCheckout && added) router.push(`/checkout?items=${added.id}`);
      else setMessage({ ok: true, text: "장바구니에 담았습니다." });
    } catch (e) {
      setMessage({ ok: false, text: errorMessage(e) });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="buy-box">
      <div className="detail-price">
        <b>{won(product.price)}</b>
      </div>

      <div className="buy-row">
        <QuantityInput value={quantity} max={Math.max(1, product.stock)} onChange={setQuantity} disabled={soldOut} />
        <div className="buy-total">
          총 <b>{won(product.price * quantity)}</b>
        </div>
      </div>

      {soldOut ? (
        <button type="button" className="btn-primary btn-block" disabled>
          일시 품절
        </button>
      ) : (
        <div className="buy-actions">
          <button type="button" className="btn-outline" onClick={() => submit(false)} disabled={pending}>
            장바구니 담기
          </button>
          <button type="button" className="btn-primary" onClick={() => submit(true)} disabled={pending}>
            바로 구매
          </button>
        </div>
      )}
      {product.stock > 0 && product.stock <= 20 && <p className="hint warn">남은 재고 {product.stock}개</p>}
      {message && <p className={`hint ${message.ok ? "ok" : "warn"}`}>{message.text}</p>}
    </div>
  );
}
