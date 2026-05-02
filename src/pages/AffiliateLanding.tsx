import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuth } from '../contexts/AuthContext'

export default function AffiliateLanding() {
  const navigate = useNavigate()
  const { user } = useAuth()

  function handleCTA() {
    if (user) navigate('/dashboard/afiliados')
    else navigate('/login?signup=true')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <header style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ textDecoration: 'none' }}><Logo /></a>
          <button onClick={handleCTA} className="btn-primary" style={{ fontSize: 13, padding: '9px 16px' }}>
            {user ? 'Ir pra meu painel' : 'Entrar'}
          </button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section style={{ padding: '64px 24px 48px', textAlign: 'center' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <span style={{
              display: 'inline-block', backgroundColor: '#EFF6FF', color: '#2563EB',
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.8px',
            }}>
              Programa de afiliados
            </span>
            <h1 style={{ fontSize: 42, fontWeight: 800, color: '#0A0A0A', lineHeight: 1.15, marginBottom: 16 }}>
              Ganhe indicando a OrcaLink
            </h1>
            <p style={{ fontSize: 17, color: '#64748B', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.55 }}>
              Compartilhe seu link, alguém assina o Pro e você recebe <strong>R$20,93</strong> (70% do primeiro mês).
              Pago via PIX. Sem burocracia.
            </p>
            <button onClick={handleCTA} className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
              Criar minha conta e pegar meu link →
            </button>
            <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 14 }}>
              Grátis · Sem mensalidade · Saque a qualquer momento
            </p>
          </div>
        </section>

        {/* Como funciona */}
        <section style={{ padding: '32px 24px 64px' }}>
          <div style={{ maxWidth: 980, margin: '0 auto' }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0A0A0A', textAlign: 'center', marginBottom: 40 }}>
              Como funciona
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { n: 1, t: 'Pegue seu link', d: 'Crie sua conta grátis e gere seu link de afiliado em 1 clique.' },
                { n: 2, t: 'Compartilhe', d: 'Mande pra fotógrafos, designers, tatuadores — qualquer autônomo.' },
                { n: 3, t: 'Receba R$20,93', d: 'Cada vez que alguém assina o Pro pelo seu link, você ganha (primeiro mês).' },
              ].map(s => (
                <div key={s.n} className="card" style={{ padding: '28px 24px', textAlign: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    backgroundColor: '#2563EB', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 800, margin: '0 auto 16px',
                  }}>{s.n}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0A0A0A', marginBottom: 8 }}>{s.t}</h3>
                  <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.55 }}>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comissão */}
        <section style={{ padding: '40px 24px', backgroundColor: '#fff', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0A0A0A', marginBottom: 28 }}>
              Quanto você ganha
            </h2>
            <div className="grid sm:grid-cols-2 gap-4" style={{ textAlign: 'left' }}>
              <div className="card" style={{ padding: '22px 24px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Open</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: '#2563EB' }}>R$20,93</p>
                <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>70% do primeiro mês — pagamento único por cliente.</p>
              </div>
              <div className="card" style={{ padding: '22px 24px', border: '1.5px solid #BFDBFE', backgroundColor: '#F0F9FF' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Partner (convite)</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: '#1D4ED8' }}>R$14,95/mês + Pro grátis</p>
                <p style={{ fontSize: 13, color: '#3B82F6', marginTop: 4 }}>50% recorrente — todo mês enquanto o cliente continuar pagando.</p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 16 }}>
              Acesso Partner é por convite manual.
            </p>
          </div>
        </section>

        {/* CTA final */}
        <section style={{ padding: '64px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0A0A0A', marginBottom: 12 }}>
            Pronto pra começar?
          </h2>
          <p style={{ fontSize: 15, color: '#64748B', marginBottom: 28 }}>
            Leva menos de 1 minuto pra gerar seu link.
          </p>
          <button onClick={handleCTA} className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
            {user ? 'Ir pra meu painel →' : 'Criar conta grátis →'}
          </button>
        </section>
      </main>

      <footer style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid #F1F5F9', backgroundColor: '#fff' }}>
        <p style={{ fontSize: 12, color: '#94A3B8' }}>© 2026 OrcaLink</p>
      </footer>
    </div>
  )
}
