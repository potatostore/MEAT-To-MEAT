"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { errorMessage } from "@/lib/api/client";
import { signup } from "@/lib/api/members";

export function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", confirm: "", name: "", phone: "" });
  const [agree, setAgree] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) return setError("비밀번호는 8자 이상이어야 합니다.");
    if (form.password !== form.confirm) return setError("비밀번호 확인이 일치하지 않습니다.");
    setPending(true);
    setError(null);
    try {
      await signup({ email: form.email, password: form.password, name: form.name, phone: form.phone });
      await login({ email: form.email, password: form.password });
      router.replace(next);
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <div className="hero-eyebrow">MEMBER</div>
      <h1 className="display">회원가입</h1>
      <label className="field">
        <span>이메일</span>
        <input type="email" value={form.email} onChange={set("email")} autoComplete="email" required />
      </label>
      <label className="field">
        <span>비밀번호 (8자 이상)</span>
        <input type="password" value={form.password} onChange={set("password")} autoComplete="new-password" required />
      </label>
      <label className="field">
        <span>비밀번호 확인</span>
        <input type="password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" required />
      </label>
      <label className="field">
        <span>이름</span>
        <input value={form.name} onChange={set("name")} autoComplete="name" required />
      </label>
      <label className="field">
        <span>휴대폰 번호</span>
        <input
          type="tel"
          value={form.phone}
          onChange={set("phone")}
          placeholder="010-0000-0000"
          pattern="01[0-9]-?[0-9]{3,4}-?[0-9]{4}"
          autoComplete="tel"
          required
        />
      </label>
      <label className="check">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        이용약관 및 개인정보 수집·이용에 동의합니다.
      </label>
      {error && <p className="hint warn">{error}</p>}
      <button type="submit" className="btn-primary btn-block" disabled={!agree || pending}>
        {pending ? "가입 중…" : "가입하기"}
      </button>
      <p className="auth-foot">
        이미 회원이신가요? <Link href={`/login?next=${encodeURIComponent(next)}`}>로그인</Link>
      </p>
    </form>
  );
}
