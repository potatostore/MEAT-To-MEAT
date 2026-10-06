import type { Metadata } from "next";
import { InquiryList } from "./InquiryList";

export const metadata: Metadata = { title: "1:1 문의 내역" };

export default function InquiriesPage() {
  return <InquiryList />;
}
