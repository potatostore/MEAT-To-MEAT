// 브라우저는 같은 origin의 /api 로 요청하고, next.config.ts 의 rewrites 가
// `${API_BASE_URL}/:path*` 로 프록시한다. 서버 컴포넌트는 백엔드에 직접 요청한다.
export const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8080";
export const API_PROXY_PREFIX = "/api";

// 백엔드 없이 화면만 볼 때는 mock 데이터로 동작한다.
// 실제 서버에 붙일 때 .env.local 에 NEXT_PUBLIC_API_MOCK=false 를 지정한다.
export const USE_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

// 백엔드 엔드포인트 목록 (backend .../global/config/UrlNames.java 와 동일)
export const ENDPOINTS = {
  auth: {
    signup: "/auth/signup", // POST
    login: "/auth/login", // POST
    logout: "/auth/logout", // POST
  },
  members: {
    me: "/members/me", // GET, PATCH, DELETE
    password: "/members/me/password", // PATCH
  },
  categories: "/categories", // GET
  products: {
    list: "/products", // GET ?category&q&sort&page&size
    detail: (id: number) => `/products/${id}`, // GET
  },
  cart: {
    root: "/cart", // GET, DELETE(비우기)
    items: "/cart/items", // POST
    item: (id: number) => `/cart/items/${id}`, // PATCH, DELETE
  },
  orders: {
    root: "/orders", // GET(내 주문), POST(주문 생성)
    detail: (id: number) => `/orders/${id}`, // GET
    cancel: (id: number) => `/orders/${id}/cancel`, // POST
  },
} as const;
