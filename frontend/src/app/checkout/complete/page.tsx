import type { Metadata } from "next";
import { RequireAuth } from "@/components/RequireAuth";
import { OrderComplete } from "./OrderComplete";

export const metadata: Metadata = { title: "주문 완료" };

export default async function OrderCompletePage(props: PageProps<"/checkout/complete">) {
  const { orderId } = await props.searchParams;
  return (
    <div className="section narrow">
      <RequireAuth>
        <OrderComplete orderId={Number(orderId)} />
      </RequireAuth>
    </div>
  );
}
