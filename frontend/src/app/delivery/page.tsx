import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { won } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/policy";

export const metadata: Metadata = { title: "배송 안내" };

const steps = [
  { time: "~ 15:00", title: "주문 마감", desc: "평일 오후 3시까지 결제된 주문은 당일 손질에 들어갑니다." },
  { time: "15:00 ~ 20:00", title: "손질 · 포장", desc: "선택한 두께로 절단 후 진공 포장, 아이스팩과 함께 냉장 박스에 담습니다." },
  { time: "22:00", title: "출고", desc: "냉장 차량으로 권역별 물류센터에 이동합니다." },
  { time: "~ 07:00", title: "문 앞 도착", desc: "다음 날 아침 7시 전, 문 앞에 도착하면 알림을 보내드려요." },
];

export default function DeliveryPage() {
  return (
    <div className="section">
      <PageHeader
        eyebrow="DELIVERY"
        title="배송 안내"
        description="오늘 주문하면 내일 아침 문 앞에. 냉장 상태 그대로 도착하도록 관리합니다."
      />

      <ol className="timeline">
        {steps.map((s, i) => (
          <li key={s.title} className="tag">
            <div className="kind">
              STEP {String(i + 1).padStart(2, "0")} · {s.time}
            </div>
            <h3 className="display">{s.title}</h3>
            <div className="desc">{s.desc}</div>
          </li>
        ))}
      </ol>

      <div className="two-col">
        <section className="panel">
          <h2 className="panel-title">배송비</h2>
          <dl className="spec">
            <dt>기본 배송비</dt>
            <dd>{won(SHIPPING_FEE)}</dd>
            <dt>무료 배송</dt>
            <dd>{won(FREE_SHIPPING_THRESHOLD)} 이상 구매 시</dd>
            <dt>도서 · 산간</dt>
            <dd>새벽배송 불가, 택배로 1~2일 소요</dd>
          </dl>
        </section>
        <section className="panel">
          <h2 className="panel-title">포장 · 보관</h2>
          <dl className="spec">
            <dt>냉장 상품</dt>
            <dd>0~4℃ 보관, 수령 후 5일 이내 섭취 권장</dd>
            <dt>냉동 상품</dt>
            <dd>-18℃ 이하 보관, 해동 후 재냉동 금지</dd>
            <dt>포장재</dt>
            <dd>종이 박스 · 재사용 아이스팩</dd>
          </dl>
        </section>
      </div>

      <div className="row-actions">
        <Link href="/mypage/orders" className="btn-primary">
          내 주문 배송 조회
        </Link>
        <Link href="/support" className="btn-ghost">
          자주 묻는 질문
        </Link>
      </div>
    </div>
  );
}
