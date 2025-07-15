import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: 'CureAI - Symptom Analyser and Diet Planner',
  description:
    'Your AI-powered symptoms analyzer and diet planner.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M50 15C50 12.2386 52.2386 10 55 10H85C87.7614 10 90 12.2386 90 15V45C90 47.7614 87.7614 50 85 50H55C52.2386 50 50 47.7614 50 45V15Z' fill='%23A0D2EB' style='opacity: 0.8;'/><path d='M15 50C12.2386 50 10 52.2386 10 55V85C10 87.7614 12.2386 90 15 90H45C47.7614 90 50 87.7614 50 85V55C50 52.2386 47.7614 50 45 50H15Z' fill='%23BDECB6'/><path d='M15 50C12.2386 50 10 47.7614 10 45V15C10 12.2386 12.2386 10 15 10H45C47.7614 10 50 12.2386 50 15V45C50 47.7614 47.7614 50 45 50H15Z' fill='%23BDECB6' style='opacity: 0.8;'/><path d='M50 85C50 87.7614 52.2386 90 55 90H85C87.7614 90 90 87.7614 90 85V55C90 52.2386 87.7614 50 85 50H55C52.2386 50 50 52.2386 50 55V85Z' fill='%23A0D2EB'/></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
