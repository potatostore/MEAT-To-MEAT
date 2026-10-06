import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { RequireAuth } from "@/components/RequireAuth";
import { InquiryForm } from "./InquiryForm";

export const metadata: Metadata = { title: "1:1 문의" };

export default async function InquiryPage(props: PageProps<"/support/inquiry">) {
  const { orderId } = await props.searchParams;
  const id = Number(orderId);
  return (
    <div className="section narrow">
      <PageHeader eyebrow="SUPPORT" title="1:1 문의" description="영업일 기준 24시간 이내에 답변드립니다." />
      <RequireAuth>
        <InquiryForm orderId={Number.isInteger(id) && id > 0 ? id : null} />
      </RequireAuth>
    </div>
  );
}
