import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Logo } from '../components/Logo'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email ou senha incorretos.')
      else navigate('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('Conta criada! Verifique seu email para confirmar.')
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) setError('Erro ao entrar com Google.')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F8FAFC' }}>

      {/* Painel esquerdo — brand */}
      <div style={{
        width: 520, flexShrink: 0,
        backgroundColor: '#2563EB',
        padding: '48px 52px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Círculos decorativos */}
        <div style={{ position: 'absolute', bottom: -60, right: -80, width: 360, height: 360, borderRadius: '50%', backgroundColor: 'rgba(29,78,216,0.6)' }} />
        <div style={{ position: 'absolute', top: '40%', left: -60, width: 200, height: 200, borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.3)' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo size="lg" allWhite />
        </div>

        {/* Copy */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 46, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Seu cliente vê o<br />preço na hora.
          </h1>
          <p style={{ fontSize: 18, color: '#BFDBFE', marginBottom: 36, lineHeight: 1.5 }}>
            Sem te mandar mensagem.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Formulário inteligente de orçamento',
              'Preço calculado em tempo real',
              'Link fácil de compartilhar',
            ].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>
                </div>
                <span style={{ fontSize: 14, color: '#93C5FD' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#93C5FD', position: 'relative', zIndex: 1 }}>© 2026 OrcaLink</p>
      </div>

      {/* Painel direito */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div className="card" style={{ padding: '36px 40px' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0A0A0A', marginBottom: 4 }}>
              {mode === 'login' ? 'Entrar na sua conta' : 'Criar conta grátis'}
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 28 }}>
              {mode === 'login' ? 'Novo por aqui? ' : 'Já tem conta? '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
                style={{ color: '#2563EB', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0 }}
              >
                {mode === 'login' ? 'Criar conta grátis →' : 'Entrar →'}
              </button>
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
                <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Senha</label>
                  {mode === 'login' && (
                    <button type="button" style={{ fontSize: 12, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>

              {error && (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#DC2626' }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#16A34A' }}>
                  {success}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px 0', fontSize: 15 }} disabled={loading}>
                {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 0' }}>
              <div style={{ flex: 1, height: 1, backgroundColor: '#F1F5F9' }} />
              <span style={{ fontSize: 12, color: '#CBD5E1', flexShrink: 0 }}>ou</span>
              <div style={{ flex: 1, height: 1, backgroundColor: '#F1F5F9' }} />
            </div>

            <button
              onClick={handleGoogleLogin}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', padding: '12px 0', marginTop: 12,
                backgroundColor: '#fff', border: '1.5px solid #E2E8F0',
                borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#374151',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.borderColor = '#2563EB')}
              onMouseOut={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>

            <p style={{ fontSize: 11, color: '#CBD5E1', textAlign: 'center', marginTop: 20 }}>
              Ao entrar, você concorda com os Termos de Uso da OrcaLink.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
