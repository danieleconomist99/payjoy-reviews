'use client'; // ← debe ser la PRIMERA línea

import { useEffect, useMemo, useRef, useState } from 'react';

// Constantes fuera del componente
const TAGS = ['espera','pago','precio','atención','garantía','disponibilidad','otro'];
const WAIT = ['< 5 min','5–10 min','10–20 min','> 20 min'];
const TRAMITE = ['Compra','Pago','Garantía','Consulta'];

export default function FeedbackClient() {
  // ----- STATE (solo lo necesario) -----
  const [store, setStore] = useState('');
  const [rating, setRating] = useState(0);
  const [nps, setNps] = useState(null);
  const [tags, setTags] = useState([]);
  const [waitTime, setWaitTime] = useState('');
  const [tramite, setTramite] = useState('');
  const [resolved, setResolved] = useState(null); // true/false
  const [wantFollow, setWantFollow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(null);

  // ----- REFS (inputs NO controlados para evitar salto de cursor) -----
  const nameRef    = useRef(null);
  const phoneRef   = useRef(null);
  const staffRef   = useRef(null);
  const commentRef = useRef(null);
  const buildStampRef = useRef(new Date().toISOString()); // etiqueta estable

  // Leer ?store=CEN una sola vez
  useEffect(() => {
    const u = new URL(window.location.href);
    setStore(u.searchParams.get('store') || '');
  }, []);

  // Habilitar botón (si pide seguimiento, exige celular)
  const canSubmit = useMemo(() => {
    if (!(rating >= 1 && rating <= 5)) return false;
    if (wantFollow) {
      const phone = phoneRef.current?.value?.trim() || '';
      if (phone.length < 5) return false;
    }
    return true;
  }, [rating, wantFollow]);

  // ----- SUBMIT -----
  const submit = async () => {
    setLoading(true);
    setOk(null);
    try {
      const name    = nameRef.current?.value?.trim()    || '';
      const phone   = phoneRef.current?.value?.trim()   || '';
      const staff   = staffRef.current?.value?.trim()   || '';
      const comment = commentRef.current?.value?.trim() || '';

      const payload = {
        store_id: store || 'CEN',
        submitted_at: new Date().toISOString(),
        rating,
        nps_score: nps ?? undefined,
        category_tags: tags,
        wait_time: waitTime || undefined,
        staff_name: staff || undefined,
        procedure_type: tramite || undefined,
        issue_resolved: typeof resolved === 'boolean' ? resolved : undefined,
        wants_followup: wantFollow,
        customer_name: name || undefined,        // ← nombre
        contact: phone || undefined,             // ← celular
        comment,
      };

      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'content-type':'application/json' },
        body: JSON.stringify(payload),
      });

      setOk(res.ok);

      if (res.ok) {
        // Limpieza mínima sin re-montar inputs
        setRating(0); setNps(null); setTags([]);
        setWaitTime(''); setTramite(''); setResolved(null);
        setWantFollow(false);
        if (nameRef.current)    nameRef.current.value    = '';
        if (phoneRef.current)   phoneRef.current.value   = '';
        if (staffRef.current)   staffRef.current.value   = '';
        if (commentRef.current) commentRef.current.value = '';
      }
    } catch {
      setOk(false);
    } finally {
      setLoading(false);
    }
  };

  // ----- UI helpers -----
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
    >
      {v}
    </button>
  );

  // ----- RENDER -----
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>¿Cómo te fue hoy?</h1>
      <p style={{ marginTop: 4, color: '#666' }}>
        Tienda: <strong>{store || '—'}</strong>
      </p>

      <Section title="Calificación:">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[1,2,3,4,5].map(n => <Star key={n} n={n} />)}
        </div>
      </Section>

      <Section title="¿Qué tan probable es que nos recomiendes? (0–10, opcional)">
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {Array.from({ length: 11 }, (_, i) => i).map(v => <NpsBtn key={v} v={v} />)}
        </div>
      </Section>

      <Section title="Motivo principal (opcional):">
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

      <Section title="Tiempo de espera (opcional)">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {WAIT.map(opt => (
            <Chip key={opt} active={waitTime===opt} onClick={() => setWaitTime(opt)}>{opt}</Chip>
          ))}
        </div>
      </Section>

      <Section title="Tipo de trámite (opcional)">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {TRAMITE.map(opt => (
            <Chip key={opt} active={tramite===opt} onClick={() => setTramite(opt)}>{opt}</Chip>
          ))}
        </div>
      </Section>

      <Section title="¿Se resolvió tu trámite hoy? (opcional)">
        <div style={{ display:'flex', gap:8 }}>
          <Chip active={resolved===true}  onClick={() => setResolved(true)}>Sí</Chip>
          <Chip active={resolved===false} onClick={() => setResolved(false)}>No</Chip>
        </div>
      </Section>

      <Section title="¿Quién te atendió? (opcional)">
        <input
          ref={staffRef}
          type="text"
          defaultValue=""
          placeholder="Nombre del asesor"
          autoComplete="organization-title"
          style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid #d1d5db' }}
        />
      </Section>

      <Section title="Tus datos (opcional)">
        <div style={{ display:'grid', gap:10 }}>
          <input
            ref={nameRef}
            type="text"
            defaultValue=""
            placeholder="Tu nombre"
            autoComplete="name"
            style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid #d1d5db' }}
          />
          <input
            ref={phoneRef}
            type="tel"
            defaultValue=""
            placeholder="Tu número de celular"
            autoComplete="tel"
            inputMode="tel"
            pattern="[0-9+ ]*"
            style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid #d1d5db' }}
          />
        </div>
      </Section>

      <Section title="¿Deseas que te contactemos?">
        <label style={{ display:'flex', alignItems:'center', gap:10 }}>
          <input
            type="checkbox"
            checked={wantFollow}
            onChange={e => setWantFollow(e.target.checked)}
          />
          <span>Sí, deseo seguimiento</span>
        </label>
        {wantFollow && (phoneRef.current?.value?.trim()?.length ?? 0) < 5 && (
          <p style={{ marginTop:8, color:'#b45309', fontSize:12 }}>
            Deja tu celular para poder contactarte.
          </p>
        )}
      </Section>

      <Section title="Cuéntanos (opcional):">
        <textarea
          ref={commentRef}
          rows={4}
          defaultValue=""
          placeholder="¿Qué estuvo excelente o qué mejorar?"
          style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid #d1d5db' }}
        />
      </Section>

      <button
        disabled={!canSubmit || loading}
        onClick={submit}
        style={{
          marginTop:22, width:'100%', padding:14, borderRadius:12, border:'1px solid #0b6b8e',
          background: canSubmit ? '#0ea5e9' : '#9ccfea', color:'#001', fontWeight:800
        }}
      >
        {loading ? 'Enviando…' : 'Enviar'}
      </button>

      <p style={{ marginTop:12, fontSize:12, color:'#888' }}>
        build: feedback-extended — {buildStampRef.current}
      </p>

      {ok === true  && <p style={{ color:'#15803d', marginTop:8 }}>¡Gracias! Recibimos tu review.</p>}
      {ok === false && <p style={{ color:'#dc2626', marginTop:8 }}>Ups, intenta de nuevo.</p>}
    </main>
  );
}
