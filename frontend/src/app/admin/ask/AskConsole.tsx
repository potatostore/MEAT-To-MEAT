"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  askNl2sql,
  getNl2sqlMe,
  getNl2sqlSamples,
  Nl2sqlError,
  type Nl2sqlAnswer,
  type Nl2sqlMode,
  type Nl2sqlSamples,
} from "@/lib/api/nl2sql";
import styles from "./ask.module.css";

type Gate = "checking" | "ok" | "denied" | "login" | "down";

interface Slot {
  loading: boolean;
  answer: Nl2sqlAnswer | null;
  failure: string | null; // 요청 자체가 실패한 경우 (네트워크, 권한)
}

const EMPTY: Slot = { loading: false, answer: null, failure: null };

const MODES: { mode: Nl2sqlMode; name: string; desc: string }[] = [
  { mode: "simple", name: "Simple", desc: "테이블·컬럼 이름만 알려 준 프롬프트" },
  { mode: "rich", name: "보강", desc: "키·관계, 코드 값, 업무 용어 정의까지 알려 준 프롬프트" },
];

const LEVEL_LABEL: Record<number, string> = { 1: "단일 테이블", 2: "JOIN · 집계", 3: "업무 규칙" };

function normalizeRows(a: Nl2sqlAnswer) {
  return a.rows
    .map((r) => r.map((v) => (typeof v === "number" ? String(Math.round(v * 100) / 100) : String(v))).join("\u0001"))
    .sort()
    .join("\u0002");
}

export function AskConsole() {
  const [gate, setGate] = useState<Gate>("checking");
  const [gateMsg, setGateMsg] = useState("");
  const [samples, setSamples] = useState<Nl2sqlSamples | null>(null);
  const [level, setLevel] = useState(3);
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState<string | null>(null);
  const [slots, setSlots] = useState<Record<Nl2sqlMode, Slot>>({ simple: EMPTY, rich: EMPTY });
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    getNl2sqlMe()
      .then((me) => {
        setGate(me.admin ? "ok" : "denied");
        if (!me.admin) setGateMsg(`${me.loginId} 계정은 관리자로 등록되어 있지 않습니다.`);
      })
      .catch((e: unknown) => {
        const err = e instanceof Nl2sqlError ? e : new Nl2sqlError(0, "알 수 없는 오류");
        setGate(err.status === 401 ? "login" : err.status === 403 ? "denied" : "down");
        setGateMsg(err.message);
      });
    getNl2sqlSamples().then(setSamples).catch(() => setSamples(null));
  }, []);

  const busy = slots.simple.loading || slots.rich.loading;

  async function ask(q: string) {
    const text = q.trim();
    if (!text || busy) return;
    setQuestion(text);
    setAsked(text);
    setHistory((h) => [text, ...h.filter((x) => x !== text)].slice(0, 6));
    setSlots({ simple: { ...EMPTY, loading: true }, rich: { ...EMPTY, loading: true } });
    // 두 방식을 동시에 보낸다. 먼저 끝난 쪽부터 화면에 나온다.
    await Promise.all(
      MODES.map(async ({ mode }) => {
        let next: Slot;
        try {
          next = { loading: false, answer: await askNl2sql(text, mode), failure: null };
        } catch (e) {
          next = { loading: false, answer: null, failure: e instanceof Error ? e.message : "요청 실패" };
        }
        setSlots((s) => ({ ...s, [mode]: next }));
      }),
    );
  }

  const verdict = useMemo(() => {
    const a = slots.simple.answer;
    const b = slots.rich.answer;
    if (!a || !b || busy) return null;
    if (a.error || b.error) return { tone: "warn", text: "한쪽 이상이 실행에 실패했습니다" };
    if (normalizeRows(a) === normalizeRows(b)) return { tone: "same", text: "두 방식의 결과가 같습니다" };
    return { tone: "diff", text: "두 방식의 결과가 다릅니다. 업무 규칙을 해석한 차이를 확인해 보세요" };
  }, [slots, busy]);

  if (gate === "checking") return <div className="empty">관리자 권한 확인 중…</div>;
  if (gate !== "ok") {
    return (
      <div className={`empty ${styles.gate}`}>
        <b>
          {gate === "denied"
            ? "관리자만 사용할 수 있는 화면입니다"
            : gate === "login"
              ? "다시 로그인해 주세요"
              : "NL2SQL 서비스에 연결할 수 없습니다"}
        </b>
        <p className="hint">{gateMsg}</p>
        {gate === "down" && (
          <p className="hint">
            <code>docker compose --profile full --profile nl2sql up -d</code> 로 NL2SQL 컨테이너를 함께 띄웠는지 확인하세요.
          </p>
        )}
        <Link href={gate === "login" ? "/login?next=/admin/ask" : "/"} className="btn-primary">
          {gate === "login" ? "로그인" : "홈으로"}
        </Link>
      </div>
    );
  }

  const levelQuestions = samples?.questions.filter((q) => q.level === level) ?? [];

  return (
    <>
      <PageHeader
        eyebrow="관리자 · NL2SQL"
        title="말로 묻고, SQL로 답합니다"
        description="같은 질문을 두 가지 프롬프트로 LLM에 보내 생성된 SQL과 실행 결과를 나란히 비교합니다. SQL은 조회 전용 계정으로만 실행됩니다."
      >
        {samples && (
          <div className={styles.meta}>
            <span>
              모델 <b>{samples.model}</b>
            </span>
            <span>
              기준일 <b>{samples.today}</b>
            </span>
          </div>
        )}
      </PageHeader>

      <form
        className={styles.askBox}
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <label htmlFor="nl2sql-q" className={styles.askLabel}>
          질문
        </label>
        <div className={styles.askRow}>
          <input
            id="nl2sql-q"
            value={question}
            maxLength={300}
            placeholder="예: 지난달 매출이 얼마야?"
            onChange={(e) => setQuestion(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="btn-primary" disabled={busy || !question.trim()}>
            {busy ? "생성 중…" : "물어보기"}
          </button>
        </div>

        {samples && (
          <div className={styles.samples}>
            <div className={styles.levelTabs} role="tablist">
              {[1, 2, 3].map((lv) => (
                <button
                  key={lv}
                  type="button"
                  role="tab"
                  aria-selected={level === lv}
                  className={level === lv ? styles.on : undefined}
                  onClick={() => setLevel(lv)}
                >
                  Level {lv} <small>{LEVEL_LABEL[lv]}</small>
                </button>
              ))}
            </div>
            <div className="chips">
              {levelQuestions.map((q) => (
                <button key={q.id} type="button" className="chip" disabled={busy} onClick={() => ask(q.question)}>
                  {q.question}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <p className={styles.history}>
            최근 질문{" "}
            {history.map((h) => (
              <button key={h} type="button" className="link-btn" disabled={busy} onClick={() => ask(h)}>
                {h}
              </button>
            ))}
          </p>
        )}
      </form>

      {asked && (
        <>
          <div className={styles.askedLine}>
            <span>Q.</span> {asked}
            {verdict && <em className={styles[verdict.tone]}>{verdict.text}</em>}
          </div>
          <div className={styles.compare}>
            {MODES.map(({ mode, name, desc }) => (
              <ResultCard key={mode} name={name} desc={desc} slot={slots[mode]} accent={mode === "rich"} />
            ))}
          </div>
        </>
      )}

      {!asked && (
        <div className="empty">
          <p>위에서 질문을 입력하거나 예시 질문을 눌러 보세요.</p>
          <p className="hint">Level 3 질문에서 두 방식의 차이가 가장 크게 드러납니다.</p>
        </div>
      )}
    </>
  );
}

function ResultCard({ name, desc, slot, accent }: { name: string; desc: string; slot: Slot; accent: boolean }) {
  const [copied, setCopied] = useState(false);
  const a = slot.answer;
  const error = slot.failure ?? a?.error ?? null;

  return (
    <section className={`${styles.card} ${accent ? styles.accent : ""}`} aria-busy={slot.loading}>
      <header className={styles.cardHead}>
        <div>
          <h2>{name}</h2>
          <p>{desc}</p>
        </div>
        {slot.loading ? (
          <span className={styles.status}>생성 중</span>
        ) : error ? (
          <span className={`${styles.status} ${styles.bad}`}>실패</span>
        ) : a ? (
          <span className={`${styles.status} ${styles.good}`}>
            {a.rows.length}행{a.elapsed_ms != null && ` · ${(a.elapsed_ms / 1000).toFixed(1)}초`}
          </span>
        ) : null}
      </header>

      {slot.loading ? (
        <div className={styles.skeleton} aria-label="불러오는 중">
          <i />
          <i />
          <i />
        </div>
      ) : (
        <>
          {a?.sql && (
            <div className={styles.sqlWrap}>
              <div className={styles.sqlBar}>
                <span>생성된 SQL</span>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    navigator.clipboard?.writeText(a.sql ?? "").then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    });
                  }}
                >
                  {copied ? "복사됨" : "복사"}
                </button>
              </div>
              <pre className={styles.sql}>
                <code>{a.sql}</code>
              </pre>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          {a && !a.error && (
            <div className={styles.tableWrap}>
              {a.rows.length === 0 ? (
                <p className={styles.noRows}>결과 없음 (0행)</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {a.columns.map((c, i) => (
                        <th key={i}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {a.rows.map((r, i) => (
                      <tr key={i}>
                        {r.map((v, j) => (
                          <td key={j} className={typeof v === "number" ? styles.num : undefined}>
                            {v === null ? <span className={styles.null}>NULL</span> : typeof v === "number" ? v.toLocaleString("ko-KR") : String(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
