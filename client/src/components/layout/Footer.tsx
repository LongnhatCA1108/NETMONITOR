// ponytail: standard bottom footer component
interface FooterProps {
  theme: 'dark' | 'light'
}

export function Footer({ theme }: FooterProps) {
  return (
    <footer className="shrink-0 border-t border-zinc-200 dark:border-zinc-800/80 py-4 px-8 text-xs text-zinc-500 font-mono flex items-center justify-between">
      <span>MeshGuard SOC Dashboard • Tailscale Mesh Monitoring</span>
      <span className="hidden sm:inline font-semibold">
        Chế độ: {theme === 'dark' ? 'Tối (Dark)' : 'Sáng (Light)'}
      </span>
    </footer>
  )
}
