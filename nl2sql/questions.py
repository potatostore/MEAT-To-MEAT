"""평가 질문 15개 (레벨별 5개)와 정답 SQL(Reference SQL).

정답 SQL은 평가할 때마다 현재 DB에서 실행해서 정답 결과를 만든다. 그래서 데이터가 바뀌어도 비교는 맞다.
날짜가 들어가는 질문은 prompts.today() 기준일로 계산한다. (보고서용으로 돌릴 땐 NL2SQL_TODAY를 고정)

Level 1: 단일 테이블 / 간단한 조건
Level 2: JOIN, GROUP BY, Subquery
Level 3: 업무 규칙·용어 해석이 필요한 질문 (정의는 prompts.py의 rich Prompt에만 있음)
check_order=True 인 질문만 행 순서까지 비교한다.
"""
from datetime import date

from prompts import today


def _month_range(d, offset):
    """d가 속한 달에서 offset개월 이동한 달의 [시작일, 다음 달 시작일)."""
    y, m = d.year, d.month + offset
    while m < 1:
        y, m = y - 1, m + 12
    while m > 12:
        y, m = y + 1, m - 12
    start = date(y, m, 1)
    end = date(y + (m == 12), m % 12 + 1, 1)
    return start.isoformat(), end.isoformat()


LAST_M_START, LAST_M_END = _month_range(today(), -1)

QUESTIONS = [
    # ---------------- Level 1 ----------------
    {"id": "L1-1", "level": 1,
     "q": "한우 카테고리 상품들의 이름과 가격을 보여줘",
     "ref": "SELECT product_name, product_price FROM product WHERE product_category = 'HANWOO'"},
    {"id": "L1-2", "level": 1,
     "q": "재고가 하나도 없는 상품 이름을 알려줘",
     "ref": "SELECT product_name FROM product WHERE stock_quantity = 0"},
    {"id": "L1-3", "level": 1,
     "q": "가격이 30,000원 이상인 상품은 몇 개야?",
     "ref": "SELECT COUNT(*) FROM product WHERE product_price >= 30000"},
    {"id": "L1-4", "level": 1,
     "q": "2000년 이후에 태어난 회원들의 이름을 알려줘",
     "ref": "SELECT name FROM users WHERE birthday >= '2000-01-01'"},
    {"id": "L1-5", "level": 1,
     "q": "취소된 주문은 몇 건이야?",
     "ref": "SELECT COUNT(*) FROM orders WHERE order_status = 'ORDER_CANCELED'"},

    # ---------------- Level 2 ----------------
    {"id": "L2-1", "level": 2,
     "q": "카테고리별 상품 수와 평균 가격을 보여줘",
     "ref": "SELECT product_category, COUNT(*), AVG(product_price) FROM product GROUP BY product_category"},
    {"id": "L2-2", "level": 2,
     "q": "회원별 이름과 주문 건수를 보여줘 (주문 상태는 상관없이)",
     "ref": """SELECT u.name, COUNT(o.order_id) FROM users u
               LEFT JOIN orders o ON o.user_id = u.user_id
               GROUP BY u.user_id, u.name"""},
    {"id": "L2-3", "level": 2,
     "q": "지금 장바구니에 담겨 있는 상품별로 총 몇 개가 담겨 있는지 상품 이름과 함께 보여줘",
     "ref": """SELECT p.product_name, SUM(ci.quantity) FROM cart_item ci
               JOIN product p ON p.product_id = ci.product_id
               GROUP BY p.product_id, p.product_name"""},
    {"id": "L2-4", "level": 2,
     "q": "'한돈 삼겹살'을 주문한 적 있는 회원 이름을 중복 없이 보여줘 (주문 상태는 상관없이)",
     "ref": """SELECT DISTINCT u.name FROM users u
               JOIN orders o ON o.user_id = u.user_id
               JOIN order_item oi ON oi.order_id = o.order_id
               JOIN product p ON p.product_id = oi.product_id
               WHERE p.product_name = '한돈 삼겹살'"""},
    {"id": "L2-5", "level": 2,
     "q": "주문 건수가 가장 많은 회원의 이름은? (주문 상태는 상관없이)",
     "ref": """SELECT u.name FROM users u JOIN orders o ON o.user_id = u.user_id
               GROUP BY u.user_id, u.name
               HAVING COUNT(*) = (SELECT MAX(c) FROM (SELECT COUNT(*) c FROM orders GROUP BY user_id) t)"""},

    # ---------------- Level 3 ----------------
    {"id": "L3-1", "level": 3,
     "q": "지난달 매출이 얼마야?",
     "ref": f"""SELECT SUM(oi.order_price * oi.quantity) FROM order_item oi
                JOIN orders o ON o.order_id = oi.order_id
                WHERE o.order_status <> 'ORDER_CANCELED'
                  AND o.create_at >= '{LAST_M_START}' AND o.create_at < '{LAST_M_END}'"""},
    {"id": "L3-2", "level": 3,
     "q": "VIP 회원 목록 보여줘",
     "ref": """SELECT u.name FROM users u
               JOIN orders o ON o.user_id = u.user_id
               JOIN order_item oi ON oi.order_id = o.order_id
               WHERE o.order_status <> 'ORDER_CANCELED'
               GROUP BY u.user_id, u.name
               HAVING SUM(oi.order_price * oi.quantity) >= 150000"""},
    {"id": "L3-3", "level": 3,
     "q": "우리 쇼핑몰 효자 상품이 뭐야?",
     "ref": """SELECT p.product_name FROM order_item oi
               JOIN orders o ON o.order_id = oi.order_id
               JOIN product p ON p.product_id = oi.product_id
               WHERE o.order_status <> 'ORDER_CANCELED'
               GROUP BY p.product_id, p.product_name
               ORDER BY SUM(oi.order_price * oi.quantity) DESC LIMIT 1"""},
    {"id": "L3-4", "level": 3,
     "q": "품절 임박 상품 알려줘",
     "ref": "SELECT product_name FROM product WHERE stock_quantity BETWEEN 1 AND 20"},
    {"id": "L3-5", "level": 3,
     "q": "장바구니에는 담겨 있는데 실제로는 한 번도 안 팔린 상품이 뭐야?",
     "ref": """SELECT DISTINCT p.product_name FROM cart_item ci
               JOIN product p ON p.product_id = ci.product_id
               WHERE p.product_id NOT IN (
                   SELECT oi.product_id FROM order_item oi
                   JOIN orders o ON o.order_id = oi.order_id
                   WHERE o.order_status <> 'ORDER_CANCELED')"""},
]
