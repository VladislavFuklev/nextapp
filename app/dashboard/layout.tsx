import type { ReactNode } from 'react';
import Header from '../../components/Header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <div className="mx-auto max-w-5xl p-4">{children}</div>
    </div>
  );
}
