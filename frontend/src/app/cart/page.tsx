import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { RequireAuth } from "@/components/RequireAuth";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "장바구니" };

export default function CartPage() {
  return (
    <div className="section">
      <PageHeader eyebrow="CART" title="장바구니" />
      <RequireAuth>
        <CartView />
      </RequireAuth>
    </div>
  );
}
