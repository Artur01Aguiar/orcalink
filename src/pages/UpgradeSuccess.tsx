import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function UpgradeSuccess() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!user) return
    // Polling até o webhook atualizar o plano (máx 10s)
    let attempts = 0
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      if (data?.plan === 'pro' || attempts >= 10) {
        clearInterval(interval)
        setConfirmed(true)
      }
      attempts++
    }, 1000)
    return () => clearInterval(interval)
  }, [user])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', padding: '24px 16px' }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
        {!confirmed ? (
          <>
            <div style={{ width: 64, height: 64, margin: '0 auto 24px' }}>
              <div className="spinner" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0A0A0A', marginBottom: 8 }}>Confirmando pagamento...</h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>Só um segundo, estamos ativando seu plano Pro.</p>
          </>
        ) : (
          <>
            <div style={{ width: 80, height: 80, backgroundColor: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px' }}>🎉</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0A0A0A', marginBottom: 10 }}>Bem-vindo ao Pro!</h1>
            <p style={{ fontSize: 15, color: '#64748B', marginBottom: 32, lineHeight: 1.6 }}>
              Seu plano foi ativado. Formulários ilimitados, orçamentos ilimitados, sem badge.
            </p>
            <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 14, padding: '20px 24px', marginBottom: 28, textAlign: 'left' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8', marginBottom: 12 }}>O que você ganhou:</p>
              {['Formulários ilimitados', 'Orçamentos ilimitados por mês', 'Sem badge "Feito com OrcaLink"', 'Suporte prioritário'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 14, color: '#0A0A0A' }}>{item}</span>
                </div>
              ))}
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: 15 }}
              onClick={() => navigate('/dashboard')}
            >
              Ir para o Dashboard →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
