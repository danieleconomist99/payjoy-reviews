'use client';
import { useEffect, useState } from 'react';

const TAGS = ['espera','pago','precio','atención','garantía','otro'];

export default function FormPage() {
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

  const toggle = (t) => setTags((s) => s.includes(t) ? s.filter(x => x !== t) : [...s, t]);

  const submit = async () => {
    setLoading(true); setOk(null);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'content-type':'application/json' },
        body: JSON.stringify({
          store_id: store,
          rating,
          comment,
          category_tags: tags,
          submitted_at: new Date().toISOString()
        }),
      });
      setOk(res.ok);
    } catch {
      setOk(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>¿Cómo te fue hoy?</h1>
      <p style={{ opacity: .7 }}>Tienda: {store || '—'}</p>

      <div style={{ marginTop: 16 }}>
        <p>Calificación:</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setRating(n)}
              style={{ padding:'8px 10px', borderRadius:8, border:'1px solid #444',
                       background: rating===n ? '#111':'transparent', color: rating===n ? '#fff':'#222' }}>
              {n}★
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <p>Motivo (opcional):</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {TAGS.map(t => (
            <button key={t} onClick={() => toggle(t)}
              style={{ padding:'6px 10px', borderRadius:20, border:'1px solid #444',
                       background: tags.includes(t) ? '#111':'transparent', color: tags.includes(t)?'#fff':'#222' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <p>Cuéntanos (opcional):</p>
        <textarea rows={4} value={comment} onChange={e=>setComment(e.target.value)}
          placeholder="¿Qué estuvo excelente o qué mejorar?"
          style={{ width:'100%', padding:10, borderRadius:8, border:'1px solid #444' }}/>
      </div>

      <button onClick={submit} disabled={!rating || !store || loading}
        style={{ marginTop:16, width:'100%', padding:12, borderRadius:10, background:'#0ea5e9', color:'#001', fontWeight:700, opacity: (!rating||!store)?0.6:1 }}>
        {loading ? 'Enviando…' : 'Enviar'}
      </button>

      {ok === true  && <p style={{ color:'#16a34a', marginTop:12 }}>¡Gracias! Recibimos tu review.</p>}
      {ok === false && <p style={{ color:'#dc2626', marginTop:12 }}>Ups, intenta de nuevo.</p>}
    </main>
  );
}
