import { request } from "./client";
import { ENDPOINTS, USE_MOCK } from "./config";
import * as mock from "./mock/store";
import type { CreateOrderRequest, Order } from "./types";

export async function createOrder(body: CreateOrderRequest): Promise<Order> {
  if (USE_MOCK) return mock.createOrder(body);
  return request<Order>(ENDPOINTS.orders.root, { method: "POST", body });
}

export async function getOrders(): Promise<Order[]> {
  if (USE_MOCK) return mock.getOrders();
  return request<Order[]>(ENDPOINTS.orders.root);
}

export async function getOrder(id: number): Promise<Order> {
  if (USE_MOCK) return mock.getOrder(id);
  return request<Order>(ENDPOINTS.orders.detail(id));
}

export async function cancelOrder(id: number): Promise<Order> {
  if (USE_MOCK) return mock.cancelOrder(id);
  return request<Order>(ENDPOINTS.orders.cancel(id), { method: "POST" });
}
