import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "소개" };

// TODO: 팀원별 담당 역할(desc)을 채워 주세요.
const team = [
  { name: "강현찬", desc: "" },
  { name: "김민준", desc: "" },
  { name: "최한음", desc: "" },
];

export default function AboutPage() {
  return (
    <div className="section">
      <PageHeader
        eyebrow="ABOUT"
        title="이름은 장난 같아도, 재고 관리는 진지합니다"
        description="고기서고기는 데이터베이스 설계 Term Project로 만든 정육 전문 온라인 마켓입니다. 상품, 장바구니, 주문, 회원 정보가 서로 정확히 맞물리도록 ERD부터 설계했습니다."
      />

      <div className="split about-split">
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
          <h2>설계 원칙</h2>
          <p>
            어떤 부위를 몇 그램 담았는지, 주문 시점의 가격은 얼마였는지, 배송은 어디까지 왔는지 —
            화면에 보이는 모든 숫자가 데이터베이스의 한 행과 정확히 연결되도록 만들었습니다.
          </p>
          <div className="cutline">
            <span>PART 01 — 회원관리</span>
            <span>PART 02 — 장바구니 · 주문</span>
          </div>
          <div className="stat-row">
            <div className="stat">
              <b>Next.js</b>
              <span>프론트엔드</span>
            </div>
            <div className="stat">
              <b>Spring</b>
              <span>백엔드 API</span>
            </div>
            <div className="stat">
              <b>MySQL</b>
              <span>데이터베이스</span>
            </div>
          </div>
        </div>
      </div>

      <section className="detail-section" id="team">
        <h2 className="display">팀 소개</h2>
        <div className="tags team-grid">
          {team.map((m) => (
            <div key={m.name} className="tag">
              <div className="kind">TEAM MEMBER</div>
              <h3 className="display">{m.name}</h3>
              {m.desc && <div className="desc">{m.desc}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
