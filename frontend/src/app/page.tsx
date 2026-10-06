import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <div className="hero-eyebrow">정육 전문 온라인 마켓</div>
          <h1 className="display">
            어디서든
            <br />
            <span className="stamp">고기서고기</span>
          </h1>
          <p className="lede">
            이름부터 고기, 시작부터 고기. 산지 직송 정육을 오늘 주문하면 내일 아침 문 앞에
            도착합니다. 등급, 부위, 손질 상태까지 전부 투명하게 보여드려요.
          </p>
          <div className="hero-actions">
            <Link href="/products" className="btn-primary">
              지금 둘러보기
            </Link>
            <Link href="/deals" className="btn-ghost">
              오늘의 특가 보기
            </Link>
          </div>
        </div>
        <div className="seal-wrap">
          <div className="seal">
            <div className="seal-text">
              <div className="big display">
                직송
                <br />
                보증
              </div>
              <div className="small">SINCE TERM PROJECT</div>
            </div>
            <div className="seal-badge">냉장 당일 포장</div>
          </div>
        </div>
      </section>

      <div className="ticker">
        <div className="ticker-track">
          <span>한우 1++ 등심 신규 입고</span>
          <span>제주 흑돼지 삼겹살 특가</span>
          <span>전 상품 당일 도축 원육 사용</span>
          <span>전국 새벽배송 가능 지역 확대</span>
          <span>한우 1++ 등심 신규 입고</span>
          <span>제주 흑돼지 삼겹살 특가</span>
          <span>전 상품 당일 도축 원육 사용</span>
          <span>전국 새벽배송 가능 지역 확대</span>
        </div>
      </div>

      <section className="section" id="categories">
        <div className="section-head">
          <h2 className="display">부위별로 골라보기</h2>
          <p>카테고리마다 손질 방식과 추천 조리법이 다릅니다. 필요한 부위만 정확하게 담으세요.</p>
        </div>
        <div className="tags">
          <Link href="/products?category=HANWOO" className="tag">
            <div className="kind">한우</div>
            <h3 className="display">등심 · 안심</h3>
            <div className="desc">1++ 등급 구이용, 진공 개별 포장</div>
            <div className="price">
              32,900원 <small>/ 300g</small>
            </div>
          </Link>
          <Link href="/products?category=PORK" className="tag">
            <div className="kind">돼지고기</div>
            <h3 className="display">삼겹 · 목살</h3>
            <div className="desc">국내산 냉장, 두께 선택 가능</div>
            <div className="price">
              14,500원 <small>/ 500g</small>
            </div>
          </Link>
          <Link href="/products?category=CHICKEN" className="tag">
            <div className="kind">닭고기</div>
            <h3 className="display">닭가슴살</h3>
            <div className="desc">손질 완료, 소분 냉동 포장</div>
            <div className="price">
              9,900원 <small>/ 1kg</small>
            </div>
          </Link>
          <Link href="/products?category=IMPORTED" className="tag">
            <div className="kind">수입육</div>
            <h3 className="display">호주산 척아이롤</h3>
            <div className="desc">그릴·스테이크용 두께 절단</div>
            <div className="price">
              18,900원 <small>/ 400g</small>
            </div>
          </Link>
        </div>
      </section>

      <section className="section split">
        <div className="butcher-grid">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div>
          <h2>
            이름은 장난 같아도,
            <br />
            재고 관리는 진지합니다
          </h2>
          <p>
            상품, 장바구니, 주문, 회원 정보까지 — 모든 데이터가 서로 정확히 맞물려 돌아가도록
            설계했습니다. 어떤 부위를 몇 그램 담았는지, 배송은 어디까지 왔는지 한눈에
            확인하세요.
          </p>
          <div className="stat-row">
            <div className="stat">
              <b>320+</b>
              <span>등록 상품 수</span>
            </div>
            <div className="stat">
              <b>4</b>
              <span>대표 카테고리</span>
            </div>
            <div className="stat">
              <b>24h</b>
              <span>평균 배송 시간</span>
            </div>
          </div>
          <div className="cutline">
            <span>PART 01 — 회원관리</span>
            <span>PART 02 — 장바구니 · 주문</span>
          </div>
        </div>
      </section>
    </>
  );
}
