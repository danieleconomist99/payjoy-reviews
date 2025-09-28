// app/api/review/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();

    // Validación mínima (no quita campos)
    const store_id = typeof body.store_id === 'string' ? body.store_id.trim() : '';
    const rating = Number(body.rating);
    if (!store_id) throw new Error('Falta store_id');
    if (!(rating >= 1 && rating <= 5)) throw new Error('rating inválido');

    // Limpieza de PII SOLO en comment, no en contact/phone
    const comment = String(body.comment || '')
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig, '[email]')
      .replace(/\+?\d[\d\s-]{6,}/g, '[tel]');

    // Construimos el payload conservando TODO lo que venga del cliente:
    const payload = {
      ...body,
      store_id,
      rating,
      comment,
      submitted_at: body.submitted_at || new Date().toISOString(),
    };

    // Reenvía a n8n (o webhook.site) tal cual
    const hook = process.env.N8N_WEBHOOK_URL;
    if (!hook) {
      // Para pruebas sin n8n, devolvemos el payload para que puedas inspeccionarlo
      return NextResponse.json({ ok: true, echo: payload });
    }

    const r = await fetch(hook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: `n8n ${r.status}: ${text}` }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 400 });
  }
}

