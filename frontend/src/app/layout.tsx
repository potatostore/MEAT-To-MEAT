import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "고기서고기",
    template: "%s | 고기서고기",
  },
  description: "정육 전문 온라인 마켓 고기서고기",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <SiteNav />
          <main className="site-main">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
