"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getCart } from "@/lib/api/cart";
import { errorMessage } from "@/lib/api/client";
import { getAddresses } from "@/lib/api/members";
import { createOrder } from "@/lib/api/orders";
import type { Address, CartItem, PaymentMethod, Receiver } from "@/lib/api/types";
import { PAYMENT_LABEL, won } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/policy";

const MEMOS = ["문 앞에 놓아주세요", "경비실에 맡겨주세요", "배송 전 연락 부탁드립니다", "직접 입력"];
const emptyReceiver: Receiver = { receiver: "", phone: "", zipcode: "", address1: "", address2: "" };

function toReceiver(a: Address): Receiver {
  return { receiver: a.receiver, phone: a.phone, zipcode: a.zipcode, address1: a.address1, address2: a.address2 };
}

export function CheckoutForm({ itemIds }: { itemIds: number[] }) {
  const router = useRouter();
  const { member, refreshCart } = useAuth();
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<number | "new">("new");
  const [shipping, setShipping] = useState<Receiver>(emptyReceiver);
  const [memoType, setMemoType] = useState(MEMOS[0]);
  const [memo, setMemo] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("CARD");
  const [agree, setAgree] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCart(), getAddresses()])
      .then(([cart, list]) => {
        setItems(itemIds.length ? cart.items.filter((i) => itemIds.includes(i.id)) : cart.items);
        setAddresses(list);
        const preferred = list.find((a) => a.isDefault) ?? list[0];
        if (preferred) {
          setAddressId(preferred.id);
          setShipping(toReceiver(preferred));
        } else if (member) {
          setShipping({ ...emptyReceiver, receiver: member.name, phone: member.phone });
        }
      })
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
  const shippingFee = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  function selectAddress(value: string) {
    if (value === "new") {
      setAddressId("new");
      setShipping(emptyReceiver);
      return;
    }
    const address = addresses.find((a) => a.id === Number(value));
    if (address) {
      setAddressId(address.id);
      setShipping(toReceiver(address));
    }
  }

  function field(key: keyof Receiver) {
    return {
      value: shipping[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddressId("new");
        setShipping((prev) => ({ ...prev, [key]: e.target.value }));
      },
      required: key !== "address2",
    };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!items) return;
    setPending(true);
    setError(null);
    try {
      const order = await createOrder({
        cartItemIds: items.map((i) => i.id),
        shipping,
        memo: memoType === "직접 입력" ? memo : memoType,
        paymentMethod: payment,
      });
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
                    {i.optionName ?? "기본"} · {i.unit} × {i.quantity}
                  </small>
                </span>
                <b>{won(i.unitPrice * i.quantity)}</b>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2 className="panel-title">배송지</h2>
          {addresses.length > 0 && (
            <div className="chips">
              {addresses.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`chip${addressId === a.id ? " on" : ""}`}
                  onClick={() => selectAddress(String(a.id))}
                >
                  {a.label}
                  {a.isDefault && " (기본)"}
                </button>
              ))}
              <button
                type="button"
                className={`chip${addressId === "new" ? " on" : ""}`}
                onClick={() => selectAddress("new")}
              >
                새 배송지
              </button>
            </div>
          )}
          <div className="form-grid">
            <label className="field">
              <span>받는 분</span>
              <input {...field("receiver")} />
            </label>
            <label className="field">
              <span>연락처</span>
              <input {...field("phone")} placeholder="010-0000-0000" />
            </label>
            <label className="field">
              <span>우편번호</span>
              <input {...field("zipcode")} />
            </label>
            <label className="field wide">
              <span>주소</span>
              <input {...field("address1")} />
            </label>
            <label className="field wide">
              <span>상세 주소</span>
              <input {...field("address2")} />
            </label>
            <label className="field wide">
              <span>배송 요청사항</span>
              <select value={memoType} onChange={(e) => setMemoType(e.target.value)}>
                {MEMOS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            {memoType === "직접 입력" && (
              <label className="field wide">
                <span>요청사항 입력</span>
                <input value={memo} onChange={(e) => setMemo(e.target.value)} maxLength={50} />
              </label>
            )}
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">결제 수단</h2>
          <div className="chips">
            {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((method) => (
              <button
                key={method}
                type="button"
                className={`chip${payment === method ? " on" : ""}`}
                onClick={() => setPayment(method)}
              >
                {PAYMENT_LABEL[method]}
              </button>
            ))}
          </div>
          <p className="hint">텀 프로젝트 데모로 실제 결제는 이루어지지 않습니다.</p>
        </section>
      </div>

      <aside className="summary">
        <h3 className="display">최종 결제 금액</h3>
        <dl>
          <dt>상품 금액</dt>
          <dd>{won(total)}</dd>
          <dt>배송비</dt>
          <dd>{shippingFee === 0 ? "무료" : won(shippingFee)}</dd>
        </dl>
        <div className="summary-total">
          <span>합계</span>
          <b>{won(total + shippingFee)}</b>
        </div>
        <label className="check">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          주문 내용을 확인했으며 결제에 동의합니다.
        </label>
        {error && <p className="hint warn">{error}</p>}
        <button type="submit" className="btn-primary btn-block" disabled={!agree || pending}>
          {pending ? "주문 처리 중…" : `${won(total + shippingFee)} 결제하기`}
        </button>
      </aside>
    </form>
  );
}
