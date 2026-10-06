import Link from "next/link";

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-mark">
            고기서<span>고기</span>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>쇼핑</h4>
              <Link href="/products">전체 상품</Link>
              <Link href="/deals">오늘의 특가</Link>
              <Link href="/#categories">카테고리</Link>
            </div>
            <div className="footer-col">
              <h4>고객지원</h4>
              <Link href="/mypage/orders">배송 조회</Link>
              <Link href="/support">자주 묻는 질문</Link>
              <Link href="/support/inquiry">1:1 문의</Link>
            </div>
            <div className="footer-col">
              <h4>회사</h4>
              <Link href="/about">소개</Link>
              <Link href="/about#team">팀 소개</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 고기서고기. 데이터베이스 설계 Term Project.</span>
          <span>강현찬 · 김민준 · 최한음</span>
        </div>
      </div>
    </footer>
  );
}
