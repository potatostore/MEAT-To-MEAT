"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { errorMessage } from "@/lib/api/client";
import { getMyInquiries } from "@/lib/api/support";
import type { Inquiry } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

export function InquiryList() {
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyInquiries().then(setInquiries).catch((e) => setError(errorMessage(e)));
  }, []);

  return (
    <>
      <div className="page-header">
        <h1 className="display">1:1 문의 내역</h1>
        <Link href="/support/inquiry" className="btn-primary">
          새 문의 작성
        </Link>
      </div>
      {!inquiries ? (
        <div className="empty">{error ?? "불러오는 중…"}</div>
      ) : inquiries.length === 0 ? (
        <div className="empty">작성한 문의가 없습니다.</div>
      ) : (
        <div className="faq-list">
          {inquiries.map((q) => (
            <details key={q.id} className="faq">
              <summary>
                <span className={`badge${q.status === "ANSWERED" ? " badge-delivered" : ""}`}>
                  {q.status === "ANSWERED" ? "답변 완료" : "답변 대기"}
                </span>
                <span className="faq-q">
                  [{q.type}] {q.title}
                </span>
                <span className="hint">{formatDate(q.createdAt)}</span>
              </summary>
              <p>{q.content}</p>
              {q.answer && <p className="answer">{q.answer}</p>}
            </details>
          ))}
        </div>
      )}
    </>
  );
}
