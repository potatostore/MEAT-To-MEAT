// NL2SQL 서비스 호출 (관리자 페이지 /admin/ask 전용)
// next.config.ts 의 rewrites 로 /nl2sql/* → NL2SQL 서비스(기본 http://localhost:8000)로 전달된다.
// 백엔드 API와 달리 401이 와도 로그인 토큰을 지우지 않는다. (NL2SQL 쪽 문제로 로그아웃되면 안 되므로)
import { getToken } from "./client";

export const NL2SQL_PREFIX = "/nl2sql";

export type Nl2sqlMode = "simple" | "rich";

export interface Nl2sqlAnswer {
  question: string;
  mode: Nl2sqlMode;
  sql: string | null;
  columns: string[];
  rows: (string | number | boolean | null)[][];
  error: string | null;
  elapsed_ms: number | null;
}

export interface Nl2sqlMe {
  admin: boolean;
  loginId: string | null;
  authRequired: boolean;
}

export interface Nl2sqlSamples {
  today: string;
  provider: string;
  model: string;
  questions: { id: string; level: number; question: string }[];
}

export class Nl2sqlError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "Nl2sqlError";
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.body) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${NL2SQL_PREFIX}${path}`, { ...init, headers, cache: "no-store" });
  } catch {
    throw new Nl2sqlError(0, "NL2SQL 서비스에 연결할 수 없습니다.");
  }

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }

  if (!res.ok) {
    const detail = (data as { detail?: unknown } | undefined)?.detail;
    // 프록시 대상(NL2SQL 컨테이너)이 꺼져 있으면 Next가 JSON이 아닌 500을 돌려준다
    const message =
      typeof detail === "string"
        ? detail
        : data === undefined
          ? "NL2SQL 서비스가 실행 중이 아닙니다."
          : `요청에 실패했습니다. (${res.status})`;
    throw new Nl2sqlError(data === undefined ? 0 : res.status, message);
  }
  return data as T;
}

export const getNl2sqlMe = () => call<Nl2sqlMe>("/me");
export const getNl2sqlSamples = () => call<Nl2sqlSamples>("/samples");
export const askNl2sql = (question: string, mode: Nl2sqlMode) =>
  call<Nl2sqlAnswer>("/ask", { method: "POST", body: JSON.stringify({ question, mode }) });
