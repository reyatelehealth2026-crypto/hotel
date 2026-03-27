import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SmartHotel PMS',
  description: 'Professional Hotel Property Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
