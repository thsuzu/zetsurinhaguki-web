const ALLOWED_ORIGINS = [
  'https://zetsurinhaguki.net',
  'http://zetsurinhaguki.net',
  'https://thsuzu.github.io',
];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    // プリフライト
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // GET /posts — 投稿一覧（新しい順）
    if (request.method === 'GET' && url.pathname === '/posts') {
      const { results } = await env.DB.prepare(
        'SELECT id, name, body, created_at FROM posts ORDER BY id DESC LIMIT 200'
      ).all();
      return Response.json(results, { headers: cors });
    }

    // POST /posts — 投稿
    if (request.method === 'POST' && url.pathname === '/posts') {
      let data;
      try { data = await request.json(); } catch {
        return Response.json({ error: '不正なリクエストです' }, { status: 400, headers: cors });
      }

      const name = String(data.name || '').trim().slice(0, 50) || '名無しさん';
      const body = String(data.body || '').trim().slice(0, 1000);

      if (!body) {
        return Response.json({ error: '本文を入力してください' }, { status: 400, headers: cors });
      }

      const urlPattern = /https?:\/\/|www\./i;
      if (urlPattern.test(name) || urlPattern.test(body)) {
        return Response.json({ error: 'URLを含む書き込みは禁止されています' }, { status: 400, headers: cors });
      }

      await env.DB.prepare(
        'INSERT INTO posts (name, body) VALUES (?, ?)'
      ).bind(name, body).run();

      return Response.json({ ok: true }, { status: 201, headers: cors });
    }

    return new Response('Not Found', { status: 404 });
  },
};
