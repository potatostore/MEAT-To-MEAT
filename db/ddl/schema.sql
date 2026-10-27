-- =====================================================================
-- 고기서고기 (meat to meat) - 물리적 데이터 모델 DDL (MySQL 8.x)
-- 보고서 5장 물리적 데이터 모델링(테이블 스키마)을 그대로 옮긴 것
-- 모든 테이블은 Base_Entity의 create_at, update_at 컬럼을 공통으로 가진다
-- =====================================================================
CREATE DATABASE IF NOT EXISTS meat_to_meat
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE meat_to_meat;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_item;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_item;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- (1) 회원 ---------------------------------------------------------------
CREATE TABLE users (
    user_id       BIGINT       NOT NULL AUTO_INCREMENT,
    login_id      VARCHAR(30)  NOT NULL,
    user_pw       VARCHAR(255) NOT NULL COMMENT '비밀번호 해시값',
    name          VARCHAR(50)  NOT NULL,
    email         VARCHAR(100) NOT NULL,
    phone_number  VARCHAR(30)  NOT NULL,
    sex           VARCHAR(10)  NOT NULL COMMENT 'M, F, NONE',
    birthday      DATE         NOT NULL,
    create_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_users          PRIMARY KEY (user_id),
    CONSTRAINT uq_users_login_id UNIQUE (login_id),
    CONSTRAINT uq_users_email    UNIQUE (email),
    CONSTRAINT uq_users_phone    UNIQUE (phone_number),
    CONSTRAINT chk_users_sex     CHECK (sex IN ('M', 'F', 'NONE'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '회원';

-- (6) 상품 ---------------------------------------------------------------
CREATE TABLE product (
    product_id        BIGINT       NOT NULL AUTO_INCREMENT,
    product_name      VARCHAR(255) NOT NULL,
    product_price     BIGINT       NOT NULL COMMENT '현재 판매가',
    product_category  VARCHAR(20)  NOT NULL COMMENT 'HANWOO, PORK, CHICKEN, IMPORTED',
    stock_quantity    INT          NOT NULL,
    description       VARCHAR(500) NOT NULL,
    create_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_product           PRIMARY KEY (product_id),
    CONSTRAINT uq_product_name      UNIQUE (product_name),
    CONSTRAINT chk_product_price    CHECK (product_price >= 1),
    CONSTRAINT chk_product_stock    CHECK (stock_quantity >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '상품';

CREATE INDEX idx_product_category ON product (product_category);  -- 카테고리별 상품 조회

-- (2) 장바구니 -----------------------------------------------------------
CREATE TABLE cart (
    cart_id    BIGINT   NOT NULL AUTO_INCREMENT,
    user_id    BIGINT   NOT NULL,
    create_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_cart       PRIMARY KEY (cart_id),
    CONSTRAINT uq_cart_user  UNIQUE (user_id),                      -- 회원 1 : 장바구니 1
    CONSTRAINT fk_cart_user  FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE                                           -- 회원 탈퇴 시 장바구니도 삭제
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '장바구니';

-- (3) 장바구니 내 상품 ---------------------------------------------------
CREATE TABLE cart_item (
    cart_item_id  BIGINT   NOT NULL AUTO_INCREMENT,
    cart_id       BIGINT   NOT NULL,
    product_id    BIGINT   NOT NULL,
    quantity      INT      NOT NULL,
    create_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_cart_item           PRIMARY KEY (cart_item_id),
    CONSTRAINT uq_cart_item_product   UNIQUE (cart_id, product_id),  -- 같은 상품은 한 줄로, 수량만 증가
    CONSTRAINT chk_cart_item_quantity CHECK (quantity >= 1),
    CONSTRAINT fk_cart_item_cart      FOREIGN KEY (cart_id) REFERENCES cart (cart_id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_item_product   FOREIGN KEY (product_id) REFERENCES product (product_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '장바구니 내 상품';

-- (4) 주문 ---------------------------------------------------------------
CREATE TABLE orders (
    order_id           BIGINT      NOT NULL AUTO_INCREMENT,
    user_id            BIGINT      NOT NULL,
    order_status       VARCHAR(30) NOT NULL COMMENT 'PAID, PREPARING, SHIPPING, DELIVERED, CANCELLED',
    total_order_price  BIGINT      NOT NULL,
    create_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '주문 일시',
    update_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_orders          PRIMARY KEY (order_id),
    CONSTRAINT chk_orders_status  CHECK (order_status IN ('PAID', 'PREPARING', 'SHIPPING', 'DELIVERED', 'CANCELLED')),
    CONSTRAINT chk_orders_total   CHECK (total_order_price >= 0),
    CONSTRAINT fk_orders_user     FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT                                          -- 주문 이력이 있는 회원은 바로 삭제 불가
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '주문';

CREATE INDEX idx_orders_user_created ON orders (user_id, create_at);  -- 사용자별 주문 조회(최신순)

-- (5) 주문 상품 ----------------------------------------------------------
CREATE TABLE order_item (
    order_item_id  BIGINT   NOT NULL AUTO_INCREMENT,
    order_id       BIGINT   NOT NULL,
    product_id     BIGINT   NOT NULL,
    quantity       INT      NOT NULL,
    order_price    BIGINT   NOT NULL COMMENT '주문 당시 단가 스냅샷',
    create_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_order_item           PRIMARY KEY (order_item_id),
    CONSTRAINT chk_order_item_quantity CHECK (quantity >= 1),
    CONSTRAINT chk_order_item_price    CHECK (order_price >= 0),
    CONSTRAINT fk_order_item_order     FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_product   FOREIGN KEY (product_id) REFERENCES product (product_id)
        ON DELETE RESTRICT                                          -- 주문된 상품은 바로 삭제 불가
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '주문 상품';
