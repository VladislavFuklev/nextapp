'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildOpenMeteoUrl } from '../lib/urls';
import Popover from './ui/Popover';
import CurrencyWidget from './widgets/CurrencyWidget';

type CityKey = 'kyiv' | 'lviv' | 'kharkiv' | 'odesa' | 'dnipro';
const CITIES: Record<CityKey, { name: string; lat: number; lon: number }> = {
  kyiv: { name: 'Київ', lat: 50.4501, lon: 30.5234 },
  lviv: { name: 'Львів', lat: 49.8397, lon: 24.0297 },
  kharkiv: { name: 'Харків', lat: 49.9935, lon: 36.2304 },
  odesa: { name: 'Одеса', lat: 46.4825, lon: 30.7233 },
  dnipro: { name: 'Дніпро', lat: 48.4647, lon: 35.0462 },
};

function codeToEmoji(code?: number) {
  if (code == null) return '⛅';
  if ([0].includes(code)) return '☀️';
  if ([1, 2].includes(code)) return '🌤️';
  if ([3].includes(code)) return '☁️';
  if ([45, 48].includes(code)) return '🌫️';
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
  if ([95, 96, 99].includes(code)) return '⛈️';
  return '⛅';
}

export default function Header() {
  const [openRates, setOpenRates] = useState(false);

  const [city, setCity] = useState<CityKey>('kyiv');
  const [temp, setTemp] = useState<number | null>(null);
  const [wCode, setWCode] = useState<number | undefined>(undefined);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ua-city') as CityKey | null;
      if (saved && CITIES[saved]) setCity(saved);
    } catch {}
  }, []);

  useEffect(() => {
    const { lat, lon } = CITIES[city];
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoadingWeather(true);
    fetch(buildOpenMeteoUrl(lat, lon), { signal: ac.signal })
      .then(
        async (r) =>
          (await r.json()) as { current_weather?: { temperature?: number; weathercode?: number } },
      )
      .then((data) => {
        setTemp(data?.current_weather?.temperature ?? null);
        setWCode(data?.current_weather?.weathercode);
      })
      .catch(() => {
        setTemp(null);
        setWCode(undefined);
      })
      .finally(() => setLoadingWeather(false));

    try {
      localStorage.setItem('ua-city', city);
    } catch {}

    return () => ac.abort();
  }, [city]);

  const weatherView = useMemo(() => {
    const emoji = codeToEmoji(wCode);
    if (loadingWeather) return <span className="text-white/70">Погода: …</span>;
    if (temp == null) return <span className="text-white/70">Погода: —</span>;
    return (
      <span className="inline-flex items-center gap-1 text-white/90">
        <span>{emoji}</span>
        <span className="tabular-nums">{Math.round(temp)}°C</span>
      </span>
    );
  }, [loadingWeather, temp, wCode]);

  return (
    <header className="w-full border-b border-white/10 bg-white/5 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6 text-white"
          >
            <path d="M12 2a1 1 0 0 1 .894.553l2 4A1 1 0 0 1 14 8H10a1 1 0 0 1-.894-1.447l2-4A1 1 0 0 1 12 2zm-7 9a1 1 0 0 1 1-1h3a1 1 0 0 1 .832.445l2 3a1 1 0 0 1 0 1.11l-2 3A1 1 0 0 1 8 18H6a1 1 0 0 1-1-1v-6zm10 0a1 1 0 0 1 1-1h3a1 1 0 0 1 .894 1.447l-2 4A1 1 0 0 1 16 16h-3a1 1 0 0 1-.894-1.447l2-4A1 1 0 0 1 15 11z" />
          </svg>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="city">
              Город
            </label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value as CityKey)}
              className="bg-white/5 border border-white/15 rounded-md px-2 py-1 text-xs sm:px-2.5 sm:py-1.5 sm:text-sm text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-600 max-w-[140px]"
            >
              {Object.entries(CITIES).map(([key, c]) => (
                <option key={key} value={key} className="text-black">
                  {c.name}
                </option>
              ))}
            </select>
            {weatherView}
          </div>

          <div className="relative">
            <button
              className="btn-ghost h-12 w-12 rounded-full"
              onClick={() => setOpenRates((v) => !v)}
              aria-expanded={openRates}
              aria-controls="rates-popover"
              aria-label="Курсы валют"
              title="Курсы валют"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="h-8 w-8 text-white/90"
              >
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <text
                  x="12"
                  y="16"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill="currentColor"
                >
                  ₴
                </text>
              </svg>
            </button>
            <Popover open={openRates} onClose={() => setOpenRates(false)}>
              <div
                id="rates-popover"
                className="card !bg-slate-900/90 !border-white/20 shadow-xl p-3 w-[300px] sm:w-[360px]"
              >
                <CurrencyWidget embedded />
              </div>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}
