import { redirect } from "next/navigation";

// 특가(할인가)는 DB 설계 범위 밖이라 전체 상품으로 보낸다
export default function DealsPage() {
  redirect("/products");
}
