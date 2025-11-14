export const URLS = {
  NBU_RATES: 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json',
  OPEN_METEO_BASE: 'https://api.open-meteo.com/v1/forecast',
  BINANCE_WS_BASE: 'wss://stream.binance.com:9443/stream',
} as const;

export type BinanceSymbol = `${string}USDT`;

export function buildOpenMeteoUrl(lat: number, lon: number) {
  const base = URLS.OPEN_METEO_BASE;
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current_weather: 'true',
    timezone: 'auto',
  });
  return `${base}?${params.toString()}`;
}

export function buildBinanceCombinedStream(symbols: BinanceSymbol[]) {
  const streams = symbols.map((s) => `${s.toLowerCase()}@trade`).join('/');
  return `${URLS.BINANCE_WS_BASE}?streams=${streams}`;
}
