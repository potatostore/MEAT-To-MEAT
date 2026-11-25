"""두 가지 Prompting 방식 (과제 확장형 B).

- simple : 테이블명, 컬럼명 등 기본 스키마만 제공
- rich   : PK/FK, 테이블 관계, 컬럼 의미, 값 목록, 업무 용어 정의, 집계 기준까지 제공

공정하게 비교하려고 출력 형식 지시(COMMON_RULES)는 두 방식에 똑같이 넣고, 차이는 스키마 정보에만 둔다.
스키마는 backend/.../db/migration/V1__init_schema.sql 기준이다. 테이블이나 값이 바뀌면 여기도 같이 고친다.
비밀번호(user_pw)와 전화번호(phone_number)는 일부러 스키마에서 뺐다.
"""
import os
from datetime import date


def today():
    """기준일. 평가를 다시 돌려도 같은 결과가 나오게 NL2SQL_TODAY(YYYY-MM-DD)로 고정할 수 있다."""
    v = os.getenv("NL2SQL_TODAY")
    return date.fromisoformat(v) if v else date.today()


COMMON_RULES = """너는 MySQL 8 전문가다. 사용자의 질문을 아래 데이터베이스에서 실행할 SQL로 바꿔라.
- MySQL 문법으로 SELECT 문 하나만 작성한다.
- 설명, 주석, 코드블록 표시 없이 SQL만 출력한다.
"""

SIMPLE_SCHEMA = """[테이블]
users(user_id, login_id, name, email, sex, birthday, create_at, update_at)
product(product_id, product_name, product_price, product_category, stock_quantity, description, create_at, update_at)
cart(cart_id, user_id, create_at, update_at)
cart_item(cart_item_id, cart_id, product_id, quantity, create_at, update_at)
orders(order_id, user_id, order_status, total_order_price, create_at, update_at)
order_item(order_item_id, order_id, product_id, quantity, order_price, create_at, update_at)
"""

RICH_EXTRA = """
[키와 관계]
- PK: users.user_id, product.product_id, cart.cart_id, cart_item.cart_item_id, orders.order_id, order_item.order_item_id
- cart.user_id → users.user_id (회원 1명당 장바구니 1개)
- cart_item.cart_id → cart.cart_id, cart_item.product_id → product.product_id (장바구니에 담긴 상품, 아직 구매 아님)
- orders.user_id → users.user_id (회원 1 : 주문 N)
- order_item.order_id → orders.order_id, order_item.product_id → product.product_id (주문에 포함된 상품)

[컬럼 의미와 값]
- product.product_category 값: 'HANWOO'(한우), 'PORK'(돼지고기), 'CHICKEN'(닭고기), 'IMPORTED'(수입육)
- product.product_price: 현재 판매가. 가격이 바뀔 수 있어서 과거 주문 금액 계산에는 쓰지 않는다.
- product.stock_quantity: 현재 재고 수량
- order_item.order_price: 주문 당시 단가(스냅샷). 주문 금액 = order_price * quantity
- orders.total_order_price: 주문 한 건의 총액 (order_item 합계와 같음)
- orders.order_status 값: 'ORDER_RECEIVED'(주문 접수), 'PREPARING_DELIVERY'(배송 준비중),
  'IN_TRANSIT'(배송중), 'DELIVERED'(배송 완료), 'ORDER_CANCELED'(주문 취소)
- orders.create_at: 주문 일시 (DATETIME)
- users.sex 값: 'M'(남), 'F'(여), 'NONE'(선택 안 함), users.birthday: DATE

[업무 용어와 집계 기준]
- 오늘(기준일)은 {today}이다. '이번 달', '지난달' 같은 표현은 이 날짜를 기준으로 계산하고 NOW(), CURDATE()는 쓰지 않는다.
- 매출, 판매, 구매 금액·수량을 집계할 때는 order_status가 'ORDER_CANCELED'인 주문을 제외한다.
- 매출 = 취소를 제외한 주문의 SUM(order_item.order_price * order_item.quantity)
- VIP 회원 = 취소를 제외한 누적 구매 금액이 150,000원 이상인 회원
- 효자 상품 = 취소를 제외한 매출액이 가장 큰 상품
- 품절 = stock_quantity가 0, 품절 임박 = stock_quantity가 1 이상 20 이하
- 장바구니에 담긴 것은 판매가 아니다. '팔렸다'는 취소되지 않은 주문에 포함된 것을 뜻한다.
- 질문에 '상관없이'가 있으면 그 조건으로 거르지 않는다.
- 회원을 보여달라고 하면 users.name을, 상품을 보여달라고 하면 product.product_name을 반환한다.
"""


def build_prompt(mode):
    if mode == "simple":
        return COMMON_RULES + "\n" + SIMPLE_SCHEMA
    if mode == "rich":
        return COMMON_RULES + "\n" + SIMPLE_SCHEMA + RICH_EXTRA.format(today=today().isoformat())
    raise ValueError("mode는 simple 또는 rich")
