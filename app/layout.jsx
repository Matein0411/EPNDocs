import './globals.css'

export const metadata = {
  title: 'EPNDocs',
  description: 'Plataforma de material académico',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}