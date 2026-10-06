import { request } from "./client";
import { ENDPOINTS, USE_MOCK } from "./config";
import { categories } from "./mock/data";
import * as mock from "./mock/products";
import type { Category, Page, Product, ProductQuery } from "./types";

export async function getCategories(): Promise<Category[]> {
  if (USE_MOCK) return categories;
  return request<Category[]>(ENDPOINTS.categories);
}

export async function getProducts(query: ProductQuery = {}): Promise<Page<Product>> {
  if (USE_MOCK) return mock.getProducts(query);
  return request<Page<Product>>(ENDPOINTS.products.list, { query: { ...query } });
}

export async function getDeals(): Promise<Product[]> {
  if (USE_MOCK) return mock.getDeals();
  return request<Product[]>(ENDPOINTS.products.deals);
}

export async function getProduct(id: number): Promise<Product> {
  if (USE_MOCK) return mock.getProduct(id);
  return request<Product>(ENDPOINTS.products.detail(id));
}
