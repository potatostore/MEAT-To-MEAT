import { faqs } from "./mock/data";
import type { Faq } from "./types";

// FAQ 는 DB 설계 범위 밖이라 프론트 정적 데이터로 보여준다
export async function getFaqs(): Promise<Faq[]> {
  return faqs;
}
