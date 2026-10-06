"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { errorMessage, setToken } from "@/lib/api/client";
import { changePassword, updateMe, withdraw } from "@/lib/api/members";
import { formatDate } from "@/lib/format";

type Notice = { ok: boolean; text: string } | null;

export function ProfileForms() {
  const router = useRouter();
  const { member, setMember } = useAuth();
  const [profile, setProfile] = useState({ name: member?.name ?? "", phone: member?.phone ?? "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [profileNotice, setProfileNotice] = useState<Notice>(null);
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);
  const [withdrawText, setWithdrawText] = useState("");
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  if (!member) return null;

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      setMember(await updateMe(profile));
      setProfileNotice({ ok: true, text: "회원 정보가 저장되었습니다." });
    } catch (err) {
      setProfileNotice({ ok: false, text: errorMessage(err) });
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.newPassword.length < 8) {
      return setPasswordNotice({ ok: false, text: "새 비밀번호는 8자 이상이어야 합니다." });
    }
    if (passwords.newPassword !== passwords.confirm) {
      return setPasswordNotice({ ok: false, text: "새 비밀번호 확인이 일치하지 않습니다." });
    }
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
      setPasswordNotice({ ok: true, text: "비밀번호가 변경되었습니다." });
    } catch (err) {
      setPasswordNotice({ ok: false, text: errorMessage(err) });
    }
  }

  async function doWithdraw() {
    try {
      await withdraw();
      setToken(null);
      setMember(null);
      router.replace("/");
    } catch (err) {
      setWithdrawError(errorMessage(err));
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="display">회원 정보</h1>
        <p>가입일 {formatDate(member.createdAt)}</p>
      </div>

      <form className="panel" onSubmit={saveProfile}>
        <h2 className="panel-title">기본 정보</h2>
        <div className="form-grid">
          <label className="field wide">
            <span>이메일 (변경 불가)</span>
            <input value={member.email} disabled />
          </label>
          <label className="field">
            <span>이름</span>
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
          </label>
          <label className="field">
            <span>휴대폰 번호</span>
            <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} required />
          </label>
        </div>
        {profileNotice && <p className={`hint ${profileNotice.ok ? "ok" : "warn"}`}>{profileNotice.text}</p>}
        <button type="submit" className="btn-primary">
          저장
        </button>
      </form>

      <form className="panel" onSubmit={savePassword}>
        <h2 className="panel-title">비밀번호 변경</h2>
        <div className="form-grid">
          <label className="field wide">
            <span>현재 비밀번호</span>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              autoComplete="current-password"
              required
            />
          </label>
          <label className="field">
            <span>새 비밀번호</span>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              autoComplete="new-password"
              required
            />
          </label>
          <label className="field">
            <span>새 비밀번호 확인</span>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              autoComplete="new-password"
              required
            />
          </label>
        </div>
        {passwordNotice && <p className={`hint ${passwordNotice.ok ? "ok" : "warn"}`}>{passwordNotice.text}</p>}
        <button type="submit" className="btn-primary">
          비밀번호 변경
        </button>
      </form>

      <section className="panel danger-zone">
        <h2 className="panel-title">회원 탈퇴</h2>
        <p className="hint">탈퇴하면 주문 내역과 배송지 정보가 모두 삭제되며 복구할 수 없습니다.</p>
        <label className="field">
          <span>확인을 위해 &lsquo;탈퇴&rsquo;를 입력하세요</span>
          <input value={withdrawText} onChange={(e) => setWithdrawText(e.target.value)} />
        </label>
        {withdrawError && <p className="hint warn">{withdrawError}</p>}
        <button type="button" className="btn-danger" disabled={withdrawText !== "탈퇴"} onClick={doWithdraw}>
          회원 탈퇴
        </button>
      </section>
    </>
  );
}
