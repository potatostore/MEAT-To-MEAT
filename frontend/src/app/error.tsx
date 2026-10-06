"use client";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="section empty-page">
      <div className="hero-eyebrow">ERROR</div>
      <h1 className="display">잠시 문제가 생겼어요</h1>
      <p>{error.message || "요청을 처리하지 못했습니다."}</p>
      <div className="hero-actions">
        <button type="button" className="btn-primary" onClick={retry}>
          다시 시도
        </button>
      </div>
    </div>
  );
}
