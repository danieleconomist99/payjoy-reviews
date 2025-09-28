export const metadata = {
  title: 'PayJoy Reviews',
  description: 'MVP formulario de reviews',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ background: '#0b0b0c', color: '#e6e6e6', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
