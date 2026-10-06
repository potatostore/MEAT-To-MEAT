import type { Category, Faq, Product } from "../types";

export const categories: Category[] = [
  { code: "HANWOO", name: "한우", description: "1++ 등급 구이용, 진공 개별 포장" },
  { code: "PORK", name: "돼지고기", description: "국내산 냉장, 두께 선택 가능" },
  { code: "CHICKEN", name: "닭고기", description: "손질 완료, 소분 냉동 포장" },
  { code: "IMPORTED", name: "수입육", description: "그릴·스테이크용 두께 절단" },
];

const categoryName = Object.fromEntries(categories.map((c) => [c.code, c.name]));

type Seed = Omit<Product, "categoryName" | "createdAt" | "imageUrl">;

const seeds: Seed[] = [
  {
    id: 1, name: "한우 1++ 등심", category: "HANWOO",
    summary: "마블링이 고르게 퍼진 구이용 등심",
    description: "당일 도축 원육을 숙성실에서 7일간 건식 숙성했습니다. 두께를 고르면 주문 즉시 절단해 진공 포장합니다.",
    price: 32900, salePrice: 29900, unit: "300g", grade: "1++", origin: "국내산(한우)", storage: "냉장", stock: 42,
    options: [{ id: 101, name: "구이용 1.5cm", extraPrice: 0 }, { id: 102, name: "스테이크용 3cm", extraPrice: 2000 }],
  },
  {
    id: 2, name: "한우 1++ 안심", category: "HANWOO",
    summary: "가장 부드러운 부위, 스테이크 추천",
    description: "한 마리에서 극소량만 나오는 안심을 스테이크 두께로 손질했습니다.",
    price: 41900, salePrice: null, unit: "300g", grade: "1++", origin: "국내산(한우)", storage: "냉장", stock: 18,
    options: [{ id: 201, name: "스테이크용 3cm", extraPrice: 0 }, { id: 202, name: "샤토브리앙 4cm", extraPrice: 3000 }],
  },
  {
    id: 3, name: "한우 1+ 채끝", category: "HANWOO",
    summary: "씹는 맛과 육향이 진한 채끝",
    description: "등심과 안심 사이의 채끝으로 적당한 지방과 진한 육향이 특징입니다.",
    price: 35900, salePrice: null, unit: "300g", grade: "1+", origin: "국내산(한우)", storage: "냉장", stock: 25,
    options: [{ id: 301, name: "구이용 1.5cm", extraPrice: 0 }, { id: 302, name: "스테이크용 3cm", extraPrice: 2000 }],
  },
  {
    id: 4, name: "한우 국거리 양지", category: "HANWOO",
    summary: "미역국·육개장용 한입 크기 절단",
    description: "국물 요리에 맞게 한입 크기로 썰어 소분했습니다.",
    price: 18900, salePrice: 16900, unit: "500g", grade: "1", origin: "국내산(한우)", storage: "냉장", stock: 60,
    options: [],
  },
  {
    id: 5, name: "제주 흑돼지 삼겹살", category: "PORK",
    summary: "쫄깃한 껍데기까지 살린 오겹 삼겹",
    description: "제주 지정 농가 흑돼지를 껍데기째 손질했습니다. 두께를 선택할 수 있어요.",
    price: 19800, salePrice: 15900, unit: "500g", grade: null, origin: "국내산(제주)", storage: "냉장", stock: 80,
    options: [{ id: 501, name: "구이용 1cm", extraPrice: 0 }, { id: 502, name: "두툼 2cm", extraPrice: 1000 }],
  },
  {
    id: 6, name: "한돈 삼겹살", category: "PORK",
    summary: "가장 많이 찾는 기본 삼겹",
    description: "국내산 한돈 냉장 삼겹살. 지방과 살코기 비율을 맞춰 손질합니다.",
    price: 14500, salePrice: null, unit: "500g", grade: null, origin: "국내산", storage: "냉장", stock: 120,
    options: [{ id: 601, name: "구이용 1cm", extraPrice: 0 }, { id: 602, name: "수육용 통", extraPrice: 0 }],
  },
  {
    id: 7, name: "한돈 목살", category: "PORK",
    summary: "기름기 적고 육즙 많은 목살",
    description: "구이와 수육 모두 잘 어울리는 목살입니다.",
    price: 13900, salePrice: null, unit: "500g", grade: null, origin: "국내산", storage: "냉장", stock: 95,
    options: [{ id: 701, name: "구이용 1.5cm", extraPrice: 0 }, { id: 702, name: "스테이크 2.5cm", extraPrice: 1000 }],
  },
  {
    id: 8, name: "한돈 앞다리 불고기용", category: "PORK",
    summary: "제육볶음·불고기용 얇은 슬라이스",
    description: "앞다리살을 2mm 두께로 얇게 썰었습니다.",
    price: 8900, salePrice: 7900, unit: "600g", grade: null, origin: "국내산", storage: "냉장", stock: 0,
    options: [],
  },
  {
    id: 9, name: "닭가슴살", category: "CHICKEN",
    summary: "손질 완료, 소분 냉동 포장",
    description: "힘줄과 껍질을 제거하고 200g씩 소분해 급속 냉동했습니다.",
    price: 9900, salePrice: null, unit: "1kg", grade: null, origin: "국내산", storage: "냉동", stock: 200,
    options: [{ id: 901, name: "1kg", extraPrice: 0 }, { id: 902, name: "2kg", extraPrice: 8900 }],
  },
  {
    id: 10, name: "닭다리살 정육", category: "CHICKEN",
    summary: "뼈 없이 손질한 촉촉한 다리살",
    description: "구이·덮밥용으로 좋은 뼈 없는 닭다리살입니다.",
    price: 11900, salePrice: 9900, unit: "1kg", grade: null, origin: "국내산", storage: "냉장", stock: 70,
    options: [],
  },
  {
    id: 11, name: "토종닭 한 마리", category: "CHICKEN",
    summary: "백숙·닭볶음탕용 토막 선택",
    description: "토종닭 한 마리를 통째로 또는 토막 내어 보내드립니다.",
    price: 16900, salePrice: null, unit: "1.2kg", grade: null, origin: "국내산", storage: "냉장", stock: 30,
    options: [{ id: 1101, name: "통마리", extraPrice: 0 }, { id: 1102, name: "볶음탕용 토막", extraPrice: 0 }],
  },
  {
    id: 12, name: "호주산 척아이롤", category: "IMPORTED",
    summary: "그릴·스테이크용 두께 절단",
    description: "곡물 비육 호주산 척아이롤. 가성비 좋은 스테이크용입니다.",
    price: 18900, salePrice: null, unit: "400g", grade: null, origin: "호주산", storage: "냉장", stock: 55,
    options: [{ id: 1201, name: "구이용 1.5cm", extraPrice: 0 }, { id: 1202, name: "스테이크용 3cm", extraPrice: 1000 }],
  },
  {
    id: 13, name: "미국산 프라임 부채살", category: "IMPORTED",
    summary: "가운데 힘줄을 제거한 부채살",
    description: "USDA 프라임 등급 부채살로, 가운데 힘줄을 제거해 부드럽습니다.",
    price: 22900, salePrice: 19900, unit: "400g", grade: "Prime", origin: "미국산", storage: "냉장", stock: 34,
    options: [],
  },
  {
    id: 14, name: "뉴질랜드 양갈비", category: "IMPORTED",
    summary: "프렌치랙 손질, 잡내 없는 램",
    description: "생후 12개월 미만 램을 프렌치랙으로 손질했습니다.",
    price: 27900, salePrice: null, unit: "500g", grade: null, origin: "뉴질랜드산", storage: "냉동", stock: 22,
    options: [],
  },
];

export const products: Product[] = seeds.map((seed, i) => ({
  ...seed,
  categoryName: categoryName[seed.category],
  imageUrl: null,
  createdAt: new Date(Date.UTC(2026, 8, 1 + i)).toISOString(),
}));

export const faqs: Faq[] = [
  { id: 1, category: "배송", question: "주문하면 언제 받을 수 있나요?", answer: "평일 오후 3시 이전 결제 건은 당일 출고되어 다음 날 아침 7시 전에 도착합니다. 새벽배송 불가 지역은 택배로 1~2일 소요됩니다." },
  { id: 2, category: "배송", question: "배송비는 얼마인가요?", answer: "기본 배송비는 3,500원이며, 50,000원 이상 구매 시 무료로 배송해 드립니다." },
  { id: 3, category: "상품", question: "두께 옵션은 어떻게 선택하나요?", answer: "상품 상세 페이지에서 손질 옵션을 선택하면 주문 즉시 해당 두께로 절단해 포장합니다." },
  { id: 4, category: "상품", question: "냉장 상품은 얼마나 보관할 수 있나요?", answer: "진공 포장 냉장 상품은 수령일로부터 0~4℃에서 5일 이내 섭취를 권장합니다. 오래 두실 경우 바로 냉동해 주세요." },
  { id: 5, category: "주문/결제", question: "주문을 취소하고 싶어요.", answer: "상품 준비 전(결제 완료 상태)까지는 마이페이지 > 주문 내역에서 직접 취소할 수 있습니다. 이후에는 1:1 문의를 남겨 주세요." },
  { id: 6, category: "주문/결제", question: "어떤 결제 수단을 사용할 수 있나요?", answer: "신용/체크카드, 무통장입금, 카카오페이를 지원합니다." },
  { id: 7, category: "회원", question: "회원 정보는 어디서 수정하나요?", answer: "마이페이지 > 회원 정보에서 이름, 연락처, 비밀번호를 변경할 수 있습니다." },
];
