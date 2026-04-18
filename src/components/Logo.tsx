interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  darkBg?: boolean
  allWhite?: boolean
}

export function Logo({ size = 'md', darkBg = false, allWhite = false }: LogoProps) {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }
  const orcaColor = allWhite ? '#fff' : '#2563EB'
  const linkColor = allWhite ? '#fff' : darkBg ? '#fff' : '#0A0A0A'

  return (
    <span className={`font-bold ${sizes[size]} tracking-tight`}>
      <span style={{ color: orcaColor }}>orca</span>
      <span style={{ color: linkColor }}>link</span>
    </span>
  )
}
