import { ForgotForm } from "@/components/admin/auth-forms";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-center text-xl font-extrabold text-ink">Reset password</h1>
      <p className="mb-6 mt-1 text-center text-sm text-ink-muted">We&apos;ll email a one-time link if email delivery is configured. Otherwise ask a Super Admin to generate a reset link.</p>
      <ForgotForm />
    </>
  );
}
