import { URLS } from '../../../lib/urls';

export const runtime = 'edge';

export async function GET() {
  try {
    const res = await fetch(URLS.NBU_RATES, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Upstream error' }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      });
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch rates' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
