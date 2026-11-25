// 시나리오 3: 같은 상품을 여러 명이 "동시에" 주문할 때 재고가 정확히 줄어드는가 (동시성 검증)
//   1) setup: 테스트용 회원 N명을 만들고, 각자 장바구니에 같은 상품을 1개씩 담는다
//   2) 본 테스트: N명이 거의 동시에 주문(POST /orders)
//   3) teardown: "성공한 주문 수"와 "실제로 줄어든 재고"를 비교한다
//      둘이 다르면 Lost Update(갱신 손실)가 일어난 것 → 락/조건부 UPDATE 로 해결해야 할 문제
//
//   주의: 실행할 때마다 테스트 회원이 생기고 재고가 줄어든다. 초기화는 monitoring/README.md 참고.
//   옵션: -e PRODUCT_ID=2 -e USERS=30
import http from "k6/http";
import { check } from "k6";
import { Counter } from "k6/metrics";
import { BASE_URL, JSON_HEADERS, authHeaders, login } from "./common.js";

const PRODUCT_ID = Number(__ENV.PRODUCT_ID || 2);
const USERS = Number(__ENV.USERS || 30);

const orderSuccess = new Counter("order_success");
const orderFailed = new Counter("order_failed");

export const options = {
  setupTimeout: "2m",
  scenarios: {
    race: {
      executor: "per-vu-iterations", // 가상 사용자 USERS 명이 각자 1번씩, 동시에 실행
      vus: USERS,
      iterations: 1,
      maxDuration: "1m",
    },
  },
};

function getStock() {
  return http.get(`${BASE_URL}/products/${PRODUCT_ID}`).json("stock");
}

export function setup() {
  const runId = Date.now().toString(36);
  const tokens = [];
  for (let i = 0; i < USERS; i++) {
    const loginId = `race_${runId}_${i}`;
    const signup = http.post(
      `${BASE_URL}/auth/signup`,
      JSON.stringify({
        loginId,
        password: "test1234",
        name: `동시성테스트${i}`,
        email: `${loginId}@example.com`,
        phone: `010-9${runId.slice(-3)}-${String(i).padStart(4, "0")}`,
        sex: "NONE",
        birthday: "2000-01-01",
      }),
      { headers: JSON_HEADERS },
    );
    check(signup, { "테스트 회원 가입 200": (r) => r.status === 200 });
    const token = login(loginId);
    const added = http.post(`${BASE_URL}/cart/items`, JSON.stringify({ productId: PRODUCT_ID, quantity: 1 }), authHeaders(token));
    check(added, { "장바구니 담기 200": (r) => r.status === 200 });
    tokens.push({ token, cartItemId: added.json(`items.#(productId==${PRODUCT_ID}).id`) });
  }
  const stockBefore = getStock();
  console.log(`[setup] 상품 ${PRODUCT_ID} 재고 ${stockBefore}개, 동시 주문자 ${USERS}명`);
  return { tokens, stockBefore };
}

export default function (data) {
  const me = data.tokens[__VU - 1];
  const res = http.post(`${BASE_URL}/orders`, JSON.stringify({ cartItemIds: [me.cartItemId] }), {
    ...authHeaders(me.token),
    tags: { name: "POST /orders" },
  });
  if (res.status === 200) orderSuccess.add(1);
  else orderFailed.add(1);
}

export function teardown(data) {
  // 각 테스트 회원의 주문 내역에서 "이 상품을 주문하는 데 성공한 수"를 센다
  let succeeded = 0;
  for (const me of data.tokens) {
    const orders = http.get(`${BASE_URL}/orders`, authHeaders(me.token)).json() || [];
    succeeded += orders.filter((o) => o.items.some((i) => i.productId === PRODUCT_ID)).length;
  }
  const stockAfter = getStock();
  const decreased = data.stockBefore - stockAfter;
  console.log(`[result] 주문 성공 ${succeeded}건 / 실제 재고 감소 ${decreased}개 (재고 ${data.stockBefore} → ${stockAfter})`);
  if (succeeded !== decreased) {
    console.log(`[result] ⚠ 재고 불일치: ${succeeded - decreased}건이 재고 차감 없이 팔림 (Lost Update)`);
  } else {
    console.log("[result] 재고 정합성 OK");
  }
  check(null, { "성공한 주문 수 == 재고 감소량": () => succeeded === decreased });
}
