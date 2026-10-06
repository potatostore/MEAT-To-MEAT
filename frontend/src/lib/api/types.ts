// 백엔드(Spring Boot)와 주고받는 데이터 형태. 백엔드 DTO 작성 시 이 파일을 기준으로 맞춘다.

export type CategoryCode = "HANWOO" | "PORK" | "CHICKEN" | "IMPORTED";

export interface Category {
  code: CategoryCode;
  name: string;
  description: string;
}

export interface ProductOption {
  id: number;
  name: string; // 예: "구이용 1.5cm", "500g"
  extraPrice: number;
}

export interface Product {
  id: number;
  name: string;
  category: CategoryCode;
  categoryName: string;
  summary: string;
  description: string;
  price: number; // 정가 (unit 기준)
  salePrice: number | null; // 특가 적용 시 판매가, 없으면 null
  unit: string; // 예: "300g"
  grade: string | null; // 예: "1++", 수입육 등은 null
  origin: string; // 원산지
  storage: "냉장" | "냉동";
  stock: number;
  imageUrl: string | null;
  options: ProductOption[];
  createdAt: string;
}

// Spring Data Page 응답을 단순화한 형태
export interface Page<T> {
  content: T[];
  page: number; // 0부터 시작
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

// ===== 회원 =====
export interface Member {
  id: number;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  member: Member;
}

export interface UpdateMemberRequest {
  name: string;
  phone: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Address {
  id: number;
  label: string; // 예: "집", "회사"
  receiver: string;
  phone: string;
  zipcode: string;
  address1: string;
  address2: string;
  isDefault: boolean;
}

export type AddressRequest = Omit<Address, "id">;

// ===== 장바구니 =====
export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  category: CategoryCode;
  unit: string;
  optionId: number | null;
  optionName: string | null;
  unitPrice: number; // 옵션 추가금 포함 1개 가격
  quantity: number;
  stock: number;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
  shippingFee: number;
  finalPrice: number;
}

export interface AddCartItemRequest {
  productId: number;
  optionId: number | null;
  quantity: number;
}

// ===== 주문 =====
export type OrderStatus =
  | "PAID"
  | "PREPARING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "CARD" | "BANK_TRANSFER" | "KAKAO_PAY";

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  optionName: string | null;
  unit: string;
  unitPrice: number;
  quantity: number;
}

export interface Receiver {
  receiver: string;
  phone: string;
  zipcode: string;
  address1: string;
  address2: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  totalPrice: number;
  shippingFee: number;
  finalPrice: number;
  shipping: Receiver;
  memo: string;
  paymentMethod: PaymentMethod;
  trackingNumber: string | null;
  createdAt: string;
}

export interface CreateOrderRequest {
  cartItemIds: number[];
  shipping: Receiver;
  memo: string;
  paymentMethod: PaymentMethod;
}

// ===== 고객센터 =====
export interface Faq {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export type InquiryStatus = "WAITING" | "ANSWERED";

export interface Inquiry {
  id: number;
  type: string;
  title: string;
  content: string;
  status: InquiryStatus;
  answer: string | null;
  createdAt: string;
}

export interface CreateInquiryRequest {
  type: string;
  title: string;
  content: string;
  orderId: number | null;
}
