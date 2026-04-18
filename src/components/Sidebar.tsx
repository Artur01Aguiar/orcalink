import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Logo } from './Logo'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/respostas', label: 'Respostas', icon: '☰' },
]

export function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initial = user?.email?.charAt(0).toUpperCase() ?? 'U'

  return (
    <aside style={{
      width: 232,
      minHeight: '100vh',
      backgroundColor: '#0A0A0A',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '28px 24px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          width: 32, height: 32,
          backgroundColor: '#2563EB',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, color: '#fff', fontSize: 14,
        }}>O</div>
        <Logo darkBg />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '0 12px 16px' }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderRadius: 10,
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 28, height: 28,
            backgroundColor: '#2563EB',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>{initial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email?.split('@')[0]}
            </p>
            <p style={{ color: '#475569', fontSize: 11 }}>Plano Grátis</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sair"
            style={{ color: '#475569', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >↩</button>
        </div>
      </div>
    </aside>
  )
}
