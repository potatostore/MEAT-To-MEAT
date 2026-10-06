import { MypageNav } from "@/components/MypageNav";
import { RequireAuth } from "@/components/RequireAuth";

export default function MypageLayout({ children }: LayoutProps<"/mypage">) {
  return (
    <div className="section">
      <RequireAuth>
        <div className="mypage">
          <MypageNav />
          <div className="mypage-body">{children}</div>
        </div>
      </RequireAuth>
    </div>
  );
}
