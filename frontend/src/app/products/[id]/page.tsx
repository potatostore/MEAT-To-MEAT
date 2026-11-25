import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ProductThumb } from "@/components/ProductThumb";
import { ApiError } from "@/lib/api/client";
import { getProduct, getProducts } from "@/lib/api/products";
import { formatDate } from "@/lib/format";
import { AddToCart } from "./AddToCart";

async function loadProduct(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();
  try {
    return await getProduct(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata(props: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const product = await loadProduct(id);
  return { title: product.name, description: product.description };
}

// PROD-03 상품 불러오기 / PROD-07 상품 상세 정보
export default async function ProductDetailPage(props: PageProps<"/products/[id]">) {
  const { id } = await props.params;
  const product = await loadProduct(id);
  const related = (await getProducts({ category: product.category, size: 5 })).content
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="section">
      <div className="breadcrumb">
        <Link href="/products">전체 상품</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category}`}>{product.categoryName}</Link>
        <span>/</span>
        <b>{product.name}</b>
      </div>

      <div className="detail">
        <ProductThumb name={product.name} category={product.category} size="lg" />
        <div className="detail-info">
          <div className="kind">{product.categoryName}</div>
          <h1 className="display">{product.name}</h1>
          <p className="detail-summary">{product.description}</p>
          <AddToCart product={product} />
          <dl className="spec">
            <dt>카테고리</dt>
            <dd>{product.categoryName}</dd>
            <dt>재고</dt>
            <dd>{product.stock > 0 ? `${product.stock}개` : "일시 품절"}</dd>
            <dt>등록일</dt>
            <dd>{formatDate(product.createdAt)}</dd>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="detail-section">
          <h2 className="display">같은 카테고리 상품</h2>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
