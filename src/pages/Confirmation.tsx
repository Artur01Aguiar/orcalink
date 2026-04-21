import { useLocation } from 'react-router-dom'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Logo } from '../components/Logo'
import type { Question } from '../lib/types'

interface LocationState {
  formTitle?: string
  total?: number
  answers?: Record<string, string | string[] | number>
  questions?: Question[]
  whatsappLink?: string
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Confirmation() {
  const location = useLocation()
  const { total, answers, questions, whatsappLink } = (location.state ?? {}) as LocationState

  function getAnswerLabel(q: Question): string {
    const a = answers?.[q.id]
    if (!a) return '—'
    if (Array.isArray(a)) return a.join(', ')
    if (typeof a === 'number') return `${a} unidade${a !== 1 ? 's' : ''}`
    return String(a)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #F1F5F9', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo size="sm" />
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div className="card" style={{ padding: '44px 40px', textAlign: 'center' }}>
            {/* Checkmark */}
            <div style={{
              width: 80, height: 80,
              backgroundColor: '#DCFCE7',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <span style={{ fontSize: 36, color: '#16A34A', fontWeight: 800 }}>✓</span>
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0A0A0A', marginBottom: 8 }}>
              Orçamento enviado!
            </h1>
            <p style={{ fontSize: 15, color: '#64748B', marginBottom: 32, lineHeight: 1.6 }}>
              O profissional vai te contatar em breve<br />com os próximos passos.
            </p>

            {/* Resumo */}
            {questions && answers && (
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: 14,
                padding: '20px 24px',
                marginBottom: 24,
                textAlign: 'left',
              }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 14 }}>Resumo do orçamento</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {questions.map(q => (
                    <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <span style={{ fontSize: 13, color: '#64748B', lineHeight: 1.4 }}>{q.label}</span>
                      <span style={{ fontSize: 13, color: '#0A0A0A', fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>{getAnswerLabel(q)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #E2E8F0', marginTop: 14, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>Total estimado</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#2563EB' }}>
                    {total !== undefined ? formatCurrency(total) : '—'}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>O profissional confirma o valor final ao te contatar.</p>
              </div>
            )}

            {/* WhatsApp */}
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank" rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  width: '100%', padding: '14px 0',
                  backgroundColor: '#25D366', color: '#fff',
                  borderRadius: 12, fontSize: 13, fontWeight: 700,
                  textDecoration: 'none', marginBottom: 12,
                  boxShadow: '0 4px 14px rgba(37,211,102,0.3)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Falar com o profissional no WhatsApp
              </a>
            )}
          </div>

          {/* Badge OrcaLink */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 20,
              fontSize: 12, color: '#2563EB', fontWeight: 600,
            }}>
              ⚡ Feito com OrcaLink
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
