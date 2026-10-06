import type { Metadata } from "next";
import { OrderList } from "./OrderList";

export const metadata: Metadata = { title: "주문 · 배송 조회" };

export default function OrdersPage() {
  return <OrderList />;
}
