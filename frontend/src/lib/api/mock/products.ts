// 서버/클라이언트 양쪽에서 쓰는 상품 mock. 상태가 없으므로 서버 컴포넌트에서도 안전하다.
import { ApiError } from "../client";
import type { Page, Product, ProductQuery } from "../types";
import { products } from "./data";

export function sleep(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function findProduct(id: number): Product {
  const product = products.find((p) => p.id === id);
  if (!product) throw new ApiError(404, "존재하지 않는 상품입니다.");
  return product;
}

// 백엔드 ProductRepository.search 와 같은 규칙: 카테고리 일치 + 상품명 부분 일치
export async function getProducts(query: ProductQuery): Promise<Page<Product>> {
  await sleep();
  const { category, q, sort = "newest", page = 0, size = 12 } = query;
  let list = products.filter((p) => !category || p.category === category);
  if (q) list = list.filter((p) => p.name.includes(q.trim()));
  list = [...list].sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return a.price - b.price || a.id - b.id;
      case "price_desc":
        return b.price - a.price || b.id - a.id;
      case "name":
        return a.name.localeCompare(b.name, "ko");
      default:
        return b.createdAt.localeCompare(a.createdAt) || b.id - a.id;
    }
  });
  return {
    content: list.slice(page * size, page * size + size),
    page,
    size,
    totalElements: list.length,
    totalPages: Math.max(1, Math.ceil(list.length / size)),
  };
}

export async function getProduct(id: number): Promise<Product> {
  await sleep();
  return findProduct(id);
}
