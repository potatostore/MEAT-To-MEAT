import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { RequireAuth } from "@/components/RequireAuth";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "주문서 작성" };

export default async function CheckoutPage(props: PageProps<"/checkout">) {
  const { items } = await props.searchParams;
  const itemIds = String(items ?? "")
    .split(",")
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);

  return (
    <div className="section">
      <PageHeader eyebrow="CHECKOUT" title="주문서 작성" />
      <RequireAuth>
        <CheckoutForm itemIds={itemIds} />
      </RequireAuth>
    </div>
  );
}
