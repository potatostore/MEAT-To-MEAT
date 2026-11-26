// 전체 API 부하 시나리오 (성능 튜닝 전후 비교용)
//   여러 유형의 사용자가 3분 동안 동시에 접속하는 상황을 만든다. 모든 API 가 최소 한 번 이상 호출된다.
//   데이터 전제: loadtest/reset-db.sh 로 초기화한 DB (bench0001~bench2000 회원, 상품 30,020개, 주문 10만 건)
//
//   실행: docker compose --profile loadtest run --rm k6 run /scripts/all-apis.js
//   예열: docker compose --profile loadtest run --rm k6 run -e WARMUP=1 /scripts/all-apis.js  (30초, 측정 전 JIT·커넥션 예열)
import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, JSON_HEADERS, authHeaders } from "./common.js";

const WARMUP = __ENV.WARMUP === "1";
const DURATION = WARMUP ? "30s" : "3m";
const HOT_PRODUCT_ID = 21; // 인기 상품: 여러 명이 동시에 주문하는 상품 (재고 100,000)
const FIRST_BENCH_PRODUCT = 21;
const BENCH_PRODUCTS = 30000;

const scenario = (exec, vus) => ({ executor: "constant-vus", exec, vus: WARMUP ? Math.max(1, Math.ceil(vus / 4)) : vus, duration: DURATION });

export const options = {
  scenarios: {
    browse: scenario("browse", 20),     // 비로그인 둘러보기
    shopper: scenario("shopper", 15),   // 로그인 회원 쇼핑
    hot_order: scenario("hotOrder", 8), // 같은 상품 동시 주문
    account: scenario("account", 2),    // 가입 → 탈퇴 전체 흐름
    admin: scenario("admin", 1),        // 상품 관리
  },
  summaryTrendStats: ["avg", "med", "p(95)", "p(99)", "max"],
};

const CATEGORIES = ["", "HANWOO", "PORK", "CHICKEN", "IMPORTED"];
const SORTS = ["newest", "price_asc", "price_desc", "name"];
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const randomProduct = () => FIRST_BENCH_PRODUCT + Math.floor(Math.random() * BENCH_PRODUCTS);
const pad = (n, len) => String(n).padStart(len, "0");
const runId = Date.now().toString(36);

function post(path, body, params, name) {
  return http.post(`${BASE_URL}${path}`, body === null ? null : JSON.stringify(body), { ...params, tags: { name } });
}
function get(path, params, name) {
  return http.get(`${BASE_URL}${path}`, { ...params, tags: { name } });
}
function patch(path, body, params, name) {
  return http.patch(`${BASE_URL}${path}`, JSON.stringify(body), { ...params, tags: { name } });
}
function del(path, params, name) {
  return http.del(`${BASE_URL}${path}`, null, { ...params, tags: { name } });
}
function loginAs(loginId) {
  const res = post("/auth/login", { loginId, password: "test1234" }, { headers: JSON_HEADERS }, "POST /auth/login");
  check(res, { "로그인 200": (r) => r.status === 200 });
  return res.status === 200 ? authHeaders(res.json("accessToken")) : null;
}

// VU 마다 한 번만 로그인해서 토큰을 재사용한다 (VU 별 전역 변수)
let session = null;

// ---------------- 1) 비로그인 둘러보기 ----------------
export function browse() {
  get("/categories", {}, "GET /categories");
  const q = Math.random() < 0.2 ? `&q=${encodeURIComponent(pad(Math.floor(Math.random() * 300), 3))}` : "";
  const page = Math.floor(Math.random() * 5);
  const list = get(`/products?category=${pick(CATEGORIES)}&sort=${pick(SORTS)}&page=${page}&size=12${q}`, {}, "GET /products");
  check(list, { "상품 목록 200": (r) => r.status === 200 });
  const ids = list.json("content.#.id") || [];
  const detail = get(`/products/${ids.length ? pick(ids) : randomProduct()}`, {}, "GET /products/{id}");
  check(detail, { "상품 상세 200": (r) => r.status === 200 });
  sleep(1);
}

// ---------------- 2) 로그인 회원 쇼핑 ----------------
export function shopper() {
  if (!session) session = loginAs(`bench${pad(__VU, 4)}`);
  if (!session) return sleep(1);

  get("/members/me", session, "GET /members/me");
  get("/cart", session, "GET /cart");

  const added = post("/cart/items", { productId: randomProduct(), quantity: 1 }, session, "POST /cart/items");
  check(added, { "장바구니 담기 200": (r) => r.status === 200 });
  const items = added.json("items") || [];
  const item = items[items.length - 1];
  if (item) patch(`/cart/items/${item.id}`, { quantity: 2 }, session, "PATCH /cart/items/{id}");

  const orders = get("/orders", session, "GET /orders");
  check(orders, { "주문 목록 200": (r) => r.status === 200 });
  const orderIds = orders.json("#.id") || [];
  if (orderIds.length) get(`/orders/${orderIds[Math.floor(Math.random() * Math.min(orderIds.length, 10))]}`, session, "GET /orders/{id}");

  if (item) {
    const order = post("/orders", { cartItemIds: [item.id] }, session, "POST /orders");
    check(order, { "주문 200": (r) => r.status === 200 });
    if (order.status === 200) post(`/orders/${order.json("id")}/cancel`, null, session, "POST /orders/{id}/cancel");
  }
  sleep(1);
}

// ---------------- 3) 인기 상품 동시 주문 ----------------
export function hotOrder() {
  if (!session) session = loginAs(`bench${pad(1000 + __VU, 4)}`);
  if (!session) return sleep(1);

  const added = post("/cart/items", { productId: HOT_PRODUCT_ID, quantity: 1 }, session, "POST /cart/items");
  const hot = (added.json("items") || []).find((i) => i.productId === HOT_PRODUCT_ID);
  if (hot) {
    const order = post("/orders", { cartItemIds: [hot.id] }, session, "POST /orders");
    check(order, { "인기 상품 주문 200": (r) => r.status === 200 });
    // 실패했다면 장바구니에 남은 항목을 지워 다음 반복이 같은 조건에서 시작하게 한다
    if (order.status !== 200) del(`/cart/items/${hot.id}`, session, "DELETE /cart/items/{id}");
  }
  sleep(0.5);
}

// ---------------- 4) 가입 → 탈퇴 전체 흐름 ----------------
export function account() {
  const id = `acc${runId}${__VU}${pad(__ITER, 4)}`.slice(0, 30);
  const signup = post("/auth/signup", {
    loginId: id, password: "test1234", name: "흐름테스트", email: `${id}@example.com`,
    phone: `010-8${runId.slice(-3)}${__VU}-${pad(__ITER, 4)}`, sex: "NONE", birthday: "2000-01-01",
  }, { headers: JSON_HEADERS }, "POST /auth/signup");
  check(signup, { "회원가입 200": (r) => r.status === 200 });
  const s = loginAs(id);
  if (!s) return sleep(1);

  patch("/members/me", { name: "흐름테스트수정", email: `${id}@example.com`, phone: `010-8${runId.slice(-3)}${__VU}-${pad(__ITER, 4)}` }, s, "PATCH /members/me");
  patch("/members/me/password", { currentPassword: "test1234", newPassword: "test12345" }, s, "PATCH /members/me/password");

  const a = post("/cart/items", { productId: randomProduct(), quantity: 1 }, s, "POST /cart/items");
  const first = (a.json("items") || [])[0];
  if (first) del(`/cart/items/${first.id}`, s, "DELETE /cart/items/{id}");
  post("/cart/items", { productId: randomProduct(), quantity: 1 }, s, "POST /cart/items");
  del("/cart", s, "DELETE /cart");

  const b = post("/cart/items", { productId: randomProduct(), quantity: 1 }, s, "POST /cart/items");
  const toOrder = (b.json("items") || [])[0];
  if (toOrder) {
    const order = post("/orders", { cartItemIds: [toOrder.id] }, s, "POST /orders");
    if (order.status === 200) {
      patch(`/orders/${order.json("id")}`, { status: "DELIVERED" }, s, "PATCH /orders/{id}");
      del(`/orders/${order.json("id")}`, s, "DELETE /orders/{id}");
    }
  }
  post("/auth/logout", null, s, "POST /auth/logout");
  const bye = del("/members/me", s, "DELETE /members/me");
  check(bye, { "탈퇴 204": (r) => r.status === 204 });
  sleep(1);
}

// ---------------- 5) 관리자 상품 관리 ----------------
export function admin() {
  if (!session) session = loginAs("meatlover");
  if (!session) return sleep(1);
  const name = `관리자등록 ${runId}-${__ITER}`;
  const created = post("/products", { name, price: 12900, category: "PORK", stock: 50, description: "관리자 등록 테스트" }, session, "POST /products");
  check(created, { "상품 생성 200": (r) => r.status === 200 });
  if (created.status === 200) {
    const id = created.json("id");
    patch(`/products/${id}`, { name: `${name} 수정`, price: 13900, category: "PORK", stock: 40, description: "수정됨" }, session, "PATCH /products/{id}");
    const removed = del(`/products/${id}`, session, "DELETE /products/{id}");
    check(removed, { "상품 삭제 204": (r) => r.status === 204 });
  }
  sleep(2);
}
