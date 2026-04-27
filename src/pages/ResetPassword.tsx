import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Logo } from '../components/Logo'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase coloca o token no hash da URL após o clique no email
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 6) { setError('Mínimo 6 caracteres.'); return }
    setError(''); setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError('Erro ao redefinir. Tente solicitar um novo link.')
    else setSuccess(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
          <Logo size="md" />
        </div>

        <div className="card" style={{ padding: '32px 28px' }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, backgroundColor: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 20px', color: '#16A34A' }}>✓</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0A0A0A', marginBottom: 8 }}>Senha redefinida!</h2>
              <p style={{ fontSize: 14, color: '#64748B', marginBottom: 28 }}>Sua senha foi atualizada com sucesso.</p>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px 0' }} onClick={() => navigate('/dashboard')}>
                Ir para o Dashboard →
              </button>
            </div>
          ) : !ready ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: 14, color: '#64748B' }}>Verificando link...</p>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>Se demorar muito, solicite um novo link de redefinição.</p>
              <button onClick={() => navigate('/login')} style={{ marginTop: 16, fontSize: 13, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Voltar ao login
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0A0A0A', marginBottom: 4 }}>Nova senha</h2>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 28 }}>Digite e confirme sua nova senha.</p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nova senha</label>
                  <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Confirmar senha</label>
                  <input type="password" className="input" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repita a senha" required minLength={6} />
                </div>

                {error && (
                  <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#DC2626' }}>{error}</div>
                )}

                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px 0', fontSize: 15 }} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar nova senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
