import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const auth = await getCurrentUser();

  if (!auth) {
    redirect("/login");
  }

  if (!auth.user.wishesLocked) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
