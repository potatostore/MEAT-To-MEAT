// 브라우저 localStorage 에 저장되는 mock 백엔드. 회원/장바구니/주문/문의 흐름을
// 백엔드 없이 시연하기 위한 용도이며, 실제 서버에 붙이면(USE_MOCK=false) 쓰이지 않는다.
import { ApiError, getToken } from "../client";
import type {
  AddCartItemRequest,
  Address,
  AddressRequest,
  Cart,
  ChangePasswordRequest,
  CreateInquiryRequest,
  CreateOrderRequest,
  Inquiry,
  LoginRequest,
  LoginResponse,
  Member,
  Order,
  SignupRequest,
  UpdateMemberRequest,
} from "../types";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "../../policy";
import { findProduct, sleep } from "./products";

interface StoredMember extends Member {
  password: string;
}

interface StoredCartItem {
  id: number;
  productId: number;
  optionId: number | null;
  quantity: number;
}

interface Db {
  seq: number;
  members: StoredMember[];
  addresses: Record<number, Address[]>;
  carts: Record<number, StoredCartItem[]>;
  orders: Record<number, Order[]>;
  inquiries: Record<number, Inquiry[]>;
}

const DB_KEY = "m2m.mockDb";

function seedDb(): Db {
  return {
    seq: 1000,
    members: [
      {
        id: 1,
        email: "demo@meat.com",
        password: "demo1234",
        name: "고기러버",
        phone: "010-1234-5678",
        createdAt: new Date(Date.UTC(2026, 8, 1)).toISOString(),
      },
    ],
    addresses: {
      1: [
        {
          id: 1,
          label: "집",
          receiver: "고기러버",
          phone: "010-1234-5678",
          zipcode: "04524",
          address1: "서울특별시 중구 세종대로 110",
          address2: "101동 1001호",
          isDefault: true,
        },
      ],
    },
    carts: {},
    orders: {},
    inquiries: {},
  };
}

function load(): Db {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    // 손상된 데이터는 초기화
  }
  const db = seedDb();
  save(db);
  return db;
}

function save(db: Db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // 저장 실패 시 이번 세션 메모리에서만 유지
  }
}

function nextId(db: Db) {
  db.seq += 1;
  return db.seq;
}

function currentMemberId(db: Db): number {
  const token = getToken();
  const id = token?.startsWith("mock-") ? Number(token.slice(5)) : NaN;
  if (!db.members.some((m) => m.id === id)) throw new ApiError(401, "로그인이 필요합니다.");
  return id;
}

function publicMember(m: StoredMember): Member {
  return { id: m.id, email: m.email, name: m.name, phone: m.phone, createdAt: m.createdAt };
}

// ===== 인증 / 회원 =====
export async function signup(body: SignupRequest): Promise<Member> {
  await sleep();
  const db = load();
  if (db.members.some((m) => m.email === body.email)) {
    throw new ApiError(409, "이미 가입된 이메일입니다.");
  }
  const member: StoredMember = { ...body, id: nextId(db), createdAt: new Date().toISOString() };
  db.members.push(member);
  save(db);
  return publicMember(member);
}

export async function login(body: LoginRequest): Promise<LoginResponse> {
  await sleep();
  const db = load();
  const member = db.members.find((m) => m.email === body.email && m.password === body.password);
  if (!member) throw new ApiError(401, "이메일 또는 비밀번호가 올바르지 않습니다.");
  return { accessToken: `mock-${member.id}`, member: publicMember(member) };
}

export async function getMe(): Promise<Member> {
  await sleep(60);
  const db = load();
  const id = currentMemberId(db);
  return publicMember(db.members.find((m) => m.id === id)!);
}

export async function updateMe(body: UpdateMemberRequest): Promise<Member> {
  await sleep();
  const db = load();
  const member = db.members.find((m) => m.id === currentMemberId(db))!;
  Object.assign(member, body);
  save(db);
  return publicMember(member);
}

export async function changePassword(body: ChangePasswordRequest): Promise<void> {
  await sleep();
  const db = load();
  const member = db.members.find((m) => m.id === currentMemberId(db))!;
  if (member.password !== body.currentPassword) {
    throw new ApiError(400, "현재 비밀번호가 일치하지 않습니다.");
  }
  member.password = body.newPassword;
  save(db);
}

export async function withdraw(): Promise<void> {
  await sleep();
  const db = load();
  const id = currentMemberId(db);
  db.members = db.members.filter((m) => m.id !== id);
  save(db);
}

// ===== 배송지 =====
export async function getAddresses(): Promise<Address[]> {
  await sleep();
  const db = load();
  return db.addresses[currentMemberId(db)] ?? [];
}

function normalizeDefault(list: Address[], defaultId: number | null) {
  if (defaultId !== null) list.forEach((a) => (a.isDefault = a.id === defaultId));
  if (list.length && !list.some((a) => a.isDefault)) list[0].isDefault = true;
}

export async function createAddress(body: AddressRequest): Promise<Address> {
  await sleep();
  const db = load();
  const memberId = currentMemberId(db);
  const list = (db.addresses[memberId] ??= []);
  const address: Address = { ...body, id: nextId(db) };
  list.push(address);
  normalizeDefault(list, address.isDefault ? address.id : null);
  save(db);
  return address;
}

export async function updateAddress(id: number, body: AddressRequest): Promise<Address> {
  await sleep();
  const db = load();
  const list = db.addresses[currentMemberId(db)] ?? [];
  const address = list.find((a) => a.id === id);
  if (!address) throw new ApiError(404, "배송지를 찾을 수 없습니다.");
  Object.assign(address, body);
  normalizeDefault(list, address.isDefault ? address.id : null);
  save(db);
  return address;
}

export async function deleteAddress(id: number): Promise<void> {
  await sleep();
  const db = load();
  const memberId = currentMemberId(db);
  db.addresses[memberId] = (db.addresses[memberId] ?? []).filter((a) => a.id !== id);
  normalizeDefault(db.addresses[memberId], null);
  save(db);
}

// ===== 장바구니 =====
function buildCart(items: StoredCartItem[]): Cart {
  const cartItems = items.map((item) => {
    const product = findProduct(item.productId);
    const option = product.options.find((o) => o.id === item.optionId) ?? null;
    return {
      id: item.id,
      productId: product.id,
      productName: product.name,
      category: product.category,
      unit: product.unit,
      optionId: option?.id ?? null,
      optionName: option?.name ?? null,
      unitPrice: (product.salePrice ?? product.price) + (option?.extraPrice ?? 0),
      quantity: item.quantity,
      stock: product.stock,
    };
  });
  const totalPrice = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const shippingFee = totalPrice === 0 || totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return { items: cartItems, totalPrice, shippingFee, finalPrice: totalPrice + shippingFee };
}

export async function getCart(): Promise<Cart> {
  await sleep(60);
  const db = load();
  return buildCart(db.carts[currentMemberId(db)] ?? []);
}

export async function addCartItem(body: AddCartItemRequest): Promise<Cart> {
  await sleep();
  const db = load();
  const product = findProduct(body.productId);
  if (product.stock < body.quantity) throw new ApiError(400, "재고가 부족합니다.");
  const list = (db.carts[currentMemberId(db)] ??= []);
  const existing = list.find((i) => i.productId === body.productId && i.optionId === body.optionId);
  if (existing) existing.quantity = Math.min(product.stock, existing.quantity + body.quantity);
  else list.push({ id: nextId(db), ...body });
  save(db);
  return buildCart(list);
}

export async function updateCartItem(id: number, quantity: number): Promise<Cart> {
  await sleep(60);
  const db = load();
  const list = db.carts[currentMemberId(db)] ?? [];
  const item = list.find((i) => i.id === id);
  if (!item) throw new ApiError(404, "장바구니 상품을 찾을 수 없습니다.");
  if (findProduct(item.productId).stock < quantity) throw new ApiError(400, "재고가 부족합니다.");
  item.quantity = quantity;
  save(db);
  return buildCart(list);
}

export async function removeCartItem(id: number): Promise<Cart> {
  await sleep(60);
  const db = load();
  const memberId = currentMemberId(db);
  db.carts[memberId] = (db.carts[memberId] ?? []).filter((i) => i.id !== id);
  save(db);
  return buildCart(db.carts[memberId]);
}

export async function clearCart(): Promise<void> {
  await sleep(60);
  const db = load();
  db.carts[currentMemberId(db)] = [];
  save(db);
}

// ===== 주문 =====
// mock 에서는 주문 후 경과 시간에 따라 배송 상태가 자연스럽게 진행된다.
function withProgress(order: Order): Order {
  if (order.status === "CANCELLED") return order;
  const minutes = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
  const status = minutes > 30 ? "DELIVERED" : minutes > 10 ? "SHIPPING" : minutes > 3 ? "PREPARING" : "PAID";
  return {
    ...order,
    status,
    trackingNumber: status === "SHIPPING" || status === "DELIVERED" ? `5512${order.id}0042` : null,
  };
}

export async function createOrder(body: CreateOrderRequest): Promise<Order> {
  await sleep(300);
  const db = load();
  const memberId = currentMemberId(db);
  const cartItems = db.carts[memberId] ?? [];
  const selected = cartItems.filter((i) => body.cartItemIds.includes(i.id));
  if (!selected.length) throw new ApiError(400, "주문할 상품이 없습니다.");
  const cart = buildCart(selected);
  const id = nextId(db);
  const now = new Date();
  const order: Order = {
    id,
    orderNumber: `M2M${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${id}`,
    status: "PAID",
    items: cart.items.map((i) => ({
      id: nextId(db),
      productId: i.productId,
      productName: i.productName,
      optionName: i.optionName,
      unit: i.unit,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
    })),
    totalPrice: cart.totalPrice,
    shippingFee: cart.shippingFee,
    finalPrice: cart.finalPrice,
    shipping: body.shipping,
    memo: body.memo,
    paymentMethod: body.paymentMethod,
    trackingNumber: null,
    createdAt: now.toISOString(),
  };
  (db.orders[memberId] ??= []).unshift(order);
  db.carts[memberId] = cartItems.filter((i) => !body.cartItemIds.includes(i.id));
  save(db);
  return order;
}

export async function getOrders(): Promise<Order[]> {
  await sleep();
  const db = load();
  return (db.orders[currentMemberId(db)] ?? []).map(withProgress);
}

export async function getOrder(id: number): Promise<Order> {
  await sleep();
  const db = load();
  const order = (db.orders[currentMemberId(db)] ?? []).find((o) => o.id === id);
  if (!order) throw new ApiError(404, "주문을 찾을 수 없습니다.");
  return withProgress(order);
}

export async function cancelOrder(id: number): Promise<Order> {
  await sleep();
  const db = load();
  const order = (db.orders[currentMemberId(db)] ?? []).find((o) => o.id === id);
  if (!order) throw new ApiError(404, "주문을 찾을 수 없습니다.");
  if (withProgress(order).status !== "PAID") {
    throw new ApiError(400, "상품 준비가 시작된 주문은 취소할 수 없습니다.");
  }
  order.status = "CANCELLED";
  save(db);
  return order;
}

// ===== 1:1 문의 =====
export async function createInquiry(body: CreateInquiryRequest): Promise<Inquiry> {
  await sleep();
  const db = load();
  const inquiry: Inquiry = {
    id: nextId(db),
    type: body.type,
    title: body.title,
    content: body.content,
    status: "WAITING",
    answer: null,
    createdAt: new Date().toISOString(),
  };
  (db.inquiries[currentMemberId(db)] ??= []).unshift(inquiry);
  save(db);
  return inquiry;
}

export async function getMyInquiries(): Promise<Inquiry[]> {
  await sleep();
  const db = load();
  return db.inquiries[currentMemberId(db)] ?? [];
}
