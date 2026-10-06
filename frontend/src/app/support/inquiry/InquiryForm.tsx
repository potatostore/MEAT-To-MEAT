"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { errorMessage } from "@/lib/api/client";
import { createInquiry } from "@/lib/api/support";

const TYPES = ["주문/결제", "배송", "상품", "교환/환불", "회원", "기타"];

export function InquiryForm({ orderId }: { orderId: number | null }) {
  const router = useRouter();
  const [type, setType] = useState(orderId ? "주문/결제" : TYPES[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await createInquiry({ type, title, content, orderId });
      router.push("/mypage/inquiries");
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  }

  return (
    <form className="panel" onSubmit={submit}>
      {orderId && <p className="hint">주문 #{orderId} 에 대한 문의입니다.</p>}
      <label className="field">
        <span>문의 유형</span>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>제목</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} required />
      </label>
      <label className="field">
        <span>내용</span>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} maxLength={2000} required />
      </label>
      {error && <p className="hint warn">{error}</p>}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "등록 중…" : "문의 등록"}
      </button>
    </form>
  );
}
