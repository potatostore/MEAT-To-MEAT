import type { Category, Faq, Product } from "../types";

// 백엔드 ProductCategory enum 과 동일
export const categories: Category[] = [
  { code: "HANWOO", name: "한우", description: "1++ 등급 구이용, 진공 개별 포장" },
  { code: "PORK", name: "돼지고기", description: "국내산 냉장, 두께 선택 가능" },
  { code: "CHICKEN", name: "닭고기", description: "손질 완료, 소분 냉동 포장" },
  { code: "IMPORTED", name: "수입육", description: "그릴·스테이크용 두께 절단" },
];

const SEEDED_AT = "2026-09-01T09:00:00";

// V2__insert_mock_data.sql 의 product 20건과 동일
export const products: Product[] = [
  { id: 1, name: "한우 1++ 등심", category: "HANWOO", categoryName: "한우", description: "마블링이 고르게 퍼진 구이용 등심, 300g", price: 29900, stock: 42, createdAt: SEEDED_AT },
  { id: 2, name: "한우 1++ 안심", category: "HANWOO", categoryName: "한우", description: "가장 부드러운 부위, 스테이크용 300g", price: 41900, stock: 18, createdAt: SEEDED_AT },
  { id: 3, name: "한우 1+ 채끝", category: "HANWOO", categoryName: "한우", description: "씹는 맛과 육향이 진한 채끝, 300g", price: 35900, stock: 25, createdAt: SEEDED_AT },
  { id: 4, name: "한우 국거리 양지", category: "HANWOO", categoryName: "한우", description: "미역국·육개장용 한입 크기 절단, 500g", price: 16900, stock: 60, createdAt: SEEDED_AT },
  { id: 5, name: "한우 불고기", category: "HANWOO", categoryName: "한우", description: "얇게 썬 앞다리·우둔 불고기용, 500g", price: 19900, stock: 55, createdAt: SEEDED_AT },
  { id: 6, name: "제주 흑돼지 삼겹살", category: "PORK", categoryName: "돼지고기", description: "껍데기째 손질한 오겹 삼겹, 500g", price: 15900, stock: 80, createdAt: SEEDED_AT },
  { id: 7, name: "한돈 삼겹살", category: "PORK", categoryName: "돼지고기", description: "가장 많이 찾는 기본 삼겹, 500g", price: 14500, stock: 120, createdAt: SEEDED_AT },
  { id: 8, name: "한돈 목살", category: "PORK", categoryName: "돼지고기", description: "기름기 적고 육즙 많은 목살, 500g", price: 13900, stock: 95, createdAt: SEEDED_AT },
  { id: 9, name: "한돈 앞다리 불고기용", category: "PORK", categoryName: "돼지고기", description: "제육볶음용 2mm 슬라이스, 600g", price: 7900, stock: 0, createdAt: SEEDED_AT },
  { id: 10, name: "한돈 등갈비", category: "PORK", categoryName: "돼지고기", description: "찜·바비큐용 등갈비, 1kg", price: 18900, stock: 35, createdAt: SEEDED_AT },
  { id: 11, name: "닭가슴살", category: "CHICKEN", categoryName: "닭고기", description: "손질 완료, 200g씩 소분 냉동, 1kg", price: 9900, stock: 200, createdAt: SEEDED_AT },
  { id: 12, name: "닭다리살 정육", category: "CHICKEN", categoryName: "닭고기", description: "뼈 없이 손질한 다리살, 1kg", price: 9900, stock: 70, createdAt: SEEDED_AT },
  { id: 13, name: "토종닭 한 마리", category: "CHICKEN", categoryName: "닭고기", description: "백숙·볶음탕용 토종닭, 1.2kg", price: 16900, stock: 30, createdAt: SEEDED_AT },
  { id: 14, name: "닭안심", category: "CHICKEN", categoryName: "닭고기", description: "힘줄 제거한 닭안심, 1kg", price: 8900, stock: 90, createdAt: SEEDED_AT },
  { id: 15, name: "닭날개 윙봉", category: "CHICKEN", categoryName: "닭고기", description: "튀김·구이용 윙봉, 1kg", price: 10900, stock: 65, createdAt: SEEDED_AT },
  { id: 16, name: "호주산 척아이롤", category: "IMPORTED", categoryName: "수입육", description: "그릴·스테이크용 두께 절단, 400g", price: 18900, stock: 55, createdAt: SEEDED_AT },
  { id: 17, name: "미국산 프라임 부채살", category: "IMPORTED", categoryName: "수입육", description: "힘줄 제거한 프라임 부채살, 400g", price: 19900, stock: 34, createdAt: SEEDED_AT },
  { id: 18, name: "뉴질랜드 양갈비", category: "IMPORTED", categoryName: "수입육", description: "프렌치랙 손질 램, 500g", price: 27900, stock: 22, createdAt: SEEDED_AT },
  { id: 19, name: "미국산 LA갈비", category: "IMPORTED", categoryName: "수입육", description: "양념용 LA갈비, 1kg", price: 32900, stock: 40, createdAt: SEEDED_AT },
  { id: 20, name: "스페인 이베리코 목살", category: "IMPORTED", categoryName: "수입육", description: "도토리 먹인 이베리코 목살, 500g", price: 24900, stock: 28, createdAt: SEEDED_AT },
];

export const faqs: Faq[] = [
  { id: 1, category: "배송", question: "주문하면 언제 받을 수 있나요?", answer: "평일 오후 3시 이전 주문은 당일 출고되어 다음 날 아침 7시 전에 도착합니다. 새벽배송 불가 지역은 택배로 1~2일 소요됩니다." },
  { id: 2, category: "배송", question: "배송 상태는 어디서 확인하나요?", answer: "마이페이지 > 주문 · 배송 조회에서 주문 접수, 배송 준비중, 배송중, 배송 완료 단계를 확인할 수 있습니다." },
  { id: 3, category: "상품", question: "냉장 상품은 얼마나 보관할 수 있나요?", answer: "진공 포장 냉장 상품은 수령일로부터 0~4℃에서 5일 이내 섭취를 권장합니다. 오래 두실 경우 바로 냉동해 주세요." },
  { id: 4, category: "상품", question: "품절 상품은 언제 다시 입고되나요?", answer: "재고가 0개인 상품은 장바구니에 담을 수 없으며, 입고되는 대로 상품 페이지의 재고 수량이 갱신됩니다." },
  { id: 5, category: "주문", question: "주문을 취소하고 싶어요.", answer: "주문 접수 상태까지는 마이페이지 > 주문 상세에서 직접 취소할 수 있고, 취소하면 재고도 바로 복구됩니다. 배송 준비가 시작된 뒤에는 취소할 수 없습니다." },
  { id: 6, category: "주문", question: "주문 후 상품 가격이 바뀌면 어떻게 되나요?", answer: "주문 내역에는 주문 당시의 가격이 그대로 저장되므로, 이후 상품 가격이 바뀌어도 결제 금액은 달라지지 않습니다." },
  { id: 7, category: "회원", question: "회원 정보는 어디서 수정하나요?", answer: "마이페이지 > 회원 정보에서 이름, 이메일, 연락처와 비밀번호를 변경할 수 있습니다. 아이디, 성별, 생년월일은 변경할 수 없습니다." },
];
