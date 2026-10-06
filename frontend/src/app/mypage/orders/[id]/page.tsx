import type { Metadata } from "next";
import { OrderDetail } from "./OrderDetail";

export const metadata: Metadata = { title: "주문 상세" };

export default async function OrderDetailPage(props: PageProps<"/mypage/orders/[id]">) {
  const { id } = await props.params;
  return <OrderDetail orderId={Number(id)} />;
}
