'use client';

import dynamic from 'next/dynamic';

const CryptoLiveTickerWidget = dynamic(
  () => import('../../components/widgets/CryptoLiveTickerWidget'),
);

export default function WidgetsClient() {
  return (
    <section className="mx-auto max-w-6xl p-4 grid gap-4">
      <div className="justify-self-center w-full">
        <CryptoLiveTickerWidget />
      </div>
    </section>
  );
}
