import { API_BASE_URL, API_PROXY_PREFIX } from "./config";

const TOKEN_KEY = "m2m.accessToken";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const isServer = typeof window === "undefined";

export function getToken(): string | null {
  if (isServer) return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (isServer) return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // 저장소 접근이 막힌 환경에서는 무시
  }
}

type Query = Record<string, string | number | undefined | null>;

export function toQueryString(query?: Query): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Query;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query } = options;
  const base = isServer ? API_BASE_URL : API_PROXY_PREFIX;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${base}${path}${toQueryString(query)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해 주세요.");
  }

  if (!res.ok) {
    if (res.status === 401) setToken(null);
    let message = `요청에 실패했습니다. (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // 본문이 JSON이 아닌 경우 기본 메시지 사용
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "알 수 없는 오류가 발생했습니다.";
}
