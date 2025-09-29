// Home como Server Component (sin hooks)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>PayJoy Reviews</h1>
      <p>
        Ir al formulario:{' '}
        <a href="/feedback?store=CEN">/feedback?store=CEN</a>
        <a href="/feedback?store=NOR">/feedback?store=CEN</a>
        <a href="/feedback?store=SUR">/feedback?store=CEN</a>
      </p>
    </main>
  );
}
