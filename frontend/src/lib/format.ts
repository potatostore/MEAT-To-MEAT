import type { OrderStatus, Sex } from "./api/types";

export function won(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function formatDate(iso: string, withTime = false): string {
  const d = new Date(iso);
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  if (!withTime) return date;
  return `${date} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// 명세서 5.1(4) orders.order_status
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  ORDER_RECEIVED: "주문 접수",
  PREPARING_DELIVERY: "배송 준비중",
  IN_TRANSIT: "배송중",
  DELIVERED: "배송 완료",
  ORDER_CANCELED: "주문 취소",
};

export const ORDER_STEPS: OrderStatus[] = ["ORDER_RECEIVED", "PREPARING_DELIVERY", "IN_TRANSIT", "DELIVERED"];

// 명세서 5.1(1) users.sex
export const SEX_LABEL: Record<Sex, string> = {
  M: "남성",
  F: "여성",
  NONE: "선택 안 함",
};
