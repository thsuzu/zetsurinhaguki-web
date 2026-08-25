// 絶リン★ハグキ — CSV CORS proxy Worker
// ライブ情報スプレッドシートのCSVを取得してCORSヘッダーを付与して返す
// Cloudflare ダッシュボードでこのコードをWorkerに貼り付けてデプロイしてください

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRtG0-yXHi3Z55kFF83w9ycI7HSIRc7g_dQ-gV3e3YJjw9L7bwc4pvyXs3wPTviohpsQxVShbEAEZoa/pub?gid=0&single=true&output=csv';

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

    try {
      const res = await fetch(CSV_URL, { redirect: 'follow' });
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
