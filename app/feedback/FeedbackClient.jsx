'use client';

import { useEffect, useRef, useState } from 'react';

// Constantes
const TAGS = ['espera','pago','precio','atención','garantía','disponibilidad','otro'];
const WAIT = ['< 5 min','5–10 min','10–20 min','> 20 min'];
const TRAMITE = ['Compra','Pago','Garantía','Consulta'];

export default function FeedbackClient() {
  // Solo selecciones en estado (no textos)
  const [store, setStore] = useState('');
  const [rating, setRating] = useState(0);
  const [nps, setNps] = useState(null);
  const [tags, setTags] = useState([]);
  const [waitTime, setWaitTime] = useState('');
  const [tramite, setTramite] = useState('');
  const [resolved, setResolved] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(null);

  // Textos NO controlados → no pierden el cursor
  const nameRef    = useRef(null);
  const phoneRef   = useRef(null);
  const staffRef   = useRef(null);
  const commentRef = useRef(null);
  const buildStampRef = useRef(new Date().toISOString());

  // Cargar tienda desde ?store=
  useEffect(() => {
    const u = new URL(window.location.href);
    setStore(u.searchParams.get('store') || '');
  }, []);

  // Validadores simples
  const phoneDigits = () => (phoneRef.current?.value || '').replace(/\D+/g,'');
  const missingReasons = () => {
    const m = [];
    if (!store) m.push({key:'store',    label:'tienda (?store=...)'});
    if (!(rating >= 1 && rating <= 5))       m.push({key:'rating',   label:'calificación'});
    if (!(nps !== null && nps >= 0 && nps <= 10)) m.push({key:'nps', label:'NPS (0–10)'});
    if (!(Array.isArray(tags) && tags.length >= 1)) m.push({key:'tags', label:'motivo(s)'});
    if (!WAIT.includes(waitTime))            m.push({key:'wait',     label:'tiempo de espera'});
    if (!TRAMITE.includes(tramite))          m.push({key:'tramite',  label:'tipo de trámite'});
    if (typeof resolved !== 'boolean')       m.push({key:'resolved', label:'¿se resolvió?'});
    if (!(nameRef.current?.value || '').trim())    m.push({key:'name',  label:'nombre'});
    if (phoneDigits().length < 7)            m.push({key:'phone',    label:'celular (≥7 dígitos)'});
    if (!(staffRef.current?.value || '').trim())   m.push({key:'staff',  label:'asesor'});
    if (!(commentRef.current?.value || '').trim()) m.push({key:'comment',label:'comentario'});
    return m;
  };

  const focusFirstMissing = (list) => {
    const first = list[0]?.key;
    if (first === 'name')    nameRef.current?.focus();
    if (first === 'phone')   phoneRef.current?.focus();
    if (first === 'staff')   staffRef.current?.focus();
    if (first === 'comment') commentRef.current?.focus();
  };

  // Envío (validación al enviar)
  const submit = async () => {
    if (loading) return;
    const miss = missingReasons();
    if (miss.length > 0) {
      alert('Falta: ' + miss.map(x => x.label).join(', '));
      focusFirstMissing(miss);
      return;
    }

    setLoading(true); setOk(null);
    try {
      const payload = {
        store_id: store,
        submitted_at: new Date().toISOString(),
        rating,
        nps_score: nps,
        category_tags: tags,
        wait_time: waitTime,
        staff_name: (staffRef.current?.value || '').trim(),
        procedure_type: tramite,
        issue_resolved: resolved,
        customer_name: (nameRef.current?.value || '').trim(),
        contact: phoneDigits(),
        comment: (commentRef.current?.value || '').trim(),
      };

      const resp = await fetch('/api/review', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setOk(resp.ok);

      if (resp.ok) {
        // Limpieza de selecciones y textos
        setRating(0); setNps(null); setTags([]);
        setWaitTime(''); setTramite(''); setResolved(null);
        if (nameRef.current)    nameRef.current.value    = '';
        if (phoneRef.current)   phoneRef.current.value   = '';
        if (staffRef.current)   staffRef.current.value   = '';
        if (commentRef.current) commentRef.current.value = '';
        alert('¡Enviado!');
      } else {
        const txt = await resp.text();
        alert(`Error al enviar (${resp.status}). ${txt.slice(0,200)}`);
      }
    } catch {
      setOk(false);
      alert('Ocurrió un error de red al enviar.');
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
        width:36, height:36, borderRadius:8, border:'1px solid #d1d5db',
        background: nps===v ? '#111':'#fff', color: nps===v ? '#fff':'#111', cursor:'pointer'
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
          ref={staffRef}
          type="text"
          defaultValue=""
          placeholder="Nombre del asesor"
          autoComplete="organization-title"
          style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid #d1d5db' }}
        />
      </Section>

      <Section title="Tus datos">
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
            inputMode="numeric"
            pattern="\d*"
            maxLength={15}
            onInput={(e)=>{ e.currentTarget.value = e.currentTarget.value.replace(/\D+/g,''); }}
            style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid #d1d5db' }}
          />
        </div>
      </Section>

      <Section title="Cuéntanos">
        <textarea
          ref={commentRef}
          rows={4}
          defaultValue=""
          placeholder="¿Qué estuvo excelente o qué mejorar?"
          style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid #d1d5db' }}
        />
      </Section>

      <button
        type="button"
        onClick={submit}
        aria-busy={loading ? 'true' : 'false'}
        style={{
          marginTop:22, width:'100%', padding:14, borderRadius:12, border:'1px solid #0b6b8e',
          background: loading ? '#9ccfea' : '#0ea5e9',
          color:'#001', fontWeight:800, cursor: loading ? 'wait' : 'pointer'
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



