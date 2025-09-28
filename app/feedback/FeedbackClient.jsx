'use client';
import { useEffect, useMemo, useState } from 'react';

const TAGS = ['espera','pago','precio','atención','garantía','disponibilidad','otro'];
const WAIT = ['< 5 min','5–10 min','10–20 min','> 20 min'];
const TRAMITE = ['Compra','Pago','Garantía','Consulta'];

export default function FeedbackClient() {
  const [store, setStore] = useState('');
  const [rating, setRating] = useState(0);
  const [nps, setNps] = useState(null);
  const [tags, setTags] = useState([]);
  const [waitTime, setWaitTime] = useState('');
  const [staff, setStaff] = useState('');
  const [tramite, setTramite] = useState('');
  const [resolved, setResolved] = useState(null); // true/false
  const [wantFollow, setWantFollow] = useState(false);
  const [contact, setContact] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

