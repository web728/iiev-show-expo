import { SetPasswordForm } from "@/components/admin/auth-forms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Set password", referrer: "no-referrer" };

export default async function SetPasswordPage({ searchParams }: PageProps<"/admin/set-password">) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  const kind = sp.kind === "reset" ? "reset" : "invite";
  return (
    <>
      <h1 className="text-center text-xl font-extrabold text-ink">{kind === "reset" ? "Choose a new password" : "Welcome — set your password"}</h1>
      <p className="mb-6 mt-1 text-center text-sm text-ink-muted">This link can be used once.</p>
      {token ? <SetPasswordForm token={token} kind={kind} /> : <p className="text-center text-danger">Missing token.</p>}
    </>
  );
}
