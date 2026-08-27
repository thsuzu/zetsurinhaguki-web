// 絶リン★ハグキ — CSV CORS proxy Worker
// ?type=live        → ライブ情報スプレッドシート
// ?type=discography → ディスコグラフィースプレッドシート
// Cloudflare ダッシュボードでこのコードをWorkerに貼り付けてデプロイしてください

const CSV_URLS = {
  live: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRtG0-yXHi3Z55kFF83w9ycI7HSIRc7g_dQ-gV3e3YJjw9L7bwc4pvyXs3wPTviohpsQxVShbEAEZoa/pub?gid=0&single=true&output=csv',
  discography: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRBD_IrnElyb2elxVEqdshLT0HN793xaz5AtrBrAMiSXW1pnpV6KePs2IVSiJ6wS8wl-cM_1HssAzkm/pub?gid=0&single=true&output=csv',
  goods: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT0bGJE2c0ocbx1sZj98HUhsILzqFmXQbHqSAGag_UeJb5WiJaOGbEfHEGL_dLrp5Fbpgnh9lUC1Ses/pub?gid=0&single=true&output=csv',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
      });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'live';
    const csvUrl = CSV_URLS[type];

    if (!csvUrl) {
      return new Response('Unknown type', {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    try {
      const res = await fetch(csvUrl, { redirect: 'follow' });
      if (!res.ok) {
        return new Response(`Upstream error: ${res.status}`, {
          status: res.status,
          headers: { 'Access-Control-Allow-Origin': '*' },
        });
      }
      const text = await res.text();
      return new Response(text, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store',
        },
      });
    } catch (e) {
      return new Response(`Error: ${e.message}`, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};
