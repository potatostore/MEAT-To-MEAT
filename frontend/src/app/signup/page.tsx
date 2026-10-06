import type { Metadata } from "next";
import { safeNext } from "@/lib/safe-next";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "회원가입" };

export default async function SignupPage(props: PageProps<"/signup">) {
  const { next } = await props.searchParams;
  return (
    <div className="section auth-wrap">
      <SignupForm next={safeNext(next)} />
    </div>
  );
}
