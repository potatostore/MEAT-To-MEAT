import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ProductThumb } from "@/components/ProductThumb";
import { ApiError } from "@/lib/api/client";
import { getProduct, getProducts } from "@/lib/api/products";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/policy";
import { won } from "@/lib/format";
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
  return { title: product.name, description: product.summary };
}

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
        <ProductThumb name={product.name} category={product.category} grade={product.grade} imageUrl={product.imageUrl} size="lg" />
        <div className="detail-info">
          <div className="kind">
            {product.categoryName} · {product.storage}
          </div>
          <h1 className="display">{product.name}</h1>
          <p className="detail-summary">{product.summary}</p>
          <AddToCart product={product} />
          <dl className="spec">
            <dt>원산지</dt>
            <dd>{product.origin}</dd>
            {product.grade && (
              <>
                <dt>등급</dt>
                <dd>{product.grade}</dd>
              </>
            )}
            <dt>중량</dt>
            <dd>{product.unit}</dd>
            <dt>보관</dt>
            <dd>{product.storage} 보관</dd>
            <dt>배송</dt>
            <dd>새벽배송 · {won(FREE_SHIPPING_THRESHOLD)} 이상 무료</dd>
          </dl>
        </div>
      </div>

      <section className="detail-section">
        <h2 className="display">상품 설명</h2>
        <p>{product.description}</p>
      </section>

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
