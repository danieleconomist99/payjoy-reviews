// Sin caché/CDN/SSG en esta ruta
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

'use client';
import { useEffect, useMemo, useState } from 'react';

export default function FeedbackPage() {
  const [store, setStore] = useState('');
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(null);

  useEffect(() => {
    const u = new URL(window.location.href);
    setStore(u.searchParams.get('store') || '');
  }, []);

  const canSubmit = useMemo(() => rating >= 1 && rating <= 5, [rating]);

  const submit = async () => {
    setLoading(true); setOk(null);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'content-type':'application/json' },
        body: JSON.stringify({
          store_id: store || 'CEN',
          submitted_at: new Date().toISOString(),
          rating,
          category_tags: tags,
          comment
        }),
      });
      setOk(res.ok);
    } catch { setOk(false); }
    finally { setLoading(false); }
  };

  const Chip = ({ active, onClick, children }) => (
    <button type="button" onClick={onClick}
      style={{ padding:'8px 12px', borderRadius:999, border:'1px solid #d1d5db',
               background: active ? '#111':'#fff', color: active ? '#fff':'#111' }}>
      {children}
    </button>
  );

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>¿Cómo te fue hoy?</h1>
      <p style={{ marginTop: 4, color: '#666' }}>Tienda: <strong>{store || '—'}</strong></p>

      <section style={{ marginTop: 20 }}>
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Calificación:</p>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} type="button" onClick={() => setRating(n)}
              style={{ padding:'10px 12px', borderRadius:10, border:'1px solid #d1d5db',
                       background: rating===n ? '#111':'#fff', color: rating===n ? '#fff':'#111' }}>
              {n}★
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 20 }}>
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Motivo (opcional):</p>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {['espera','pago','precio','atención','garantía','otro'].map(t => (
            <Chip key={t} active={tags.includes(t)}
                  onClick={() => setTags(s => s.includes(t) ? s.filter(x=>x!==t) : [...s, t])}>
              {t}
            </Chip>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 20 }}>
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Cuéntanos (opcional):</p>
        <textarea rows={4} value={comment} onChange={e=>setComment(e.target.value)}
          placeholder="¿Qué estuvo excelente o qué mejorar?"
          style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid #d1d5db' }}/>
      </section>

      <button disabled={!canSubmit || loading} onClick={submit}
        style={{ marginTop:22, width:'100%', padding:14, borderRadius:12, border:'1px solid #0b6b8e',
                 background: canSubmit ? '#0ea5e9' : '#9ccfea', color:'#001', fontWeight:800 }}>
        {loading ? 'Enviando…' : 'Enviar'}
      </button>

      <p style={{ marginTop:12, fontSize:12, color:'#888' }}>
        build: feedback-v1 — {new Date().toISOString()}
      </p>
      {ok === true  && <p style={{ color:'#15803d', marginTop:8 }}>¡Gracias! Recibimos tu review.</p>}
      {ok === false && <p style={{ color:'#dc2626', marginTop:8 }}>Ups, intenta de nuevo.</p>}
    </main>
  );
}
