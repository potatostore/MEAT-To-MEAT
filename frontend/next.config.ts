import type { NextConfig } from "next";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8080";
// NL2SQL 서비스 (관리자 페이지 /admin/ask 에서 사용). docker compose에서는 http://nl2sql:8000
const NL2SQL_BASE_URL = process.env.NL2SQL_BASE_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_BASE_URL}/:path*` },
      { source: "/nl2sql/:path*", destination: `${NL2SQL_BASE_URL}/:path*` },
    ];
  },
};

export default nextConfig;
