import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function Page() {
  // redirige y mantiene los query params (?store=CEN)
  const qs = typeof window === 'undefined' ? '' : window.location.search;
  redirect(`/reviews${qs || ''}`);
}
