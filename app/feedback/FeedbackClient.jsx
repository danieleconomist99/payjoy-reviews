'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// Constantes
const TAGS = ['espera','pago','precio','atención','garantía','disponibilidad','otro'];
const WAIT = ['< 5 min','5–10 min','10–20 min','> 20 min'];
const TRAMITE = ['Compra','Pago','Garantía','Consulta'];

export default function FeedbackClient() {
  // State mínimo (selecciones)
  const [store, setStore] = useState('');
  const [rating, setRating] = useState(0);         // ★ obligatorio
  const [nps, setNps] = useState(null);            // 0–10 obligatorio
  const [tags, setTags] = useState([]);            // >=1 obligatorio
  const [waitTime, setWaitTime] = useState('');    // obligatorio
  const [tramite, setTramite] = useState('');      // obligatorio
  const [resolved, setResolved] = useState(null);  // true/false obligatorio

  // State de textos (controlados, sin transformaciones agresivas)
  const [name, setName] = useState('');            // obligatorio
  const [phone, setPhone] = useState('');          // obligatorio (solo números)
  const [staff, setStaff] = useState('');          // obligatorio
  const [comment, setComment] = useState('');      // obligatorio

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(null);

  const buildStampRef = useRef(new Date().toISOString()); // etiqueta estable

  // Cargar tienda desde ?store=
  useEffect(() => {
    const u = new URL(window.location.href);
    setStore(u.searchParams.get('store') || '');
  }, []);

  // Validadores
  const phoneOk = phone.replace(/\D+/g,'').length >= 7;
  const canSubmit = useMemo(() => (
    store &&
    rating >= 1 && rating <= 5 &&
    nps !== null && nps >= 0 && nps <= 10 &&
    Array.isArray(tags) && tags.length >= 1 &&
    WAIT.includes(waitTime) &&
    TRAMITE.includes(tramite) &&
    typeof resolved === 'boolean' &&
    name.trim().length > 0 &&
    phoneOk &&
    staff.trim().length > 0 &&
    comment.trim().length > 0
  ), [store, rating, nps, tags, waitTime, tramite, resolved, name, phoneOk, staff, comment]);

  // Handlers de texto (simples; no mueven el cursor)
  const onPhoneChange = (e) => {
    // Solo números (no hacemos nada con la selección; React mantiene el caret)
    const digits = e.target.value.replace(/\D+/g,'');
    setPhone(digits);
  };

  // Envío
  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true); setOk(null);
    try {
      const payload = {
        store_id: store,
        submitted_at: new Date().toISOString(),
        rating,
        nps_score: nps,
        category_tags: tags,
        wait_time: waitTime,
        staff_name: staff.trim(),
        procedure_type: tramite,
        issue_resolved: resolved,
        customer_name: name.trim(),
        contact: phone.replace(/\D+/g,'').trim(),
        comment: comment.trim(),
      };

      const resp = await fetch('/api/review', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setOk(resp.ok);

      if (resp.ok) {
        // Limpieza
        setRating(0); setNps(null); setTags([]);
        setWaitTime(''); setTramite(''); setResolved(null);
        setName(''); setPhone(''); setStaff(''); setComment('');
        alert('¡Enviado!');
      } else {
        const txt = await resp.text();
        alert(`Error al enviar (${resp.status}). ${txt.slice(0,200)}`);
      }
    } catch {
      alert('Ocurrió un error de red al enviar.');
      setOk(false);
    } finally {
      setLoading(false);
    }
  };

  // UI helpers
  const Section = ({ title, children }) => (
    <section style={{ marginTop: 20 }}>
      <p style={{ margin: '0 0 8px', fontWeight: 600 }}>{title}</p>
      {children}
    </section>
  );

  const Chip = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding:'8px 12px',
        borderRadius:999,
        border:'1px solid #d1d5db',
        background: active ? '#111' : '#fff',
        color: active ? '#fff' : '#111',
        cursor:'pointer'
      }}
      aria-pressed={active}
    >
      {children}
    </button>
  );

  const Star = ({ n }) => (
    <button
      type="button"
      onClick={() => setRating(n)}
      style={{
        padding:'10px 12px',
        borderRadius:10,
        border:'1px solid #d1d5db',
        background: rating===n ? '#111':'#fff',
        color: rating===n ? '#fff':'#111',
        cursor:'pointer'
      }}
      aria-pressed={rating===n}
    >
      {n}★
    </button>
  );

  const NpsBtn = ({ v }) => (
    <button
      type="button"
      onClick={() => setNps(v)}
      style={{
        width:36, height:36, borderRadius:8,
        border:'1px solid #d1d5db',
        background: nps===v ? '#111':'#fff',
        color: nps===v ? '#fff':'#111',
        cursor:'pointer'
      }}
      aria-pressed={nps===v}
    >
      {v}
    </button>
  );

  // Render
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Cuéntanos tu experiencia</h1>
      <p style={{ marginTop: 4, color: '#666' }}>Tienda: <strong>{store || '—'}</strong></p>

      <Section title="Calificación:">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[1,2,3,4,5].map(n => <Star key={n} n={n} />)}
        </div>
      </Section>

      <Section title="¿Qué tan probable es que nos recomiendes? (0–10):">
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {Array.from({ length: 11 }, (_, i) => i).map(v => <NpsBtn key={v} v={v} />)}
        </div>
      </Section>

      <Section title="Motivo principal:">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {TAGS.map(t => (
            <Chip
              key={t}
              active={tags.includes(t)}
              onClick={() => setTags(s => s.includes(t) ? s.filter(x=>x!==t) : [...s, t])}
            >
              {t}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Tiempo de espera:">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {WAIT.map(opt => (
            <Chip key={opt} active={waitTime===opt} onClick={() => setWaitTime(opt)}>{opt}</Chip>
          ))}
        </div>
      </Section>

      <Section title="Tipo de trámite:">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {TRAMITE.map(opt => (
            <Chip key={opt} active={tramite===opt} onClick={() => setTramite(opt)}>{opt}</Chip>
          ))}
        </div>
      </Section>

      <Section title="¿Se resolvió tu trámite hoy?">
        <div style={{ display:'flex', gap:8 }}>
          <Chip active={resolved===true}  onClick={() => setResolved(true)}>Sí</Chip>
          <Chip active={resolved===false} onClick={() => setResolved(false)}>No</Chip>
        </div>
      </Section>

      <Section title="¿Quién te atendió?">
        <input
          type="text"
          placeholder="Nombre del asesor"
          autoComplete="organization-title"
          value={staff}
          onChange={(e)=>setStaff(e.target.value)}
          style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid #d1d5db' }}
        />
      </Section>

      <Section title="Tus datos">
        <div style={{ display:'grid', gap:10 }}>
          <input
            type="text"
            placeholder="Tu nombre"
            autoComplete="name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid #d1d5db' }}
          />
          <input
            type="tel"
            placeholder="Tu número de celular"
            autoComplete="tel"
            inputMode="numeric"
            pattern="\d*"
            maxLength={15}
            value={phone}
            onChange={onPhoneChange}
            style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid #d1d5db' }}
          />
        </div>
      </Section>

      <Section title="Cuéntanos">
        <textarea
          rows={4}
          placeholder="¿Qué estuvo excelente o qué mejorar?"
          value={comment}
          onChange={(e)=>setComment(e.target.value)}
          style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid #d1d5db' }}
        />
      </Section>

      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit || loading}
        aria-busy={loading ? 'true' : 'false'}
        style={{
          marginTop:22, width:'100%', padding:14, borderRadius:12, border:'1px solid #0b6b8e',
          background: (!canSubmit || loading) ? '#9ccfea' : '#0ea5e9',
          color:'#001', fontWeight:800, cursor: (!canSubmit || loading) ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Enviando…' : 'Enviar'}
      </button>

      <p style={{ marginTop:12, fontSize:12, color:'#888' }}>
        build: feedback-stable — {buildStampRef.current}
      </p>

      {ok === true  && <p style={{ color:'#15803d', marginTop:8 }}>¡Gracias! Recibimos tu review.</p>}
      {ok === false && <p style={{ color:'#dc2626', marginTop:8 }}>Ups, intenta de nuevo.</p>}
    </main>
  );
}


