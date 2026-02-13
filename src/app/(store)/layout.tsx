import { Navbar } from '@/core/components/layout/Navbar';
import { Footer } from '@/core/components/layout/Footer';
import { ChatWidget } from '@/features/chat/components/ChatWidget';

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
