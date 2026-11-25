// 여러 시나리오가 함께 쓰는 설정과 헬퍼
import http from "k6/http";
import { check } from "k6";

// docker compose 로 실행하면 BASE_URL=http://backend:8080 (컨테이너 네트워크)
export const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

export const JSON_HEADERS = { "Content-Type": "application/json" };

// V2 목데이터 계정 (비밀번호 test1234)
export const SEED_USERS = ["meatlover", "porkfan", "chickenrun"];

export function login(loginId, password = "test1234") {
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({ loginId, password }), {
    headers: JSON_HEADERS,
    tags: { name: "POST /auth/login" },
  });
  check(res, { "로그인 200": (r) => r.status === 200 });
  return res.json("accessToken");
}

export function authHeaders(token) {
  return { headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` } };
}
