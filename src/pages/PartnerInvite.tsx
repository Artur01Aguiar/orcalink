import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Logo } from '../components/Logo'

const COOKIE_REF = 'orcalink_ref'
const COOKIE_TIER = 'orcalink_tier'

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86400_000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

export default function PartnerInvite() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    ;(async () => {
      const { data, error } = await supabase.rpc('consume_partner_invite', { p_slug: slug })
      if (error || !data?.valid) {
        setError('Este convite expirou ou já foi usado.')
        return
      }
      setCookie(COOKIE_TIER, 'partner', 30)
      if (data.ref_code) setCookie(COOKIE_REF, data.ref_code, 30)
      // Redireciona pra signup direto
      navigate('/login?signup=true', { replace: true })
    })()
  }, [slug, navigate])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', padding: '24px 16px' }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
          <Logo size="md" />
        </div>
        <div className="card" style={{ padding: '40px 28px' }}>
          {error ? (
            <>
              <div style={{ width: 56, height: 56, backgroundColor: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28, color: '#DC2626' }}>×</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0A0A0A', marginBottom: 8 }}>Convite inválido</h2>
              <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>{error}</p>
              <button onClick={() => navigate('/')} className="btn-primary" style={{ padding: '10px 20px' }}>
                Ir para a OrcaLink
              </button>
            </>
          ) : (
            <>
              <div className="spinner" style={{ margin: '0 auto 20px' }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0A0A0A', marginBottom: 6 }}>Validando seu convite...</h2>
              <p style={{ fontSize: 13, color: '#64748B' }}>Preparando seu acesso Pro grátis.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
