import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { PageHeader } from "@/components/PageHeader";
import { getFaqs } from "@/lib/api/support";

export const metadata: Metadata = { title: "고객센터" };

export default async function SupportPage() {
  await connection(); // FAQ 는 백엔드에서 요청 시점에 조회
  const faqs = await getFaqs();
  const groups = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="section">
      <PageHeader eyebrow="SUPPORT" title="고객센터" description="궁금한 점을 먼저 확인해 보시고, 해결되지 않으면 1:1 문의를 남겨 주세요.">
        <div className="hero-actions">
          <Link href="/support/inquiry" className="btn-primary">
            1:1 문의하기
          </Link>
          <Link href="/mypage/inquiries" className="btn-ghost">
            내 문의 내역
          </Link>
        </div>
      </PageHeader>

      <div className="support-info">
        <div className="stat">
          <b>1588-0000</b>
          <span>평일 09:00 – 18:00 (점심 12:00 – 13:00)</span>
        </div>
        <div className="stat">
          <b>help@meat.com</b>
          <span>이메일 문의는 24시간 접수</span>
        </div>
      </div>

      <h2 className="display support-title" id="faq">
        자주 묻는 질문
      </h2>
      {groups.map((group) => (
        <section key={group} className="faq-group">
          <h3 className="kind">{group}</h3>
          <div className="faq-list">
            {faqs
              .filter((f) => f.category === group)
              .map((f) => (
                <details key={f.id} className="faq">
                  <summary>
                    <span className="faq-q">Q. {f.question}</span>
                  </summary>
                  <p>{f.answer}</p>
                </details>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
