-- =====================================================================
-- 성능 측정용 대량 데이터 (Flyway 마이그레이션 아님, loadtest/reset-db.sh 가 실행)
--   V1 + V2(목데이터) 적용 직후의 DB 에 넣는다. 매번 같은 값이 들어가도록 난수 대신 고정 공식을 쓴다.
--   users      : 2,000명 추가  (bench0001 ~ bench2000, 비밀번호 test1234)
--   cart       : 2,000개 추가  (회원 1:1)
--   cart_item  : 6,000개 추가  (회원당 3개)
--   product    : 30,000개 추가 (카테고리 4종 균등, 등록일 1년에 걸쳐 분산, 재고 100,000)
--   orders     : 100,180건 추가 (bench 회원당 50건 + 목데이터 회원 3명 각 60건)
--   order_item : 200,540건 추가 (bench 주문당 2개, 목데이터 회원 주문당 3개)
-- =====================================================================
SET SESSION cte_max_recursion_depth = 1000000;

DROP TEMPORARY TABLE IF EXISTS seq;
CREATE TEMPORARY TABLE seq (n INT PRIMARY KEY);
INSERT INTO seq
WITH RECURSIVE s(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM s WHERE n < 200000)
SELECT n FROM s;

-- (1) 회원 2,000명 (user_id 4 ~ 2003)
INSERT INTO users (user_id, login_id, user_pw, name, email, phone_number, sex, birthday, create_at, update_at)
SELECT 3 + n,
       CONCAT('bench', LPAD(n, 4, '0')),
       '$2a$10$UoxSBOOD7SHCk.5aUMsqguX8SvFLMwyH6jguowIaQ1IfmdAV8S3Cq',
       CONCAT('벤치회원', n),
       CONCAT('bench', LPAD(n, 4, '0'), '@example.com'),
       CONCAT('010-7', LPAD(n, 7, '0')),
       ELT(1 + n % 3, 'M', 'F', 'NONE'),
       DATE_ADD('1975-01-01', INTERVAL n * 7 DAY),
       TIMESTAMP('2025-01-01') + INTERVAL n HOUR,
       TIMESTAMP('2025-01-01') + INTERVAL n HOUR
FROM seq WHERE n <= 2000;

-- (2) 장바구니 (회원 1:1)
INSERT INTO cart (cart_id, user_id, create_at, update_at)
SELECT 3 + n, 3 + n, TIMESTAMP('2025-01-01') + INTERVAL n HOUR, TIMESTAMP('2025-01-01') + INTERVAL n HOUR
FROM seq WHERE n <= 2000;

-- (3) 상품 30,000개 (product_id 21 ~ 30020), 등록일을 1년(525,600분)에 걸쳐 흩뿌린다
INSERT INTO product (product_id, product_name, product_price, product_category, stock_quantity, description, create_at, update_at)
SELECT 20 + n,
       CONCAT('벤치상품 ', LPAD(n, 5, '0')),
       1000 + (n * 7919 % 49000) DIV 100 * 100,
       ELT(1 + n % 4, 'HANWOO', 'PORK', 'CHICKEN', 'IMPORTED'),
       100000,
       CONCAT('부하 테스트용 상품 ', n),
       TIMESTAMP('2025-11-25') + INTERVAL (n * 7919 % 525600) MINUTE,
       TIMESTAMP('2025-11-25') + INTERVAL (n * 7919 % 525600) MINUTE
FROM seq WHERE n <= 30000;

-- (4) 주문: bench 회원당 50건 (order_id 21 ~ 100020)
INSERT INTO orders (order_id, user_id, order_status, total_order_price, create_at, update_at)
SELECT 20 + n,
       3 + CEIL(n / 50),
       CASE n % 25
           WHEN 0 THEN 'ORDER_RECEIVED'
           WHEN 1 THEN 'PREPARING_DELIVERY'
           WHEN 2 THEN 'IN_TRANSIT'
           WHEN 3 THEN 'ORDER_CANCELED'
           ELSE 'DELIVERED'
       END,
       0,
       TIMESTAMP('2025-11-25') + INTERVAL (n * 37 % 525600) MINUTE,
       TIMESTAMP('2025-11-25') + INTERVAL (n * 37 % 525600) MINUTE
FROM seq WHERE n <= 100000;

-- (5) 주문: 목데이터 회원(1~3) 각 60건 (order_id 100021 ~ 100200)
INSERT INTO orders (order_id, user_id, order_status, total_order_price, create_at, update_at)
SELECT 100020 + n,
       1 + (n - 1) % 3,
       IF(n % 10 = 0, 'ORDER_CANCELED', 'DELIVERED'),
       0,
       TIMESTAMP('2026-01-01') + INTERVAL n DAY,
       TIMESTAMP('2026-01-01') + INTERVAL n DAY
FROM seq WHERE n <= 180;

-- (6) 주문 상품: bench 주문당 2개 (order_item_id 21 ~ 200020)
INSERT INTO order_item (order_item_id, order_id, product_id, quantity, order_price, create_at, update_at)
SELECT 20 + s.n,
       20 + CEIL(s.n / 2),
       p.product_id,
       1 + s.n % 3,
       p.product_price,
       TIMESTAMP('2025-11-25'),
       TIMESTAMP('2025-11-25')
FROM seq s
JOIN product p ON p.product_id = 21 + (s.n * 7919 % 30000)
WHERE s.n <= 200000;

-- (7) 주문 상품: 목데이터 회원 주문당 3개 (order_item_id 200021 ~ 200560)
INSERT INTO order_item (order_item_id, order_id, product_id, quantity, order_price, create_at, update_at)
SELECT 200020 + s.n,
       100020 + CEIL(s.n / 3),
       p.product_id,
       1 + s.n % 2,
       p.product_price,
       TIMESTAMP('2026-01-01'),
       TIMESTAMP('2026-01-01')
FROM seq s
JOIN product p ON p.product_id = 21 + (s.n * 104729 % 30000)
WHERE s.n <= 540;

-- (8) 장바구니 상품: bench 회원당 3개 (같은 장바구니 안에서 상품이 겹치지 않음)
INSERT INTO cart_item (cart_item_id, cart_id, product_id, quantity, create_at, update_at)
SELECT 20 + n,
       3 + CEIL(n / 3),
       21 + (n * 31 % 30000),
       1,
       TIMESTAMP('2026-11-01'),
       TIMESTAMP('2026-11-01')
FROM seq WHERE n <= 6000;

-- (9) 주문 총액 = 주문 상품 합계
UPDATE orders o
JOIN (SELECT order_id, SUM(order_price * quantity) AS total FROM order_item GROUP BY order_id) x
  ON x.order_id = o.order_id
SET o.total_order_price = x.total
WHERE o.order_id > 20;

DROP TEMPORARY TABLE seq;

-- 통계 갱신 (옵티마이저가 실행 계획을 정할 때 쓰는 행 수·분포)
ANALYZE TABLE users, cart, cart_item, product, orders, order_item;
