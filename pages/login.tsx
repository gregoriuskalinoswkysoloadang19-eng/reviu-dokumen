import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ThemeSwitch from '@/components/ui/ThemeSwitch'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email atau password salah. Silakan coba lagi.')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <>
      <Head>
        <title>Masuk — DRES | Inspectorate of West Sumba Regency</title>
      </Head>
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ background: 'radial-gradient(circle at 20% 20%, #1a3aa8 0%, #16295f 45%, #0d1836 100%)' }}
      >
        {/* Ambient glow shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-accent-500/20 blur-3xl" />

        <div className="absolute top-5 right-5 z-10">
          <ThemeSwitch />
        </div>

        <div className="w-full max-w-md relative z-10 animate-slide-up">
          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-soft-xl overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-9 pb-7 text-center border-b border-white/10">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-white p-1.5 shadow-soft-lg overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-sumba-barat.png"
                    alt="Lambang Kabupaten Sumba Barat"
                    width={72}
                    height={72}
                    style={{ objectFit: 'contain', width: '72px', height: '72px' }}
                    onError={(e) => {
                      const t = e.currentTarget
                      t.style.display = 'none'
                      const parent = t.parentElement
                      if (parent) {
                        parent.innerHTML = '<div style="width:72px;height:72px;background:linear-gradient(135deg,#2b60ea,#17b271);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:22px;">D</div>'
                      }
                    }}
                  />
                </div>
              </div>

              <h1 className="font-display font-bold text-white text-xl tracking-tight">DRES</h1>
              <p className="text-white/70 text-sm mt-1">Document Review &amp; Evaluation System</p>
              <p className="text-white/45 text-xs mt-1">Inspectorate of West Sumba Regency</p>
            </div>

            {/* Form */}
            <div className="px-8 py-7 bg-surface-raised">
              <h2 className="text-sm font-semibold text-ink-primary mb-5 text-center">Masuk ke akun Anda</h2>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
                    <input
                      type="email"
                      className="input pl-9"
                      placeholder="nama@sumbabarat.go.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="input pl-9 pr-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-secondary"
                      aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-danger-subtle border border-danger/20 p-3 text-sm text-danger-strong">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : 'Masuk'}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 pb-6 text-center bg-surface-raised">
              <p className="text-[11px] text-ink-tertiary">DRES v1.0.0 · © {new Date().getFullYear()} Inspektorat Kabupaten Sumba Barat</p>
              <p className="text-[11px] text-ink-tertiary/70 mt-0.5">Pada Eweta Manda Elu</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
