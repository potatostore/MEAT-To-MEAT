"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/lib/api/client";
import { createAddress, deleteAddress, getAddresses, updateAddress } from "@/lib/api/members";
import type { Address, AddressRequest } from "@/lib/api/types";

const blank: AddressRequest = {
  label: "",
  receiver: "",
  phone: "",
  zipcode: "",
  address1: "",
  address2: "",
  isDefault: false,
};

export function AddressBook() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<AddressRequest>(blank);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    try {
      setAddresses(await getAddresses());
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  useEffect(() => {
    getAddresses().then(setAddresses).catch((e) => setError(errorMessage(e)));
  }, []);

  function open(target: Address | "new") {
    setError(null);
    if (target === "new") {
      setEditing("new");
      setForm({ ...blank, isDefault: addresses?.length === 0 });
    } else {
      const { id, ...rest } = target;
      setEditing(id);
      setForm(rest);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing === "new") await createAddress(form);
      else if (editing !== null) await updateAddress(editing, form);
      setEditing(null);
      await reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function remove(id: number) {
    try {
      await deleteAddress(id);
      await reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const input = (key: Exclude<keyof AddressRequest, "isDefault">, required = true) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value }),
    required,
  });

  return (
    <>
      <div className="page-header">
        <h1 className="display">배송지 관리</h1>
        <p>자주 쓰는 배송지를 저장해 두면 주문서에서 바로 불러올 수 있어요.</p>
      </div>

      {!addresses ? (
        <div className="empty">{error ?? "불러오는 중…"}</div>
      ) : (
        <ul className="address-list">
          {addresses.map((a) => (
            <li key={a.id} className="panel">
              <div className="panel-head">
                <b>
                  {a.label} {a.isDefault && <span className="badge">기본 배송지</span>}
                </b>
                <span className="row-actions">
                  <button type="button" className="link-btn" onClick={() => open(a)}>
                    수정
                  </button>
                  <button type="button" className="link-btn" onClick={() => remove(a.id)}>
                    삭제
                  </button>
                </span>
              </div>
              <p>
                {a.receiver} · {a.phone}
              </p>
              <p className="hint">
                ({a.zipcode}) {a.address1} {a.address2}
              </p>
            </li>
          ))}
          {addresses.length === 0 && <div className="empty">저장된 배송지가 없습니다.</div>}
        </ul>
      )}

      {editing === null ? (
        <button type="button" className="btn-primary" onClick={() => open("new")}>
          + 새 배송지 추가
        </button>
      ) : (
        <form className="panel" onSubmit={save}>
          <h2 className="panel-title">{editing === "new" ? "새 배송지" : "배송지 수정"}</h2>
          <div className="form-grid">
            <label className="field">
              <span>배송지 이름</span>
              <input {...input("label")} placeholder="집, 회사 등" />
            </label>
            <label className="field">
              <span>받는 분</span>
              <input {...input("receiver")} />
            </label>
            <label className="field">
              <span>연락처</span>
              <input {...input("phone")} placeholder="010-0000-0000" />
            </label>
            <label className="field">
              <span>우편번호</span>
              <input {...input("zipcode")} />
            </label>
            <label className="field wide">
              <span>주소</span>
              <input {...input("address1")} />
            </label>
            <label className="field wide">
              <span>상세 주소</span>
              <input {...input("address2", false)} />
            </label>
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            기본 배송지로 설정
          </label>
          {error && <p className="hint warn">{error}</p>}
          <div className="row-actions">
            <button type="submit" className="btn-primary">
              저장
            </button>
            <button type="button" className="btn-outline" onClick={() => setEditing(null)}>
              취소
            </button>
          </div>
        </form>
      )}
    </>
  );
}
