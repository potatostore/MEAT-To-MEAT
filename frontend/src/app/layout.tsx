import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "고기서고기",
  description: "정육 전문 온라인 마켓 고기서고기",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
