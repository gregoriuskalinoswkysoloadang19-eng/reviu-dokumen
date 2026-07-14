import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export type Crumb = { label: string; href?: string }

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  if (!items.length) return null
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-tertiary">
      {items.map((item, i) => {
        const last = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            {item.href && !last ? (
              <Link href={item.href} className="hover:text-ink-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={last ? 'text-ink-primary font-medium' : ''}>{item.label}</span>
            )}
            {!last && <ChevronRight className="w-3 h-3" />}
          </span>
        )
      })}
    </nav>
  )
}
