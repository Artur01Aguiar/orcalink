interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  darkBg?: boolean
}

export function Logo({ size = 'md', darkBg = false }: LogoProps) {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }
  const linkColor = darkBg ? 'text-white' : 'text-[#0A0A0A]'

  return (
    <span className={`font-bold ${sizes[size]} tracking-tight`}>
      <span style={{ color: '#2563EB' }}>orca</span>
      <span className={linkColor}>link</span>
    </span>
  )
}
