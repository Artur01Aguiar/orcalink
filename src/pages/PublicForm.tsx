import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Logo } from '../components/Logo'
import type { Form, Question, QuestionOption } from '../lib/types'

type Answers = Record<string, string | string[] | number>

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const WA_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export default function PublicForm() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isPreview = searchParams.get('preview') === 'true'

  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answers>({})
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (slug) loadForm(slug) }, [slug])

  async function loadForm(s: string) {
    const { data } = await supabase.from('forms').select('*').eq('slug', s).eq('active', true).single()
    if (!data) { setNotFound(true); setLoading(false); return }
    setForm(data)
    const { data: qs } = await supabase.from('questions').select('*').eq('form_id', data.id).order('order_index')
    setQuestions(qs ?? [])
    setLoading(false)
  }

  function calcTotal(): number {
    return questions.reduce((total, q) => {
      const ans = answers[q.id]
      if (q.type === 'single' && typeof ans === 'string') {
        const opt = q.options.find((o: QuestionOption) => o.label === ans)
        return total + (opt?.price_add ?? 0)
      }
      if (q.type === 'multi' && Array.isArray(ans)) {
        return total + ans.reduce((s, label) => {
          const opt = q.options.find((o: QuestionOption) => o.label === label)
          return s + (opt?.price_add ?? 0)
        }, 0)
      }
      if (q.type === 'number' && typeof ans === 'number') {
        return total + ans * (q.options[0]?.price_add ?? 0)
      }
      return total
    }, 0)
  }

  function buildWhatsAppLink(): string {
    const number = (form as unknown as Record<string, unknown>)?.whatsapp_number as string | undefined
    if (!number) return ''
    const total = calcTotal()
    const lines = questions.map(q => {
      const ans = answers[q.id]
      if (!ans) return null
      const val = Array.isArray(ans) ? ans.join(', ') : String(ans)
      return `• ${q.label}: ${val}`
    }).filter(Boolean)
    const text = `Olá! Fiz um orçamento pelo seu link:\n\n${lines.join('\n')}\n\n*Total: ${formatCurrency(total)}*`
    return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
  }

  function handleSingle(qId: string, label: string) {
    setAnswers(prev => ({ ...prev, [qId]: label }))
  }

  function handleMulti(qId: string, label: string) {
    const cur = (answers[qId] as string[]) ?? []
    setAnswers(prev => ({ ...prev, [qId]: cur.includes(label) ? cur.filter(l => l !== label) : [...cur, label] }))
  }

  function canProceed(): boolean {
    if (isFinalStep) return true
    const q = questions[step]
    if (!q.required) return true
    const a = answers[q.id]
    if (q.type === 'single') return typeof a === 'string' && a.length > 0
    if (q.type === 'multi') return Array.isArray(a) && a.length > 0
    if (q.type === 'number') return typeof a === 'number' && a > 0
    return true
  }

  async function handleWhatsApp() {
    if (!form || submitting) return
    setSubmitting(true)
    const waLink = buildWhatsAppLink()
    const total = calcTotal()

    if (!isPreview) {
      await supabase.from('submissions').insert({
        form_id: form.id,
        answers,
        total_price: total,
        client_name: null,
        client_contact: null,
      })
    }

    // Abre WhatsApp
    if (waLink) window.open(waLink, '_blank')

    // Navega para confirmação com resumo
    navigate(`/f/${slug}/obrigado`, {
      state: { total, answers, questions, whatsappLink: waLink }
    })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
      <div className="spinner" />
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A0A0A', marginBottom: 8 }}>Formulário não encontrado</h1>
        <p style={{ color: '#64748B', fontSize: 14 }}>Este link pode estar inativo ou incorreto.</p>
      </div>
    </div>
  )

  const total = calcTotal()
  const isFinalStep = step >= questions.length
  const currentQ = !isFinalStep ? questions[step] : null
  const progress = isFinalStep ? 100 : Math.round(((step + 1) / (questions.length + 1)) * 100)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>

      {/* Banner preview */}
      {isPreview && (
        <div style={{
          backgroundColor: '#FEF9C3', borderBottom: '1px solid #FDE047',
          padding: '8px 24px', textAlign: 'center',
          fontSize: 12, fontWeight: 600, color: '#854D0E',
        }}>
          Modo preview — respostas não serão salvas
        </div>
      )}

      {/* Header */}
      <header style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #F1F5F9',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#0A0A0A' }}>{form?.title}</p>
          {form?.description && <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{form.description}</p>}
        </div>
        <Logo size="sm" />
      </header>

      {/* Progress bar */}
      <div style={{ height: 3, backgroundColor: '#E2E8F0' }}>
        <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#2563EB', transition: 'width 0.4s ease' }} />
      </div>

      {/* Label da etapa */}
      <div style={{ textAlign: 'center', padding: '16px 0 0', fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>
        {isFinalStep ? 'Orçamento pronto!' : `Pergunta ${step + 1} de ${questions.length}`}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 16px 32px' }}>
        <div style={{ width: '100%', maxWidth: 580 }}>

          <div className="card" style={{ padding: '32px 36px', marginBottom: 12 }}>

            {currentQ ? (
              /* ── Pergunta ── */
              <>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0A0A0A', marginBottom: 6, lineHeight: 1.3 }}>
                  {currentQ.label}
                  {currentQ.required && <span style={{ color: '#EF4444', marginLeft: 4 }}>*</span>}
                </h2>
                <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>
                  {currentQ.type === 'multi' ? 'Pode escolher mais de uma opção' : 'Escolha uma opção abaixo'}
                </p>

                {(currentQ.type === 'single' || currentQ.type === 'multi') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {currentQ.options.map((opt: QuestionOption) => {
                      const sel = currentQ.type === 'single'
                        ? answers[currentQ.id] === opt.label
                        : ((answers[currentQ.id] as string[]) ?? []).includes(opt.label)
                      return (
                        <button
                          key={opt.label}
                          onClick={() => currentQ.type === 'single' ? handleSingle(currentQ.id, opt.label) : handleMulti(currentQ.id, opt.label)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px 20px', borderRadius: 12,
                            border: `2px solid ${sel ? '#2563EB' : '#E2E8F0'}`,
                            backgroundColor: sel ? '#EFF6FF' : '#F8FAFC',
                            cursor: 'pointer', transition: 'all 0.15s',
                            textAlign: 'left', width: '100%', fontFamily: 'inherit',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 18, height: 18,
                              borderRadius: currentQ.type === 'multi' ? 5 : '50%',
                              border: `2px solid ${sel ? '#2563EB' : '#CBD5E1'}`,
                              backgroundColor: sel ? '#2563EB' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0, transition: 'all 0.15s',
                            }}>
                              {sel && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
                            </div>
                            <span style={{ fontSize: 15, fontWeight: sel ? 600 : 500, color: sel ? '#1D4ED8' : '#374151' }}>
                              {opt.label}
                            </span>
                          </div>
                          {opt.price_add > 0 && (
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#2563EB', flexShrink: 0, marginLeft: 16 }}>
                              +{formatCurrency(opt.price_add)}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}

                {currentQ.type === 'number' && (
                  <div>
                    <input
                      type="number" min={0}
                      className="input"
                      style={{ fontSize: 18, fontWeight: 600, padding: '14px 18px' }}
                      value={(answers[currentQ.id] as number) ?? ''}
                      onChange={e => setAnswers(prev => ({ ...prev, [currentQ.id]: Number(e.target.value) }))}
                      placeholder="0"
                    />
                    {currentQ.options[0]?.price_add > 0 && (
                      <p style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>
                        {formatCurrency(currentQ.options[0].price_add)} por unidade
                      </p>
                    )}
                  </div>
                )}

                {/* Navegação — perguntas */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}>
                  <button
                    className="btn-ghost"
                    onClick={() => setStep(s => Math.max(0, s - 1))}
                    disabled={step === 0}
                    style={{ opacity: step === 0 ? 0.3 : 1 }}
                  >
                    ← Anterior
                  </button>
                  <button
                    className="btn-primary"
                    style={{ padding: '12px 28px', fontSize: 15 }}
                    onClick={() => setStep(s => s + 1)}
                    disabled={!canProceed()}
                  >
                    Próximo →
                  </button>
                </div>
              </>
            ) : (
              /* ── Tela final — apenas WhatsApp ── */
              <>
                <div style={{
                  width: 56, height: 56,
                  backgroundColor: '#DCFCE7',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 0 20px',
                }}>
                  <span style={{ fontSize: 26, color: '#16A34A', fontWeight: 800 }}>✓</span>
                </div>

                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0A0A0A', marginBottom: 8, lineHeight: 1.3 }}>
                  Orçamento calculado!
                </h2>
                <p style={{ fontSize: 14, color: '#64748B', marginBottom: 8 }}>
                  Total estimado:
                </p>
                <p style={{ fontSize: 36, fontWeight: 800, color: '#2563EB', lineHeight: 1, marginBottom: 28 }}>
                  {formatCurrency(total)}
                </p>

                <button
                  onClick={handleWhatsApp}
                  disabled={submitting}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    width: '100%', padding: '16px 0',
                    backgroundColor: submitting ? '#86efac' : '#25D366',
                    color: '#fff', border: 'none',
                    borderRadius: 12, fontSize: 16, fontWeight: 700,
                    cursor: submitting ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
                    transition: 'background 0.15s',
                  }}
                >
                  {WA_ICON}
                  {submitting ? 'Abrindo WhatsApp...' : 'Enviar orçamento pelo WhatsApp'}
                </button>

                <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 12, textAlign: 'center' }}>
                  Sua mensagem já vem preenchida com as escolhas e o total.
                </p>

                <div style={{ marginTop: 20 }}>
                  <button
                    className="btn-ghost"
                    onClick={() => setStep(s => Math.max(0, s - 1))}
                    style={{ fontSize: 13 }}
                  >
                    ← Revisar respostas
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Barra de preço */}
          {!isFinalStep && (
            <div className="price-bar">
              <div>
                <p style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Total estimado</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{formatCurrency(total)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: '#475569' }}>Calculado em</p>
                <p style={{ fontSize: 11, color: '#475569' }}>tempo real</p>
              </div>
            </div>
          )}

          {/* Badge OrcaLink */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
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
