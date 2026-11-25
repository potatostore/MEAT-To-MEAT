// 시나리오 2: 로그인한 회원의 주문 목록 / 주문 상세 조회
//   - 튜닝 대상: 주문 목록의 N+1 (주문 1번 + 주문마다 order_item, product 조회)
//   - Grafana 의 "요청 1건당 SQL 수" 패널과 함께 본다
import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, SEED_USERS, authHeaders, login } from "./common.js";

export const options = {
  stages: [
    { duration: "20s", target: 20 },
    { duration: "1m", target: 20 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

// 테스트 시작 전에 한 번만 실행: 목데이터 회원으로 로그인해 토큰을 받아 둔다
export function setup() {
  return { tokens: SEED_USERS.map((id) => login(id)) };
}

export default function (data) {
  const token = data.tokens[__VU % data.tokens.length];
  const params = authHeaders(token);

  const list = http.get(`${BASE_URL}/orders`, { ...params, tags: { name: "GET /orders" } });
  check(list, { "주문 목록 200": (r) => r.status === 200 });

  const ids = list.json("#.id") || [];
  if (ids.length > 0) {
    const detail = http.get(`${BASE_URL}/orders/${ids[0]}`, { ...params, tags: { name: "GET /orders/{id}" } });
    check(detail, { "주문 상세 200": (r) => r.status === 200 });
  }
  sleep(1);
}
