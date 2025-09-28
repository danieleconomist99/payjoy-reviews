export const metadata = { title: 'PayJoy Reviews', description: 'MVP' };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ background:'#fff', color:'#111', fontFamily:'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}

