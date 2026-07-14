import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

const options = [
  { value: 'light' as const, icon: Sun, label: 'Mode terang' },
  { value: 'system' as const, icon: Monitor, label: 'Ikuti sistem' },
  { value: 'dark' as const, icon: Moon, label: 'Mode gelap' },
]

export default function ThemeSwitch() {
  const { mode, setMode } = useTheme()
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-surface-sunken p-0.5">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          title={label}
          onClick={() => setMode(value)}
          className={cn(
            'h-7 w-7 flex items-center justify-center rounded-md transition-all',
            mode === value ? 'bg-surface-raised text-brand-600 shadow-soft-xs' : 'text-ink-tertiary hover:text-ink-primary'
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  )
}
