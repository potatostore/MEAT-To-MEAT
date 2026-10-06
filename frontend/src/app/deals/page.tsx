import type { Metadata } from "next";
import { connection } from "next/server";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { getDeals } from "@/lib/api/products";

export const metadata: Metadata = { title: "오늘의 특가" };

export default async function DealsPage() {
  await connection(); // 특가는 요청 시점 기준으로 조회
  const deals = await getDeals();

  return (
    <div className="section">
      <PageHeader
        eyebrow="TODAY'S DEAL"
        title="오늘의 특가"
        description="오늘 입고된 원육 중 가장 좋은 가격으로 준비한 상품입니다. 재고 소진 시 조기 종료돼요."
      />
      {deals.length === 0 ? (
        <div className="empty">진행 중인 특가가 없습니다.</div>
      ) : (
        <div className="product-grid">
          {deals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
