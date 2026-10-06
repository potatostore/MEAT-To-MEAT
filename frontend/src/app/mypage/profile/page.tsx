import type { Metadata } from "next";
import { ProfileForms } from "./ProfileForms";

export const metadata: Metadata = { title: "회원 정보" };

export default function ProfilePage() {
  return <ProfileForms />;
}
