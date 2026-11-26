import { RequireAuth } from "@/components/RequireAuth";

// 관리자 화면. 로그인은 여기서 확인하고, 관리자 여부는 NL2SQL 서비스가 백엔드에 물어 확인한다.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="section">
      <RequireAuth>{children}</RequireAuth>
    </div>
  );
}
