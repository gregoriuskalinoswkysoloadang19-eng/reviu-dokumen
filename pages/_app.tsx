import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/lib/theme'
import { TooltipProvider } from '@/components/ui/Tooltip'
import '@/styles/globals.css'

const display = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700', '800'] })
const body = Inter({ subsets: ['latin'], variable: '--font-body', weight: ['400', '500', '600'] })

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && router.pathname !== '/login') {
        router.push('/login')
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && router.pathname !== '/login') {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <ThemeProvider>
      <TooltipProvider>
        <div className={`${display.variable} ${body.variable} font-sans`}>
          {loading ? (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface-canvas)' }}>
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center font-display font-bold text-white text-lg mx-auto mb-4 animate-pulse">
                  D
                </div>
                <p className="text-sm text-ink-tertiary">Memuat DRES...</p>
              </div>
            </div>
          ) : (
            <Component {...pageProps} />
          )}
        </div>
      </TooltipProvider>
    </ThemeProvider>
  )
}
