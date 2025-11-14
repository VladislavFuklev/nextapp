'use client';

import { useEffect, useMemo, useState } from 'react';

type Rate = { r030: number; txt: string; rate: number; cc: string; exchangedate: string };

const CURRENCIES = ['USD', 'EUR', 'PLN', 'GBP'] as const;

type Props = {
  embedded?: boolean;
};

export default function CurrencyWidget({ embedded = false }: Props) {
  const [rates, setRates] = useState<Rate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/rates')
      .then((r) => r.json())
      .then((data: Rate[]) => {
        setRates(data);
        setError(null);
      })
      .catch(() => setError('Не удалось загрузить курсы'))
      .finally(() => setLoading(false));
  }, []);

  const map = useMemo(() => {
    const m = new Map<string, Rate>();
    rates?.forEach((r) => m.set(r.cc, r));
    return m;
  }, [rates]);

  const updated = rates?.[0]?.exchangedate ?? '';

  const content = (
    <>
      {!embedded ? (
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-base font-semibold">Курсы валют (НБУ)</h3>
          <span className="text-[10px] text-white/60">UAH • {updated}</span>
        </div>
      ) : (
        <div className="mb-2 text-right text-[10px] text-white/60">UAH • {updated}</div>
      )}
      {loading && <p className="text-white/70">Загрузка…</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CURRENCIES.map((cc) => (
            <div key={cc} className="rounded-lg bg-white/10 border border-white/10 p-2">
              <div className="text-[11px] text-white/60">{cc} → UAH</div>
              <div className="mt-0.5 text-lg font-semibold tabular-nums">
                {map.get(cc)?.rate?.toFixed(2) ?? '—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
  if (embedded) return content;
  return <div className="card p-3">{content}</div>;
}
