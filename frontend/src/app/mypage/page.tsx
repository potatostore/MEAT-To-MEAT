import type { Metadata } from "next";
import { MypageHome } from "./MypageHome";

export const metadata: Metadata = { title: "마이페이지" };

export default function MypagePage() {
  return <MypageHome />;
}
