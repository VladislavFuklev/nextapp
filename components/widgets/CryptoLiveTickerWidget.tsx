'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { buildBinanceCombinedStream } from '../../lib/urls';

type TSymbol = 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT' | 'BNBUSDT';

type Ticker = {
  price: number | null;
  prev: number | null;
  dir: 'up' | 'down' | 'same';
  history: number[];
  updatedAt?: number;
};

const symbols: TSymbol[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];

export default function CryptoLiveTickerWidget() {
  const [tickers, setTickers] = useState<Record<TSymbol, Ticker>>({
    BTCUSDT: { price: null, prev: null, dir: 'same', history: [] },
    ETHUSDT: { price: null, prev: null, dir: 'same', history: [] },
    SOLUSDT: { price: null, prev: null, dir: 'same', history: [] },
    BNBUSDT: { price: null, prev: null, dir: 'same', history: [] },
  });
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<number>(0);

  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState<TSymbol[]>([...symbols]);

  // Подключение/переподключение при изменении списка видимых символов или паузе
  useEffect(() => {
    if (paused || visible.length === 0) {
      wsRef.current?.close();
      wsRef.current = null;
      setConnected(false);
      return;
    }

    let closed = false;

    const connect = () => {
      const url = buildBinanceCombinedStream(visible);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.addEventListener('open', () => {
        setConnected(true);
        retryRef.current = 0;
      });
      ws.addEventListener('close', () => {
        setConnected(false);
        if (!closed) scheduleReconnect();
      });
      ws.addEventListener('error', () => {
        setConnected(false);
        try {
          ws.close();
        } catch {}
      });
      ws.addEventListener('message', (ev) => {
        try {
          const msg = JSON.parse(ev.data as string) as {
            stream?: string;
            data?: { s?: string; p?: string };
          };
          const sym = (msg?.data?.s ?? '').toUpperCase() as TSymbol;
          const priceStr = msg?.data?.p;
          if (!symbols.includes(sym) || !priceStr) return;
          const price = Number(priceStr);
          setTickers((prev) => {
            const old = prev[sym];
            const dir: Ticker['dir'] =
              old.price == null
                ? 'same'
                : price > (old.price ?? 0)
                  ? 'up'
                  : price < (old.price ?? 0)
                    ? 'down'
                    : 'same';
            const histMax = 120; // ~120 тиков
            const nextHistory = [...(old.history || []), price].slice(-histMax);
            return {
              ...prev,
              [sym]: { price, prev: old.price, dir, history: nextHistory, updatedAt: Date.now() },
            };
          });
        } catch {}
      });
    };

    const scheduleReconnect = () => {
      const delay = Math.min(1000 * Math.pow(2, retryRef.current), 15000); // экспоненциальная задержка до 15s
      const id = setTimeout(() => {
        if (paused || visible.length === 0) return;
        retryRef.current += 1;
        connect();
      }, delay);
      return () => clearTimeout(id);
    };

    connect();
    return () => {
      closed = true;
      wsRef.current?.close();
    };
  }, [paused, visible]);

  const items = useMemo(() => symbols.map((s) => ({ sym: s, ...tickers[s] })), [tickers]);

  const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    const w = 200;
    const h = 48;
    if (!data || data.length < 2) {
      return <svg width={w} height={h}></svg>;
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = w / (data.length - 1);
    const points = data.map((v, i) => {
      const x = i * stepX;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const d = points.join(' ');
    return (
      <svg width={w} height={h} className="overflow-visible">
        <path d={d} fill="none" stroke={color} strokeWidth="2" />
      </svg>
    );
  };

  const percentChange = (arr: number[]) => {
    if (!arr || arr.length < 2) return 0;
    const a = arr[0];
    const b = arr[arr.length - 1];
    if (!a) return 0;
    return ((b - a) / a) * 100;
  };

  const toggleSymbol = (s: TSymbol) => {
    setVisible((v) => (v.includes(s) ? v.filter((x) => x !== s) : [...v, s]));
  };

  return (
    <div className="card p-6 md:p-7 max-w-3xl mx-auto w-full">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold">Крипто Live (Binance WS)</h3>
        <div className="flex items-center gap-2">
          <span className={'text-xs ' + (connected ? 'text-emerald-400' : 'text-white/60')}>
            {connected ? 'online' : 'offline'}
          </span>
          <button
            className="btn-ghost px-2 py-1 text-xs"
            onClick={() => setPaused((p) => !p)}
            title={paused ? 'Возобновить' : 'Пауза'}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        {symbols.map((s) => (
          <label key={s} className="inline-flex items-center gap-2 text-xs text-white/80">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-white/20 bg-white/10"
              checked={visible.includes(s)}
              onChange={() => toggleSymbol(s)}
            />
            {s.replace('USDT', '/USDT')}
          </label>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items
          .filter((it) => visible.includes(it.sym as TSymbol))
          .map(({ sym, price, prev, dir, history, updatedAt }) => (
            <div
              key={sym}
              className={
                'rounded-lg border border-white/10 p-3 flex flex-col gap-2 transition-colors ' +
                (dir === 'up' ? 'bg-emerald-500/5' : dir === 'down' ? 'bg-red-500/5' : 'bg-white/5')
              }
            >
              <div className="text-xs text-white/60">{sym.replace('USDT', '/USDT')}</div>
              <div className="mt-1 text-3xl font-semibold tabular-nums flex items-center gap-2">
                <span>
                  {price ? price.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}
                </span>
                <span
                  className={
                    'text-sm ' +
                    (dir === 'up'
                      ? 'text-emerald-400'
                      : dir === 'down'
                        ? 'text-red-400'
                        : 'text-white/60')
                  }
                >
                  {dir === 'up' ? '▲' : dir === 'down' ? '▼' : '•'}
                </span>
              </div>
              <div className="text-xs text-white/70">
                {(() => {
                  const pct = percentChange(history);
                  const sign = pct >= 0 ? '+' : '';
                  return (
                    <span className={pct >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {sign}
                      {pct.toFixed(2)}%
                    </span>
                  );
                })()}{' '}
                за период
                {updatedAt ? (
                  <span className="text-white/50">
                    {' '}
                    • {new Date(updatedAt).toLocaleTimeString()}
                  </span>
                ) : null}
              </div>
              <Sparkline
                data={history}
                color={dir === 'up' ? '#34d399' : dir === 'down' ? '#f87171' : '#94a3b8'}
              />
              {price != null && prev != null && (
                <div className="text-xs text-white/60">
                  предыдущее: {prev.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </div>
              )}
            </div>
          ))}
      </div>
      <p className="mt-3 text-xs text-white/60">
        Данные обновляются по WebSocket напрямую из Binance. Без API ключа.
      </p>
    </div>
  );
}
