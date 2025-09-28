'use client';
import { useEffect, useMemo, useState } from 'react';

const TAGS = ['espera','pago','precio','atención','garantía','disponibilidad','otro'];
const ESPERA = ['< 5 min','5–10 min','10–20 min','> 20 min'];

export default function FormPage() {
  const [store, setStore] = useState('');
  const [rating, setRating] = useState(0);
  const [nps, setNps] = useState(null);                // 0–10 opcional
  const [tags, setTags] = useState([]);
  const [espera, setEspera] = useState('');
  const [staff, setStaff] = useState('');
  const [wantFollow, setWantFollow] = useState(false);
  const [contact, setContact] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(null);

  // toma ?store=CEN del QR
  useEffect(() => {
    const u = new URL(window.location.href);
    setStore(u.searchParams.get('store') || '');
  }, []);

  const toggleTag = (t) =>
    setTags((prev) => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const canSubmit = useMemo(() => {
    // Requisitos mínimos: tienda + rating
    if (!store) return false;
    if (!(rating >= 1 && rating <= 5)) return false;
    // Si pide contacto, que haya algo
    if (wantFollow && contact.trim().length < 5) return false;
    return true;
  }, [store, rating, wantFollow, contact]);

  const submit = async () => {
    setLoading(true); setOk(null);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'content-type':'application/json' },
        body: JSON.stringify({
          store_id: store,
          submitted_at: new Date().toISOString(),
          rating,
          nps_score: nps,                 // nuevo campo opcional (0–10)
          category_tags: tags,
          wait_time: espera,              // nuevo campo categórico
          staff_name: staff || undefined, // nuevo campo opcional
          wants_followup: wantFollow,
          contact: contact || undefined,  // email o teléfono (opcional)
          comment
        }),
      });
      setOk(res.ok);
      if (res.ok) {
        // Limpia el formulario suavemente
        setRating(0); setNps(null); setTags([]);
        setEspera(''); setStaff(''); setWantFollow(false);
        setContact(''); setComment('');
      }
    } catch {
      setOk(false);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, children }) => (
    <section style={{ marginTop: 18 }}>
      <p style={{ margin: '0 0 8px', fontWeight: 600 }}>{label}</p>
      {children}
    </section>
  );

  const Chip = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      type="button"
      style={{
        padding:'8px 12px',
        borderRadius: 999,
        border: '1px solid #cfd2d7',
        background: active ? '#111' : '#fff',
        color: active ? '#fff' : '#111',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  );

  const Star = ({ n }) => (
    <button
      type="button"
      onClick={() => setRating(n)}
      style={{
        padding:'8px 10px',
        borderRadius: 8,
        border: '1px solid #cfd2d7',
        background: rating===n ? '#111':'#fff',
        color: rating===n ? '#fff':'#111',
        cursor: 'pointer'
      }}
    >
      {n}★
    </button>
  );

  const NpsBtn = ({ v }) => (
    <button
      type="button"
      onClick={() => setNps(v)}
      style={{
        width: 36, height: 36, borderRadius: 8,
        border: '1px solid #cfd2d7',
        background: nps===v ? '#111':'#fff',
        color: nps===v ? '#fff':'#111',
        cursor: 'pointer'
      }}
    >
      {v}
    </button>
  );

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>¿Cómo te fue hoy?</h1>
      <p style={{ marginTop: 4, color: '#666' }}>Tienda: <strong>{store || '—'}</strong></p>

      <Field label="Calificación:">
        <div style={{ display: 'flex', gap: 8 }}>
          {[1,2,3,4,5].map(n => (<Star key={n} n={n} />))}
        </div>
      </Field>

      <Field label="¿Qué tan probable es que nos recomiendes? (0–10, opcional)">
        <div style={{ display:'flex', gap: 6, flexWrap: 'wrap' }}>
          {Array.from({ length: 11 }, (_, i) => i).map(v => (<NpsBtn key={v} v={v} />))}
        </div>
      </Field>

      <Field label="Motivo principal (opcional):">
        <div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>
          {TAGS.map(t => (
            <Chip key={t} active={tags.includes(t)} onClick={() => toggleTag(t)}>
              {t}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Tiempo de espera (opcional):">
        <div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>
          {ESPERA.map(opt => (
            <Chip key={opt} active={espera===opt} onClick={() => setEspera(opt)}>
              {opt}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="¿Quién te atendió? (opcional)">
        <input
          value={staff}
          onChange={e=>setStaff(e.target.value)}
          placeholder="Nombre del asesor (si lo recuerdas)"
          style={{ width:'100%', padding:10, borderRadius:10, border:'1px solid #cfd2d7' }}
        />
      </Field>

      <Field label="¿Deseas que te contactemos?">
        <label style={{ display:'flex', alignItems:'center', gap:10 }}>
          <input
            type="checkbox"
            checked={wantFollow}
            onChange={e=>setWantFollow(e.target.checked)}
          />
          <span>Sí, deseo seguimiento</span>
        </label>
        {wantFollow && (
          <input
            value={contact}
            onChange={e=>setContact(e.target.value)}
            placeholder="Tu correo o teléfono"
            style={{ marginTop:10, width:'100%', padding:10, borderRadius:10, border:'1px solid #cfd2d7' }}
          />
        )}
      </Field>

      <Field label="Cuéntanos (opcional):">
        <textarea
          rows={4}
          value={comment}
          onChange={e=>setComment(e.target.value)}
          placeholder="¿Qué estuvo excelente o qué mejorar?"
          style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid #cfd2d7' }}
        />
      </Field>

      <button
        disabled={!canSubmit || loading}
        onClick={submit}
        style={{
          marginTop: 18, width: '100%', padding: 14,
          borderRadius: 12, border: '1px solid #0b6b8e',
          background: canSubmit ? '#0ea5e9' : '#9ccfea',
          color: '#001', fontWeight: 800, cursor: canSubmit ? 'pointer' : 'not-allowed'
        }}
      >
        {loading ? 'Enviando…' : 'Enviar'}
      </button>

      {ok === true  && <p style={{ color:'#15803d', marginTop:12 }}>¡Gracias! Recibimos tu review.</p>}
      {ok === false && <p style={{ color:'#dc2626', marginTop:12 }}>Ups, intenta de nuevo.</p>}
    </main>
  );
}
