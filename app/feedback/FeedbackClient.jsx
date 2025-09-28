'use client'; // ← primera línea

import { useEffect, useMemo, useRef, useState } from 'react';

// Constantes
const TAGS = ['espera','pago','precio','atención','garantía','disponibilidad','otro'];
const WAIT = ['< 5 min','5–10 min','10–20 min','> 20 min'];
const TRAMITE = ['Compra','Pago','Garantía','Consulta'];

export default function FeedbackClient() {
  // STATE mínimo
  const [store, setStore] = useState('');
  const [rating, setRating] = useState(0);                 // ★ obligatorio
  const [nps, setNps] = useState(null);                    // 0–10 obligatorio
  const [tags, setTags] = useState([]);                    // >=1 obligatorio
  const [waitTime, setWaitTime] = useState('');            // obligatorio
  const [tramite, setTramite] = useState('');              // obligatorio
  const [resolved, setResolved] = useState(null);          // true/false obligatorio
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(null);

  // REFS (inputs no controlados → no saltan cursor)
  const nameRef    = useRef(null);  // obligatorio
  const phoneRef   = useRef(null);  // obligatorio
  const staffRef   = useRef(null);  // obligatorio
  const commentRef = useRef(null);  // obligatorio
  const buildStampRef = useRef(new Date().toISOString());

  // Cargar tienda desde ?store=
  useEffect(() => {
    const u = new URL(window.location.href);
    setStore(u.searchParams.get('store') || '');
  }, []);

  // Validaciones (todas obligatorias)
  const phoneOk = () => {
    const v = (phoneRef.current?.value || '').trim();
    return v.length >= 7; // regla simple; ajusta si quieres regex
  };
  const nameOk = () => (nameRef.current?.value || '').trim().length > 0;
  const staffOk = () => (staffRef.current?.value || '').trim().length > 0;
  const commentOk = () => (commentRef.current?.value || '').trim().length > 0;

  const canSubmit = useMemo(() => {
    return (
      store &&
      rating >= 1 && rating <= 5 &&
      nps !== null && nps >= 0 && nps <= 10 &&
      Array.isArray(tags) && tags.length >= 1 &&
      WAIT.includes(waitTime) &&
      TRAMITE.includes(tramite) &&
      typeof resolved === 'boolean' &&
      nameOk() && phoneOk() && staffOk() && commentOk()
    );
  }, [store, rating, nps, tags, waitTime, tramite, resolved]);

  // Envío
  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setOk(null);
    try {
      const name    = nameRef.current?.value?.trim()    || '';
      const phone   = phoneRef.current?.value?.trim()   || '';
      const staff   = staffRef.current?.value?.trim()   || '';
      const comment = commentRef.current?.value?.trim() || '';

      const payload = {
        store_id: store, // ya es obligatorio por URL; evita fallback 'CEN'
        submitted_at: new Date().toISOString(),
        rating,
        nps_score: nps,
        category_tags: tags,
        wait_time: waitTime,
        staff_name: staff,
        procedure_type: tramite,
        issue_resolved: resolved,
        customer_name: name,
        contact: phone,
        comment,
      };

      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setOk(res.ok);

      if (res.ok) {
        // Limpieza mínima (si quisieras mantener datos, elimina estas líneas)
        setRating(0); setNps(null); setTags([]);
        setWaitTime(''); setTramite(''); setResolved(null);
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

  // Helpers UI
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

  // RENDER
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Cuéntanos tu experiencia</h1>
      <p style={{ marginTop: 4, color: '#666' }}>
        Tienda: <strong>{store || '—'}</strong>
      </p>

      <Section title="Calificación (obligatorio):">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[1,2,3,4,5].map(n => <Star key={n} n={n} />)}
        </div>
      </Section>

      <Section title="¿Qué tan probable es que nos recomiendes? 0–10 (obligatorio):">
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {Array.from({ length: 11 }, (_, i) => i).map(v => <NpsBtn key={v} v={v} />)}
        </div>
      </Section>

      <Section title="Motivo principal (obligatorio):">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {TAGS.map(t => (
            <Chip
              key={t}
              active={tags.includes(t)}
              onClick={() =>
                setTags(s => s.includes(t) ? s.filter(x=>x!==t) : [...s, t])
              }
            >
              {t}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Tiempo de espera (obligatorio):">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {WAIT.map(opt => (
            <Chip key={opt} active={waitTime===opt} onClick={() => setWaitTime(opt)}>{opt}</Chip>
          ))}
        </div>
      </Section>

      <Section title="Tipo de trámite (obligatorio):">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {TRAMITE.map(opt => (
            <Chip key={opt} active={tramite===opt} onClick={() => setTramite(opt)}>{opt}</Chip>
          ))}
        </div>
      </Section>

      <Section title="¿Se resolvió tu trámite hoy? (obligatorio):">
        <div style={{ display:'flex', gap:8 }}>
          <Chip active={resolved===true}  onClick={() => setResolved(true)}>Sí</Chip>
          <Chip active={resolved===false} onClick={() => setResolved(false)}>No</Chip>
        </div>
      </Section>

      <Section title="¿Quién te atendió? (obligatorio):">
        <input
          ref={staffRef}
          type="text"
          defaultValue=""
          placeholder="Nombre del asesor"
          autoComplete="organization-title"
          style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid #d1d5db' }}
        />
      </Section>

      <Section title="Tus datos (obligatorio):">
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
            inputMode="numeric"     // teclado numérico en móvil
            pattern="\d*"           // pista para validación
            maxLength={15}
            onInput={(e) => {       // fuerza solo dígitos
              e.currentTarget.value = e.currentTarget.value.replace(/\D+/g, '');
            }}
            style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid #d1d5db' }}
          />
          {!phoneOk() && <p style={{color:'#b45309',fontSize:12,marginTop:6}}>Escribe un celular válido.</p>}
        </div>
      </Section>

      <Section title="Cuéntanos (obligatorio):">
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
          background: canSubmit ? '#0ea5e9' : '#9ccfea', color: '#001', fontWeight: 800
        }}
      >
        {loading ? 'Enviando…' : 'Enviar'}
      </button>

      <p style={{ marginTop:12, fontSize:12, color:'#888' }}>
        build: feedback-required — {buildStampRef.current}
      </p>

      {ok === true  && <p style={{ color:'#15803d', marginTop:8 }}>¡Gracias! Recibimos tu review.</p>}
      {ok === false && <p style={{ color:'#dc2626', marginTop:8 }}>Ups, intenta de nuevo.</p>}
    </main>
  );
}

