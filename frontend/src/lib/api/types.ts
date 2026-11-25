// 백엔드(Spring Boot) DTO 와 1:1 로 맞춘 타입. 테이블 구조는 명세서 5장(V1__init_schema.sql)을 따른다.

export type CategoryCode = "HANWOO" | "PORK" | "CHICKEN" | "IMPORTED";

export interface Category {
  code: CategoryCode;
  name: string;
  description: string;
}

// product 테이블
export interface Product {
  id: number;
  name: string;
  category: CategoryCode;
  categoryName: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
}

// Spring Data Page 를 단순화한 형태 (page 는 0부터)
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type ProductSort = "newest" | "price_asc" | "price_desc" | "name";

export interface ProductQuery {
  category?: CategoryCode;
  q?: string;
  sort?: ProductSort;
  page?: number;
  size?: number;
}

// ===== 회원 (users 테이블) =====
export type Sex = "M" | "F" | "NONE";

export interface Member {
  id: number;
  loginId: string;
  name: string;
  email: string;
  phone: string;
  sex: Sex;
  birthday: string; // YYYY-MM-DD
  createdAt: string;
}

export interface SignupRequest {
  loginId: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  sex: Sex;
  birthday: string;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  member: Member;
}

export interface UpdateMemberRequest {
  name: string;
  email: string;
  phone: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ===== 장바구니 (cart, cart_item 테이블) =====
export interface CartItem {
  id: number; // cart_item_id
  productId: number;
  productName: string;
  category: CategoryCode;
  unitPrice: number; // 현재 상품 가격
  quantity: number;
  stock: number;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
}

export interface AddCartItemRequest {
  productId: number;
  quantity: number;
}

// ===== 주문 (orders, order_item 테이블) =====
export type OrderStatus =
  | "ORDER_RECEIVED"
  | "PREPARING_DELIVERY"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "ORDER_CANCELED";

export interface OrderItem {
  id: number; // order_item_id
  productId: number;
  productName: string;
  unitPrice: number; // order_price: 주문 당시 단가 스냅샷
  quantity: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  items: OrderItem[];
  totalPrice: number; // total_order_price
  createdAt: string;
}

export interface CreateOrderRequest {
  cartItemIds: number[];
}

// ===== 고객센터 (DB 범위 밖: 프론트 정적 데이터) =====
export interface Faq {
  id: number;
  category: string;
  question: string;
  answer: string;
}
