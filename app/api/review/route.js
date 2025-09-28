import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();

    const store = String(body.store_id || '');
    const rating = Number(body.rating || 0);
    if (!store) throw new Error('Falta store_id');
    if (!(rating >= 1 && rating <= 5)) throw new Error('rating inválido');

    const comment = String(body.comment || '')
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig, '[email]')
      .replace(/\+?\d[\d\s-]{6,}/g, '[tel]');

    const payload = {
      store_id: store,
      rating,
      comment,
      category_tags: Array.isArray(body.category_tags) ? body.category_tags : [],
      submitted_at: body.submitted_at || new Date().toISOString()
    };

    const hook = process.env.N8N_WEBHOOK_URL;
    if (hook) {
      const r = await fetch(hook, {
        method: 'POST',
        headers: { 'content-type':'application/json' },
        body: JSON.stringify(payload)
      });
      if (!r.ok) {
        const txt = await r.text();
        return NextResponse.json({ ok:false, error:`n8n: ${txt}` }, { status:502 });
      }
      return NextResponse.json({ ok:true });
    }

    return NextResponse.json({ ok:true, note:'Sin n8n aún (solo validado).' });
  } catch (e) {
    return NextResponse.json({ ok:false, error: e.message }, { status:400 });
  }
}
