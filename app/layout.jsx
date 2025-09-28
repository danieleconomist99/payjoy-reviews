export const metadata = {
  title: 'PayJoy Reviews',
  description: 'MVP formulario de reviews',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        style={{
          background: '#ffffff',          // ← FONDO BLANCO
          color: '#111111',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          lineHeight: 1.45,
        }}
      >
        {children}
      </body>
    </html>
  );
}

