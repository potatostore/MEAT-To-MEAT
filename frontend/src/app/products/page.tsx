import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { toQueryString } from "@/lib/api/client";
import { getCategories, getProducts } from "@/lib/api/products";
import type { CategoryCode, ProductQuery, ProductSort } from "@/lib/api/types";

export const metadata: Metadata = { title: "전체 상품" };

const SORTS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "최신순" },
  { value: "price_asc", label: "낮은 가격순" },
  { value: "price_desc", label: "높은 가격순" },
  { value: "name", label: "이름순" },
];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage(props: PageProps<"/products">) {
  const params = await props.searchParams;
  const query: ProductQuery = {
    category: (first(params.category) as CategoryCode) || undefined,
    q: first(params.q) || undefined,
    sort: (first(params.sort) as ProductSort) || "newest",
    page: Math.max(0, Number(first(params.page) ?? 0) || 0),
    size: 12,
  };

  const [categories, result] = await Promise.all([getCategories(), getProducts(query)]);
  const current = categories.find((c) => c.code === query.category);
  const href = (patch: Partial<ProductQuery>) =>
    `/products${toQueryString({ category: query.category, q: query.q, sort: query.sort, ...patch })}`;

  return (
    <div className="section">
      <PageHeader
        eyebrow="SHOP"
        title={current ? current.name : "전체 상품"}
        description={current ? current.description : "산지 직송 정육을 부위별로 골라 담으세요."}
      />

      <div className="filter-bar">
        <div className="chips">
          <Link href={href({ category: undefined, page: 0 })} className={`chip${!query.category ? " on" : ""}`}>
            전체
          </Link>
          {categories.map((c) => (
            <Link
              key={c.code}
              href={href({ category: c.code, page: 0 })}
              className={`chip${query.category === c.code ? " on" : ""}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
        <form action="/products" className="search">
          {query.category && <input type="hidden" name="category" value={query.category} />}
          <input name="q" defaultValue={query.q} placeholder="상품명 검색" aria-label="상품명 검색" />
          <button type="submit">검색</button>
        </form>
      </div>

      <div className="list-meta">
        <span>
          총 <b>{result.totalElements}</b>개 상품
          {query.q && <> · &lsquo;{query.q}&rsquo; 검색 결과</>}
        </span>
        <div className="sorts">
          {SORTS.map((s) => (
            <Link key={s.value} href={href({ sort: s.value, page: 0 })} className={query.sort === s.value ? "on" : undefined}>
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {result.content.length === 0 ? (
        <div className="empty">조건에 맞는 상품이 없습니다.</div>
      ) : (
        <div className="product-grid">
          {result.content.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {result.totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: result.totalPages }, (_, i) => (
            <Link key={i} href={href({ page: i })} className={i === result.page ? "on" : undefined}>
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
