import type { OrderStatus, PaymentMethod, Product } from "./api/types";

export function won(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function formatDate(iso: string, withTime = false): string {
  const d = new Date(iso);
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  if (!withTime) return date;
  return `${date} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function effectivePrice(product: Pick<Product, "price" | "salePrice">): number {
  return product.salePrice ?? product.price;
}

export function discountRate(product: Pick<Product, "price" | "salePrice">): number {
  if (product.salePrice === null) return 0;
  return Math.round((1 - product.salePrice / product.price) * 100);
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PAID: "결제 완료",
  PREPARING: "상품 준비중",
  SHIPPING: "배송중",
  DELIVERED: "배송 완료",
  CANCELLED: "주문 취소",
};

export const ORDER_STEPS: OrderStatus[] = ["PAID", "PREPARING", "SHIPPING", "DELIVERED"];

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  CARD: "신용/체크카드",
  BANK_TRANSFER: "무통장입금",
  KAKAO_PAY: "카카오페이",
};
