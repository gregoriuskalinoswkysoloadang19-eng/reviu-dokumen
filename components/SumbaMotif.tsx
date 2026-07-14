import { cn } from '@/lib/utils'

/**
 * Subtle geometric pattern inspired by Sumba ikat (tenun) weaving —
 * repeating diamonds and key-lines — rendered as a low-opacity SVG
 * background layer. Decorative only, purely presentational, and safe to
 * drop behind any section without affecting layout or interaction.
 */
export default function SumbaMotif({ className, opacity = 0.06 }: { className?: string; opacity?: number }) {
  return (
    <svg
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 w-full h-full', className)}
      style={{ opacity }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="sumba-motif" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M32 4 L60 32 L32 60 L4 32 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="32" cy="32" r="4" fill="currentColor" />
          <path d="M0 32 H12 M52 32 H64 M32 0 V12 M32 52 V64" stroke="currentColor" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sumba-motif)" />
    </svg>
  )
}
