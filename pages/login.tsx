import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  BarChart3,
  Users,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ThemeSwitch from '@/components/ui/ThemeSwitch'
import Checkbox from '@/components/ui/Checkbox'
import { cn } from '@/lib/utils'

const REMEMBER_KEY = 'dres-remember-email'

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Secure & Trusted',
    desc: 'Protected using enterprise-grade encryption and authentication.',
  },
  {
    icon: BarChart3,
    title: 'Integrated',
    desc: 'Review, evaluation and monitoring inside one unified platform.',
  },
  {
    icon: Users,
    title: 'Collaborative',
    desc: 'Support collaboration between reviewers, evaluators and administrators.',
  },
]

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23.49 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.44a5.5 5.5 0 0 1-2.39 3.6v3h3.86c2.26-2.08 3.58-5.15 3.58-8.78Z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.86-3c-1.08.72-2.46 1.15-4.09 1.15-3.15 0-5.82-2.13-6.77-4.99H1.24v3.1A12 12 0 0 0 12 24Z"
        fill="#34A853"
      />
      <path d="M5.23 14.26A7.2 7.2 0 0 1 4.86 12c0-.79.14-1.56.37-2.26v-3.1H1.24A12 12 0 0 0 0 12c0 1.94.46 3.77 1.24 5.36l3.99-3.1Z" fill="#FBBC05" />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.24 6.64l3.99 3.1C6.18 6.88 8.85 4.75 12 4.75Z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)

  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(REMEMBER_KEY) : null
    if (saved) {
      setEmail(saved)
      setRemember(true)
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email atau password salah. Silakan coba lagi.')
      setLoading(false)
    } else {
      if (typeof window !== 'undefined') {
        if (remember) window.localStorage.setItem(REMEMBER_KEY, email)
        else window.localStorage.removeItem(REMEMBER_KEY)
      }
      router.push('/')
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setResetLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail)
    setResetLoading(false)
    if (error) {
      setError('Gagal mengirim tautan reset. Periksa kembali email Anda.')
    } else {
      setResetSent(true)
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
    })
    if (error) {
      setError('Gagal masuk dengan Google. Silakan coba lagi.')
      setGoogleLoading(false)
    }
  }

  const year = new Date().getFullYear()

  return (
    <>
      <Head>
        <title>Masuk — DRES | Inspectorate of West Sumba Regency</title>
      </Head>

      <div className="relative min-h-screen w-full overflow-hidden bg-[#0a1730]">
        {/* ===== Background image + overlays ===== */}
        <div className="absolute inset-0">
          <motion.img
            src="/login-bg-sumba.jpg"
            alt=""
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 9, ease: 'easeOut' }}
            className="h-full w-full object-cover"
          />
          {/* dark blue gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1730]/92 via-[#0d1f3f]/78 to-[#0a2a44]/60" />
          {/* vignette */}
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 80% 70% at 60% 40%, transparent 30%, rgba(4,9,22,0.55) 100%)' }}
          />
          {/* soft cinematic light from the right */}
          <div
            className="absolute inset-0 opacity-70"
            style={{ background: 'radial-gradient(circle at 82% 30%, rgba(56,209,138,0.10), transparent 45%)' }}
          />
        </div>

        {/* ===== Theme toggle ===== */}
        <div className="absolute right-5 top-5 z-30 sm:right-7 sm:top-6">
          <div className="rounded-lg border border-white/10 bg-black/20 p-0.5 backdrop-blur-md">
            <ThemeSwitch />
          </div>
        </div>

        {/* ===== Content grid ===== */}
        <div className="relative z-10 grid min-h-screen grid-cols-1 md:grid-cols-[1.4fr_1fr]">
          {/* ---------- Left information panel ---------- */}
          <div className="hidden flex-col justify-between px-10 py-10 md:flex md:px-10 lg:px-16 xl:px-24 lg:py-14">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 p-1.5 backdrop-blur">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo-sumba-barat.png" alt="" className="h-full w-full object-contain" />
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/60">
                    Inspektorat Kabupaten Sumba Barat
                  </span>
                </div>

                <h1 className="font-display text-5xl font-extrabold tracking-tight text-white xl:text-6xl">DRES</h1>
                <p className="mt-3 text-lg font-medium text-white/85 xl:text-xl">Document Review &amp; Evaluation System</p>
                <p className="mt-1 text-sm text-white/50">Inspectorate of West Sumba Regency</p>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-white/60">
                  Platform terintegrasi untuk reviu, evaluasi, dan pemantauan dokumen kinerja pemerintahan
                  secara transparan, akurat, dan akuntabel.
                </p>
              </motion.div>

              <div className="mt-10 max-w-md space-y-3 lg:mt-12">
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/[0.08]"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-brand-400/30 to-accent-400/30">
                      <f.icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{f.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/55">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <p className="text-xs text-white/35">© {year} Inspektorat Kabupaten Sumba Barat. Seluruh hak cipta dilindungi.</p>
              <p className="mt-0.5 text-[11px] text-white/25">Pada Eweta Manda Elu</p>
            </motion.div>
          </div>

          {/* ---------- Right glass login card ---------- */}
          <div className="flex items-center justify-center px-5 py-12 sm:px-10 sm:py-14 md:px-8 lg:px-12">
            <div className="w-full max-w-md">
              {/* Mobile-only compact header (left panel is hidden below md) */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 text-center md:hidden"
              >
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-white">DRES</h1>
                <p className="mt-1 text-xs text-white/60">Document Review &amp; Evaluation System</p>
                <p className="text-[11px] text-white/40">Inspectorate of West Sumba Regency</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="relative overflow-hidden rounded-[28px] border border-white/20 bg-white/10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:rounded-[32px]"
              >
                {/* decorative woven-motif pattern (Sumba ikat inspired), kept under 10% opacity */}
                <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden="true">
                  <defs>
                    <pattern id="sumba-motif" width="44" height="44" patternUnits="userSpaceOnUse">
                      <path
                        d="M22 2 L42 22 L22 42 L2 22 Z M22 12 L32 22 L22 32 L12 22 Z"
                        fill="none"
                        stroke="white"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#sumba-motif)" />
                </svg>

                {/* top sheen for glass reflection */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/15 to-transparent" />

                <div className="relative px-7 py-9 sm:px-9 sm:py-10">
                  {/* Logo with glow */}
                  <div className="mb-6 flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 scale-125 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 opacity-50 blur-xl" />
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 16 }}
                        className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white p-2 shadow-soft-lg ring-1 ring-white/60"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/logo-sumba-barat.png"
                          alt="Lambang Kabupaten Sumba Barat"
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            const t = e.currentTarget
                            t.style.display = 'none'
                            const parent = t.parentElement
                            if (parent) {
                              parent.innerHTML =
                                '<div style="width:64px;height:64px;background:linear-gradient(135deg,#2b60ea,#17b271);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:22px;">D</div>'
                            }
                          }}
                        />
                      </motion.div>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="mb-7 text-center"
                  >
                    <h2 className="font-display text-2xl font-bold text-white">Selamat Datang Kembali</h2>
                    <p className="mt-1.5 text-sm text-white/60">Masuk untuk melanjutkan ke DRES</p>
                  </motion.div>

                  <AnimatePresence mode="wait" initial={false}>
                    {mode === 'login' ? (
                      <motion.div
                        key="login"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ duration: 0.25 }}
                      >
                        <form onSubmit={handleLogin} className="space-y-4">
                          {/* Email — floating label */}
                          <div className="relative">
                            <input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder=" "
                              required
                              className="peer w-full rounded-xl border border-white/15 bg-white/5 pb-2 pl-10 pr-4 pt-5 text-sm text-white shadow-soft-xs transition-all placeholder-shown:pt-3.5 focus:border-accent-400/60 focus:bg-white/10 focus:shadow-focus-ring focus:outline-none"
                            />
                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 transition-colors peer-focus:text-accent-300" />
                            <label
                              htmlFor="email"
                              className={cn(
                                'pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-white/40 transition-all duration-150',
                                'peer-focus:top-3.5 peer-focus:text-[10.5px] peer-focus:text-accent-300',
                                'peer-[&:not(:placeholder-shown)]:top-3.5 peer-[&:not(:placeholder-shown)]:text-[10.5px] peer-[&:not(:placeholder-shown)]:text-white/50'
                              )}
                            >
                              Email
                            </label>
                          </div>

                          {/* Password — floating label */}
                          <div className="relative">
                            <input
                              id="password"
                              type={showPass ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder=" "
                              required
                              className="peer w-full rounded-xl border border-white/15 bg-white/5 pb-2 pl-10 pr-10 pt-5 text-sm text-white shadow-soft-xs transition-all placeholder-shown:pt-3.5 focus:border-accent-400/60 focus:bg-white/10 focus:shadow-focus-ring focus:outline-none"
                            />
                            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 transition-colors peer-focus:text-accent-300" />
                            <label
                              htmlFor="password"
                              className={cn(
                                'pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-white/40 transition-all duration-150',
                                'peer-focus:top-3.5 peer-focus:text-[10.5px] peer-focus:text-accent-300',
                                'peer-[&:not(:placeholder-shown)]:top-3.5 peer-[&:not(:placeholder-shown)]:text-[10.5px] peer-[&:not(:placeholder-shown)]:text-white/50'
                              )}
                            >
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowPass((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/80"
                              aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                            >
                              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-0.5 text-xs">
                            <label className="flex cursor-pointer select-none items-center gap-2 text-white/60">
                              <Checkbox
                                checked={remember}
                                onCheckedChange={(v) => setRemember(!!v)}
                                className="h-4 w-4 border-white/25 bg-white/5 data-[state=checked]:border-accent-500 data-[state=checked]:bg-accent-500"
                              />
                              Ingat saya
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setMode('reset')
                                setResetEmail(email)
                                setError('')
                              }}
                              className="font-medium text-accent-300 transition-colors hover:text-accent-200"
                            >
                              Lupa Password?
                            </button>
                          </div>

                          {error && (
                            <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-white">
                              <AlertCircle className="h-4 w-4 flex-shrink-0 text-danger" />
                              {error}
                            </div>
                          )}

                          <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.01 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/30 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #06b6d4 52%, #10b981 100%)' }}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Memproses...
                              </>
                            ) : (
                              <>
                                Masuk
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </motion.button>
                        </form>

                        <div className="my-6 flex items-center gap-3">
                          <div className="h-px flex-1 bg-white/15" />
                          <span className="text-xs text-white/40">atau</span>
                          <div className="h-px flex-1 bg-white/15" />
                        </div>

                        <motion.button
                          type="button"
                          onClick={handleGoogleLogin}
                          disabled={googleLoading}
                          whileHover={{ scale: googleLoading ? 1 : 1.01 }}
                          whileTap={{ scale: googleLoading ? 1 : 0.98 }}
                          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-medium text-white/90 shadow-soft-xs transition-all hover:border-white/25 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {googleLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <GoogleIcon className="h-4 w-4" />
                          )}
                          Masuk dengan Google
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="reset"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.25 }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMode('login')
                            setResetSent(false)
                            setError('')
                          }}
                          className="mb-5 flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white/85"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          Kembali ke login
                        </button>

                        {resetSent ? (
                          <div className="py-4 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/15">
                              <CheckCircle2 className="h-6 w-6 text-accent-300" />
                            </div>
                            <p className="text-sm font-medium text-white">Tautan reset terkirim</p>
                            <p className="mt-1 text-xs leading-relaxed text-white/50">
                              Periksa kotak masuk <span className="text-white/70">{resetEmail}</span> untuk instruksi
                              selanjutnya.
                            </p>
                          </div>
                        ) : (
                          <form onSubmit={handleReset} className="space-y-4">
                            <p className="-mt-1 mb-1 text-xs leading-relaxed text-white/50">
                              Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang password.
                            </p>

                            <div className="relative">
                              <input
                                id="reset-email"
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder=" "
                                required
                                className="peer w-full rounded-xl border border-white/15 bg-white/5 pb-2 pl-10 pr-4 pt-5 text-sm text-white shadow-soft-xs transition-all placeholder-shown:pt-3.5 focus:border-accent-400/60 focus:bg-white/10 focus:shadow-focus-ring focus:outline-none"
                              />
                              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 transition-colors peer-focus:text-accent-300" />
                              <label
                                htmlFor="reset-email"
                                className={cn(
                                  'pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-white/40 transition-all duration-150',
                                  'peer-focus:top-3.5 peer-focus:text-[10.5px] peer-focus:text-accent-300',
                                  'peer-[&:not(:placeholder-shown)]:top-3.5 peer-[&:not(:placeholder-shown)]:text-[10.5px] peer-[&:not(:placeholder-shown)]:text-white/50'
                                )}
                              >
                                Email
                              </label>
                            </div>

                            {error && (
                              <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-white">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 text-danger" />
                                {error}
                              </div>
                            )}

                            <motion.button
                              type="submit"
                              disabled={resetLoading}
                              whileHover={{ scale: resetLoading ? 1 : 1.01 }}
                              whileTap={{ scale: resetLoading ? 1 : 0.98 }}
                              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/30 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #06b6d4 52%, #10b981 100%)' }}
                            >
                              {resetLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Mengirim...
                                </>
                              ) : (
                                'Kirim Tautan Reset'
                              )}
                            </motion.button>
                          </form>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Mobile-only footer */}
              <p className="mt-6 text-center text-[11px] text-white/35 md:hidden">
                © {year} Inspektorat Kabupaten Sumba Barat · Pada Eweta Manda Elu
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
