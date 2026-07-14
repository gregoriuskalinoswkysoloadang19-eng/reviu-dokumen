import { useState } from 'react'
import { useRouter } from 'next/router'
import { Plus, UploadCloud, FilePlus2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACTIONS = [
  { label: 'Upload Dokumen', icon: UploadCloud, href: '/repositori' },
  { label: 'Tambah Review', icon: FilePlus2, href: '/register' },
]

export default function QuickActionFAB() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col items-end gap-2 animate-slide-up">
          {ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => { router.push(action.href); setOpen(false) }}
                className="flex items-center gap-2.5 pl-4 pr-3 h-11 rounded-full bg-surface-raised border border-border shadow-soft-lg text-sm font-medium text-ink-primary hover:bg-surface-sunken transition-colors"
              >
                {action.label}
                <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </span>
              </button>
            )
          })}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Aksi cepat"
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center text-white shadow-soft-xl transition-all duration-300',
          'bg-gradient-to-br from-brand-500 to-accent-500 hover:brightness-105',
          open && 'rotate-45'
        )}
      >
        {open ? <X className="w-5 h-5" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  )
}
