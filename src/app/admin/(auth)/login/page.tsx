import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/auth-forms";
import { getAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  if (await getAdmin()) redirect(next?.startsWith("/admin") ? next : "/admin/");
  return (
    <>
      <h1 className="text-center text-xl font-extrabold text-ink">Admin sign in</h1>
      <p className="mb-6 mt-1 text-center text-sm text-ink-muted">Authorised organiser staff only.</p>
      <LoginForm next={next} />
    </>
  );
}
