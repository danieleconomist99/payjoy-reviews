// Fuerza render dinámico (sin caché)
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import FormClient from '../form/FormClient'; // reutilizamos tu componente

export default function Page() {
  return <FormClient buildTag="v7" />; // verás "build: v7" abajo
}
