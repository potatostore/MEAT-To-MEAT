import type { OrderStatus } from "@/lib/api/types";
import { ORDER_STATUS_LABEL, ORDER_STEPS } from "@/lib/format";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{ORDER_STATUS_LABEL[status]}</span>;
}

export function OrderTracker({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") return <div className="tracker-cancelled">취소된 주문입니다.</div>;
  const current = ORDER_STEPS.indexOf(status);
  return (
    <ol className="tracker">
      {ORDER_STEPS.map((step, i) => (
        <li key={step} className={i <= current ? "done" : undefined}>
          <span className="dot">{i + 1}</span>
          {ORDER_STATUS_LABEL[step]}
        </li>
      ))}
    </ol>
  );
}
