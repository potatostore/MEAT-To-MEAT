import { request } from "./client";
import { ENDPOINTS, USE_MOCK } from "./config";
import * as mock from "./mock/store";
import type { AddCartItemRequest, Cart } from "./types";

export async function getCart(): Promise<Cart> {
  if (USE_MOCK) return mock.getCart();
  return request<Cart>(ENDPOINTS.cart.root);
}

export async function addCartItem(body: AddCartItemRequest): Promise<Cart> {
  if (USE_MOCK) return mock.addCartItem(body);
  return request<Cart>(ENDPOINTS.cart.items, { method: "POST", body });
}

export async function updateCartItem(id: number, quantity: number): Promise<Cart> {
  if (USE_MOCK) return mock.updateCartItem(id, quantity);
  return request<Cart>(ENDPOINTS.cart.item(id), { method: "PATCH", body: { quantity } });
}

export async function removeCartItem(id: number): Promise<Cart> {
  if (USE_MOCK) return mock.removeCartItem(id);
  return request<Cart>(ENDPOINTS.cart.item(id), { method: "DELETE" });
}

export async function clearCart(): Promise<void> {
  if (USE_MOCK) return mock.clearCart();
  return request<void>(ENDPOINTS.cart.root, { method: "DELETE" });
}
