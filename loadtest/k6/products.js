// 시나리오 1: 상품 둘러보기 (읽기 위주 트래픽)
//   - 카테고리별/정렬별 상품 목록, 상품 상세, 카테고리 목록을 무작위로 요청
//   - 튜닝 대상: product 조회 쿼리의 인덱스(product_category, create_at), 페이지 count 쿼리
import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL } from "./common.js";

export const options = {
  stages: [
    { duration: "30s", target: 30 }, // 30초 동안 가상 사용자 0 → 30명
    { duration: "1m", target: 30 },  // 1분 유지
    { duration: "20s", target: 0 },  // 종료
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],    // 실패율 1% 미만
    http_req_duration: ["p(95)<500"],  // 95% 요청이 500ms 안에
  },
};

const CATEGORIES = ["", "HANWOO", "PORK", "CHICKEN", "IMPORTED"];
const SORTS = ["newest", "price_asc", "price_desc", "name"];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

export default function () {
  const category = pick(CATEGORIES);
  const sort = pick(SORTS);
  const list = http.get(`${BASE_URL}/products?category=${category}&sort=${sort}&page=0&size=12`, {
    tags: { name: "GET /products" },
  });
  check(list, { "상품 목록 200": (r) => r.status === 200 });

  const ids = list.json("content.#.id") || [];
  if (ids.length > 0) {
    const detail = http.get(`${BASE_URL}/products/${pick(ids)}`, { tags: { name: "GET /products/{id}" } });
    check(detail, { "상품 상세 200": (r) => r.status === 200 });
  }

  http.get(`${BASE_URL}/categories`, { tags: { name: "GET /categories" } });
  sleep(1); // 사용자가 화면을 보는 시간
}
