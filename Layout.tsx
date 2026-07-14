export const APP_VERSION = '1.0.0'

export default function Footer() {
  return (
    <footer className="mt-8 pt-4 border-t border-border-subtle text-xs text-ink-tertiary flex flex-col sm:flex-row items-center justify-between gap-1.5">
      <p>
        <span className="font-semibold text-ink-secondary">DRES</span> · Document Review &amp; Evaluation System —{' '}
        Inspectorate of West Sumba Regency
      </p>
      <p>
        v{APP_VERSION} · © {new Date().getFullYear()} Inspektorat Kabupaten Sumba Barat
      </p>
    </footer>
  )
}
