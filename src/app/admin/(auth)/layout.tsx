import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center bg-brand-navy px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl">
        <Image src="/brand/iiev-9th-edition-logo-trimmed.png" alt="India International EV Show" width={1538} height={734} className="mx-auto h-14 w-auto" sizes="120px" priority />
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
