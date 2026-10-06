"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { errorMessage } from "@/lib/api/client";
import { USE_MOCK } from "@/lib/api/config";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await login({ email, password });
      router.replace(next);
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <div className="hero-eyebrow">MEMBER</div>
      <h1 className="display">로그인</h1>
      <label className="field">
        <span>이메일</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </label>
      <label className="field">
        <span>비밀번호</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      {error && <p className="hint warn">{error}</p>}
      <button type="submit" className="btn-primary btn-block" disabled={pending}>
        {pending ? "로그인 중…" : "로그인"}
      </button>
      <p className="auth-foot">
        아직 회원이 아니신가요? <Link href={`/signup?next=${encodeURIComponent(next)}`}>회원가입</Link>
      </p>
      {USE_MOCK && (
        <p className="hint">
          데모 계정: <b>demo@meat.com</b> / <b>demo1234</b>
        </p>
      )}
    </form>
  );
}
