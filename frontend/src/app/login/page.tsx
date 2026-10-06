import type { Metadata } from "next";
import { safeNext } from "@/lib/safe-next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage(props: PageProps<"/login">) {
  const { next } = await props.searchParams;
  return (
    <div className="section auth-wrap">
      <LoginForm next={safeNext(next)} />
    </div>
  );
}
