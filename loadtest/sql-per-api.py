#!/usr/bin/env python3
"""API 1건을 처리할 때 실행되는 SQL 문 수를 API별로 잰다 (N+1 같은 쿼리 과다 원인 찾기).

부하 없이 요청을 하나씩 보내고, 요청 전후의 hibernate_statements_total{status="prepared"} 차이를 센다.
(백엔드가 /actuator/prometheus 를 노출하고, hibernate.generate_statistics=true 여야 한다)

    python3 loadtest/sql-per-api.py            # 표 출력
    python3 loadtest/sql-per-api.py --json     # JSON 출력
데이터 전제: loadtest/reset-db.sh 로 초기화한 DB. 측정용 회원 bench1999, 관리자 역할로 meatlover 를 쓴다.
"""
import json
import re
import sys
import time
import urllib.request

BASE = "http://localhost:8080"
METRIC = re.compile(r'^hibernate_statements_total\{.*status="prepared".*\}\s+([0-9.eE+]+)', re.M)


def statements():
    with urllib.request.urlopen(f"{BASE}/actuator/prometheus") as r:
        return float(METRIC.search(r.read().decode()).group(1))


def call(method, path, body=None, token=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(f"{BASE}{path}", data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read().decode()
            return r.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        return e.code, None


results = []


def measure(name, method, path, body=None, token=None):
    before = statements()
    started = time.perf_counter()
    status, payload = call(method, path, body, token)
    elapsed = (time.perf_counter() - started) * 1000
    time.sleep(0.05)  # 통계 반영 대기
    count = int(statements() - before)
    results.append({"api": name, "status": status, "sql": count, "ms": round(elapsed, 1)})
    return payload


run = str(int(time.time()))[-6:]

# 비로그인
measure("GET /categories", "GET", "/categories")
measure("GET /products (전체, 최신순)", "GET", "/products?sort=newest&page=0&size=12")
measure("GET /products (카테고리, 최신순)", "GET", "/products?category=PORK&sort=newest&page=0&size=12")
measure("GET /products (카테고리, 가격순)", "GET", "/products?category=PORK&sort=price_asc&page=0&size=12")
measure("GET /products (상품명 검색)", "GET", "/products?q=123&page=0&size=12")
measure("GET /products/{id}", "GET", "/products/100")

# 회원 (bench1999: 주문 50건, 장바구니 3개)
login = measure("POST /auth/login", "POST", "/auth/login", {"loginId": "bench1999", "password": "test1234"})
token = login["accessToken"]
measure("GET /members/me", "GET", "/members/me", token=token)
cart = measure("GET /cart", "GET", "/cart", token=token)
added = measure("POST /cart/items", "POST", "/cart/items", {"productId": 500, "quantity": 1}, token)
item_id = [i for i in added["items"] if i["productId"] == 500][0]["id"]
measure("PATCH /cart/items/{id}", "PATCH", f"/cart/items/{item_id}", {"quantity": 2}, token)
orders = measure("GET /orders", "GET", "/orders", token=token)
measure("GET /orders/{id}", "GET", f"/orders/{orders[0]['id']}", token=token)
order = measure("POST /orders", "POST", "/orders", {"cartItemIds": [item_id]}, token)
measure("POST /orders/{id}/cancel", "POST", f"/orders/{order['id']}/cancel", token=token)
measure("PATCH /orders/{id}", "PATCH", f"/orders/{order['id']}", {"status": "DELIVERED"}, token)
measure("DELETE /orders/{id}", "DELETE", f"/orders/{order['id']}", token=token)
added = measure("POST /cart/items (2)", "POST", "/cart/items", {"productId": 501, "quantity": 1}, token)
item_id = [i for i in added["items"] if i["productId"] == 501][0]["id"]
measure("DELETE /cart/items/{id}", "DELETE", f"/cart/items/{item_id}", token=token)

# 가입 → 탈퇴
uid = f"sqlcount{run}"
measure("POST /auth/signup", "POST", "/auth/signup", {"loginId": uid, "password": "test1234", "name": "측정", "email": f"{uid}@example.com",
                                                  "phone": f"010-6{run}", "sex": "NONE", "birthday": "2000-01-01"})
t2 = call("POST", "/auth/login", {"loginId": uid, "password": "test1234"})[1]["accessToken"]
measure("PATCH /members/me", "PATCH", "/members/me", {"name": "측정2", "email": f"{uid}@example.com", "phone": f"010-6{run}"}, t2)
measure("PATCH /members/me/password", "PATCH", "/members/me/password", {"currentPassword": "test1234", "newPassword": "test12345"}, t2)
call("POST", "/cart/items", {"productId": 502, "quantity": 1}, t2)
measure("DELETE /cart", "DELETE", "/cart", token=t2)
measure("POST /auth/logout", "POST", "/auth/logout", token=t2)
measure("DELETE /members/me", "DELETE", "/members/me", token=t2)

# 관리자
admin = call("POST", "/auth/login", {"loginId": "meatlover", "password": "test1234"})[1]["accessToken"]
p = measure("POST /products", "POST", "/products", {"name": f"측정상품{run}", "price": 1000, "category": "PORK", "stock": 1, "description": "측정"}, admin)
measure("PATCH /products/{id}", "PATCH", f"/products/{p['id']}", {"name": f"측정상품{run}b", "price": 1000, "category": "PORK", "stock": 1, "description": "측정"}, admin)
measure("DELETE /products/{id}", "DELETE", f"/products/{p['id']}", token=admin)

if "--json" in sys.argv:
    print(json.dumps(results, ensure_ascii=False, indent=2))
else:
    print(f"{'API':40} {'status':>6} {'SQL 수':>7} {'응답(ms)':>9}")
    for r in results:
        print(f"{r['api']:40} {r['status']:>6} {r['sql']:>7} {r['ms']:>9}")
