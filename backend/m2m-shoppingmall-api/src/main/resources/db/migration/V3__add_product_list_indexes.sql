-- =====================================================================
-- V3: 상품 목록 조회 인덱스 (성능 튜닝 3)
--   측정 근거 (상품 30,020개):
--     - 전체 최신순: 테이블 전체 스캔 30,020행 + filesort → 17.3ms
--     - 카테고리 최신순/가격순: idx_product_category 로 7,505행 조회 후 filesort → 6.1ms
--     - 부하 중 상품 목록 쿼리 평균 13ms, rows_examined 평균 12,000행
--   원리: (WHERE 조건 컬럼, ORDER BY 컬럼, 동점 정렬용 PK) 순서의 인덱스는 이미 정렬된 순서로 저장되어 있으므로
--         MySQL 이 정렬(filesort) 없이 인덱스를 앞(또는 뒤)에서부터 LIMIT 개수만큼만 읽고 멈춘다.
-- =====================================================================

-- 카테고리 + 최신순. 기존 idx_product_category(product_category)는 이 인덱스의 앞부분과 같으므로 대체한다
--   (카테고리 조건만 쓰는 count 쿼리도 이 인덱스의 앞부분으로 처리된다)
CREATE INDEX idx_product_category_created ON product (product_category, create_at, product_id);
DROP INDEX idx_product_category ON product;

-- 카테고리 없이 전체 최신순
CREATE INDEX idx_product_created ON product (create_at, product_id);

-- 카테고리 + 가격순 / 전체 가격순 (오름차순은 앞에서, 내림차순은 뒤에서부터 읽는다)
CREATE INDEX idx_product_category_price ON product (product_category, product_price, product_id);
CREATE INDEX idx_product_price ON product (product_price, product_id);

-- 카테고리 + 이름순 (전체 이름순은 기존 UNIQUE(product_name) 인덱스가 처리)
CREATE INDEX idx_product_category_name ON product (product_category, product_name);
