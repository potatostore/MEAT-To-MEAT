// 브라우저 localStorage 에 저장되는 mock 백엔드. 백엔드 없이 회원/장바구니/주문 흐름을
// 시연하기 위한 용도이며, 실제 서버에 붙이면(USE_MOCK=false) 쓰이지 않는다.
// 규칙은 백엔드 서비스(UserService, CartService, OrderService)와 같게 맞춘다.
import { ApiError, getToken } from "../client";
import type {
  AddCartItemRequest,
  Cart,
  ChangePasswordRequest,
  CreateOrderRequest,
  LoginRequest,
  LoginResponse,
  Member,
  Order,
  SignupRequest,
  UpdateMemberRequest,
} from "../types";
import { findProduct, sleep } from "./products";

interface StoredMember extends Member {
  password: string;
}

interface StoredCartItem {
  id: number;
  productId: number;
  quantity: number;
}

interface Db {
  seq: number;
  members: StoredMember[];
  carts: Record<number, StoredCartItem[]>;
  orders: Record<number, Order[]>;
}

const DB_KEY = "m2m.mockDb.v2";

// V2__insert_mock_data.sql 의 데모 계정과 동일 (비밀번호 test1234)
function seedDb(): Db {
  return {
    seq: 1000,
    members: [
      {
        id: 1,
        loginId: "meatlover",
        password: "test1234",
        name: "김고기",
        email: "meatlover@example.com",
        phone: "010-1111-0001",
        sex: "M",
        birthday: "1999-03-14",
        createdAt: "2026-09-01T10:00:00",
      },
    ],
    carts: { 1: [] },
    orders: {},
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
  return {
    id: m.id,
    loginId: m.loginId,
    name: m.name,
    email: m.email,
    phone: m.phone,
    sex: m.sex,
    birthday: m.birthday,
    createdAt: m.createdAt,
  };
}

function findMember(db: Db): StoredMember {
  const id = currentMemberId(db);
  return db.members.find((m) => m.id === id)!;
}

// ===== 인증 / 회원 =====
export async function signup(body: SignupRequest): Promise<Member> {
  await sleep();
  const db = load();
  if (db.members.some((m) => m.loginId === body.loginId)) throw new ApiError(409, "이미 사용 중인 아이디입니다.");
  if (db.members.some((m) => m.email === body.email)) throw new ApiError(409, "이미 사용 중인 이메일입니다.");
  if (db.members.some((m) => m.phone === body.phone)) throw new ApiError(409, "이미 사용 중인 전화번호입니다.");
  const member: StoredMember = { ...body, id: nextId(db), createdAt: new Date().toISOString() };
  db.members.push(member);
  db.carts[member.id] = []; // CART-01: 회원가입 시 장바구니 생성
  save(db);
  return publicMember(member);
}

export async function login(body: LoginRequest): Promise<LoginResponse> {
  await sleep();
  const db = load();
  const member = db.members.find((m) => m.loginId === body.loginId && m.password === body.password);
  if (!member) throw new ApiError(401, "아이디 또는 비밀번호가 올바르지 않습니다.");
  return { accessToken: `mock-${member.id}`, member: publicMember(member) };
}

export async function getMe(): Promise<Member> {
  await sleep(60);
  return publicMember(findMember(load()));
}

export async function updateMe(body: UpdateMemberRequest): Promise<Member> {
  await sleep();
  const db = load();
  const member = findMember(db);
  Object.assign(member, body);
  save(db);
  return publicMember(member);
}

export async function changePassword(body: ChangePasswordRequest): Promise<void> {
  await sleep();
  const db = load();
  const member = findMember(db);
  if (member.password !== body.currentPassword) throw new ApiError(400, "현재 비밀번호가 일치하지 않습니다.");
  member.password = body.newPassword;
  save(db);
}

export async function withdraw(): Promise<void> {
  await sleep();
  const db = load();
  const id = currentMemberId(db);
  db.members = db.members.filter((m) => m.id !== id);
  delete db.carts[id];
  delete db.orders[id];
  save(db);
}

// ===== 장바구니 =====
function buildCart(items: StoredCartItem[]): Cart {
  const cartItems = items.map((item) => {
    const product = findProduct(item.productId);
    return {
      id: item.id,
      productId: product.id,
      productName: product.name,
      category: product.category,
      unitPrice: product.price,
      quantity: item.quantity,
      stock: product.stock,
    };
  });
  return { items: cartItems, totalPrice: cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) };
}

function cartOf(db: Db): StoredCartItem[] {
  return (db.carts[currentMemberId(db)] ??= []);
}

function checkStock(productId: number, quantity: number) {
  if (findProduct(productId).stock < quantity) throw new ApiError(400, "상품의 재고가 부족합니다.");
}

export async function getCart(): Promise<Cart> {
  await sleep(60);
  return buildCart(cartOf(load()));
}

export async function addCartItem(body: AddCartItemRequest): Promise<Cart> {
  await sleep();
  const db = load();
  const list = cartOf(db);
  const existing = list.find((i) => i.productId === body.productId);
  checkStock(body.productId, (existing?.quantity ?? 0) + body.quantity);
  if (existing) existing.quantity += body.quantity;
  else list.push({ id: nextId(db), productId: body.productId, quantity: body.quantity });
  save(db);
  return buildCart(list);
}

export async function updateCartItem(id: number, quantity: number): Promise<Cart> {
  await sleep(60);
  const db = load();
  const list = cartOf(db);
  const item = list.find((i) => i.id === id);
  if (!item) throw new ApiError(404, "장바구니에 해당 상품이 존재하지 않습니다.");
  checkStock(item.productId, quantity);
  item.quantity = quantity;
  save(db);
  return buildCart(list);
}

export async function removeCartItem(id: number): Promise<Cart> {
  await sleep(60);
  const db = load();
  const memberId = currentMemberId(db);
  db.carts[memberId] = cartOf(db).filter((i) => i.id !== id);
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
export async function createOrder(body: CreateOrderRequest): Promise<Order> {
  await sleep(300);
  const db = load();
  const memberId = currentMemberId(db);
  const cartItems = cartOf(db);
  const selected = cartItems.filter((i) => body.cartItemIds.includes(i.id));
  if (!selected.length) throw new ApiError(400, "주문할 상품이 없습니다.");
  selected.forEach((i) => checkStock(i.productId, i.quantity));

  const items = selected.map((i) => {
    const product = findProduct(i.productId);
    return { id: nextId(db), productId: product.id, productName: product.name, unitPrice: product.price, quantity: i.quantity };
  });
  const order: Order = {
    id: nextId(db),
    status: "ORDER_RECEIVED",
    items,
    totalPrice: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    createdAt: new Date().toISOString(),
  };
  (db.orders[memberId] ??= []).unshift(order);
  db.carts[memberId] = cartItems.filter((i) => !body.cartItemIds.includes(i.id));
  save(db);
  return order;
}

export async function getOrders(): Promise<Order[]> {
  await sleep();
  const db = load();
  return db.orders[currentMemberId(db)] ?? [];
}

function findOrder(db: Db, id: number): Order {
  const order = (db.orders[currentMemberId(db)] ?? []).find((o) => o.id === id);
  if (!order) throw new ApiError(404, "존재하지 않는 주문입니다.");
  return order;
}

export async function getOrder(id: number): Promise<Order> {
  await sleep();
  return findOrder(load(), id);
}

export async function cancelOrder(id: number): Promise<Order> {
  await sleep();
  const db = load();
  const order = findOrder(db, id);
  if (order.status !== "ORDER_RECEIVED") throw new ApiError(400, "상품 준비가 시작된 주문은 취소할 수 없습니다.");
  order.status = "ORDER_CANCELED";
  save(db);
  return order;
}
