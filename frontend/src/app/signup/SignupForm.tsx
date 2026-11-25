"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { errorMessage } from "@/lib/api/client";
import { signup } from "@/lib/api/members";
import type { Sex } from "@/lib/api/types";
import { SEX_LABEL } from "@/lib/format";

// MEM-03 회원가입: users 테이블의 필수 컬럼(login_id, user_pw, name, email, phone_number, sex, birthday)을 받는다
export function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    loginId: "",
    password: "",
    confirm: "",
    name: "",
    email: "",
    phone: "",
    sex: "NONE" as Sex,
    birthday: "",
  });
  const [agree, setAgree] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) return setError("비밀번호는 8자 이상이어야 합니다.");
    if (form.password !== form.confirm) return setError("비밀번호 확인이 일치하지 않습니다.");
    setPending(true);
    setError(null);
    try {
      await signup({
        loginId: form.loginId,
        password: form.password,
        name: form.name,
        email: form.email,
        phone: form.phone,
        sex: form.sex,
        birthday: form.birthday,
      });
      await login({ loginId: form.loginId, password: form.password });
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
        <span>아이디 (30자 이하)</span>
        <input value={form.loginId} onChange={set("loginId")} maxLength={30} autoComplete="username" required />
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
        <input value={form.name} onChange={set("name")} maxLength={50} autoComplete="name" required />
      </label>
      <label className="field">
        <span>이메일</span>
        <input type="email" value={form.email} onChange={set("email")} maxLength={100} autoComplete="email" required />
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
      <div className="form-grid">
        <label className="field">
          <span>성별</span>
          <select value={form.sex} onChange={set("sex")}>
            {(Object.keys(SEX_LABEL) as Sex[]).map((s) => (
              <option key={s} value={s}>
                {SEX_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>생년월일</span>
          <input type="date" value={form.birthday} onChange={set("birthday")} autoComplete="bday" required />
        </label>
      </div>
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
