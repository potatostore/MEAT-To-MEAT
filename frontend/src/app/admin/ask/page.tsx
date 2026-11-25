import type { Metadata } from "next";
import { AskConsole } from "./AskConsole";

export const metadata: Metadata = { title: "NL2SQL 관리자" };

export default function AdminAskPage() {
  return <AskConsole />;
}
