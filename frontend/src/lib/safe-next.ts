// 로그인 후 이동할 경로. 외부 URL 로의 오픈 리다이렉트를 막기 위해 내부 경로만 허용한다.
export function safeNext(value: string | string[] | undefined, fallback = "/"): string {
  const next = Array.isArray(value) ? value[0] : value;
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
