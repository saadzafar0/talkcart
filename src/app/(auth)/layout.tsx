import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {/* Simple top bar */}
      <div className="border-b border-neutral-200 bg-primary-900">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="TalkCart Logo"
              width={20}
              height={20}
              className="h-5 w-5 object-contain rounded-lg"
            />
            <span className="text-lg font-bold text-neutral-50">
              TalkCart
            </span>
          </Link>
        </div>
      </div>

      {/* Centered content */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  );
}
