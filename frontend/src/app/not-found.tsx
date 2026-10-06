import Link from "next/link";

export default function NotFound() {
  return (
    <div className="section empty-page">
      <div className="hero-eyebrow">404</div>
      <h1 className="display">찾으시는 페이지가 없어요</h1>
      <p>주소가 바뀌었거나 판매가 종료된 상품일 수 있습니다.</p>
      <div className="hero-actions">
        <Link href="/" className="btn-primary">
          홈으로
        </Link>
        <Link href="/products" className="btn-ghost">
          전체 상품 보기
        </Link>
      </div>
    </div>
  );
}
