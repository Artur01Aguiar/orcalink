import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase, generateSlug } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Sidebar } from '../components/Sidebar'
import type { Question, QuestionOption } from '../lib/types'

const QUESTION_TYPES = [
  { value: 'single', label: 'Escolha única' },
  { value: 'multi', label: 'Múltipla escolha' },
  { value: 'number', label: 'Quantidade / número' },
] as const

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function phoneToWhatsApp(formatted: string): string {
  return '55' + formatted.replace(/\D/g, '')
}

function whatsAppToDisplay(stored: string): string {
  const digits = stored.replace(/\D/g, '')
  const local = digits.startsWith('55') ? digits.slice(2) : digits
  return formatPhone(local)
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function calcPreviewTotal(questions: Question[]): number {
  return questions.reduce((t, q) => {
    if (q.options.length > 0) return t + q.options[0].price_add
    return t
  }, 0)
}

export default function FormEditor() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isNew = !id

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [saving, setSaving] = useState(false)
  const [savedFormId, setSavedFormId] = useState<string | null>(id ?? null)
  const [published, setPublished] = useState(false)
  const [pubLink, setPubLink] = useState('')
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedFormIdRef = useRef<string | null>(id ?? null)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (!isNew && id) loadForm(id)
  }, [id])

  async function loadForm(formId: string) {
    const { data: form } = await supabase.from('forms').select('*').eq('id', formId).single()
    if (form) {
      setTitle(form.title)
      setDescription(form.description ?? '')
      setSlug(form.slug)
      const stored = (form as unknown as Record<string, string>).whatsapp_number ?? ''
      setWhatsappNumber(stored ? whatsAppToDisplay(stored) : '')
    }
    const { data: qs } = await supabase.from('questions').select('*').eq('form_id', formId).order('order_index')
    if (qs) setQuestions(qs)
  }

  useEffect(() => {
    if (!title.trim() || !user) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => performAutoSave(), 1500)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [title, description, whatsappNumber, questions])

  async function performAutoSave() {
    if (!user || !title.trim() || isSavingRef.current) return
    isSavingRef.current = true
    setAutoSaveStatus('saving')
    const formSlug = slug || generateSlug(title)
    let formId = savedFormIdRef.current

    if (!formId) {
      const { data, error } = await supabase.from('forms').insert({
        user_id: user.id, title, description,
        slug: formSlug, active: true,
        whatsapp_number: whatsappNumber ? phoneToWhatsApp(whatsappNumber) : null,
      } as Record<string, unknown>).select().single()
      if (error) { setAutoSaveStatus('idle'); isSavingRef.current = false; return }
      formId = data.id
      savedFormIdRef.current = formId
      setSavedFormId(formId)
      setSlug(formSlug)
    } else {
      await supabase.from('forms').update({
        title, description, slug: formSlug,
        whatsapp_number: whatsappNumber ? phoneToWhatsApp(whatsappNumber) : null,
      } as Record<string, unknown>).eq('id', formId)
    }

    await supabase.from('questions').delete().eq('form_id', formId)
    if (questions.length > 0) {
      await supabase.from('questions').insert(
        questions.map((q, i) => ({
          form_id: formId, order_index: i,
          type: q.type, label: q.label,
          required: q.required, options: q.options,
        }))
      )
    }
    setAutoSaveStatus('saved')
    isSavingRef.current = false
  }

  function handleTitleChange(val: string) {
    setTitle(val)
    if (isNew) setSlug(generateSlug(val))
  }

  function addQuestion() {
    setQuestions(prev => [...prev, {
      id: `temp-${Date.now()}`,
      form_id: savedFormId ?? '',
      order_index: prev.length,
      type: 'single',
      label: '',
      required: false,
      options: [{ label: '', price_add: 0 }],
    }])
  }

  function updateQuestion(idx: number, updates: Partial<Question>) {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, ...updates } : q))
  }

  function removeQuestion(idx: number) {
    setQuestions(prev => prev.filter((_, i) => i !== idx))
  }

  function addOption(qIdx: number) {
    updateQuestion(qIdx, { options: [...questions[qIdx].options, { label: '', price_add: 0 }] })
  }

  function updateOption(qIdx: number, oIdx: number, updates: Partial<QuestionOption>) {
    updateQuestion(qIdx, { options: questions[qIdx].options.map((o, i) => i === oIdx ? { ...o, ...updates } : o) })
  }

  function removeOption(qIdx: number, oIdx: number) {
    updateQuestion(qIdx, { options: questions[qIdx].options.filter((_, i) => i !== oIdx) })
  }

  async function save() {
    if (!title.trim()) { alert('Dê um nome ao formulário.'); return }
    if (!user) return
    setSaving(true)

    let formId = savedFormId
    const formSlug = slug || generateSlug(title)

    if (isNew || !formId) {
      const { data, error } = await supabase.from('forms').insert({
        user_id: user.id, title, description,
        slug: formSlug, active: true,
        whatsapp_number: whatsappNumber ? phoneToWhatsApp(whatsappNumber) : null,
      } as Record<string, unknown>).select().single()
      if (error) { alert('Erro: ' + error.message); setSaving(false); return }
      formId = data.id
      setSavedFormId(formId)
    } else {
      await supabase.from('forms').update({
        title, description, slug: formSlug,
        whatsapp_number: whatsappNumber ? phoneToWhatsApp(whatsappNumber) : null,
      } as Record<string, unknown>).eq('id', formId)
    }

    await supabase.from('questions').delete().eq('form_id', formId)
    if (questions.length > 0) {
      await supabase.from('questions').insert(
        questions.map((q, i) => ({
          form_id: formId, order_index: i,
          type: q.type, label: q.label,
          required: q.required, options: q.options,
        }))
      )
    }

    const link = `${window.location.origin}/f/${formSlug}`
    setPubLink(link)
    setPublished(true)
    setSaving(false)
  }

  // ── Tela de sucesso ──────────────────────────────────────────────
  if (published) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div className="card" style={{ maxWidth: 520, width: '100%', padding: '48px 44px', textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, backgroundColor: '#DCFCE7', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto 24px', color: '#16A34A', fontWeight: 800,
            }}>✓</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0A0A0A', marginBottom: 8 }}>Formulário publicado!</h1>
            <p style={{ fontSize: 15, color: '#64748B', marginBottom: 32 }}>
              Seu link está no ar. Compartilhe agora com seus clientes.
            </p>

            {/* Link em destaque */}
            <div style={{
              backgroundColor: '#EFF6FF', border: '2px solid #2563EB',
              borderRadius: 12, padding: '14px 20px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ flex: 1, fontSize: 13, color: '#2563EB', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {pubLink}
              </span>
              <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}
                onClick={() => navigator.clipboard.writeText(pubLink)}>
                Copiar
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <a href={`https://wa.me/?text=Olá! Faça seu orçamento aqui 👇%0A${pubLink}`}
                target="_blank" rel="noreferrer" className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', backgroundColor: '#25D366' }}>
                Enviar no WhatsApp
              </a>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => window.open(pubLink, '_blank')}>
                Ver formulário ↗
              </button>
            </div>

            <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ── Editor ───────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{
          backgroundColor: '#fff', borderBottom: '1px solid #F1F5F9',
          padding: '16px 28px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}
              onClick={() => navigate('/dashboard')}>← Voltar</button>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A' }}>
                {isNew ? 'Novo formulário' : title || 'Editar formulário'}
              </p>
              {slug && <p style={{ fontSize: 12, color: '#94A3B8' }}>/f/{slug}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {autoSaveStatus === 'saving' && (
              <span style={{ fontSize: 12, color: '#94A3B8' }}>Salvando...</span>
            )}
            {autoSaveStatus === 'saved' && (
              <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>✓ Salvo automaticamente</span>
            )}
            {slug && (
              <button className="btn-ghost" style={{ fontSize: 13, padding: '8px 16px' }}
                onClick={() => window.open(`${window.location.origin}/f/${slug}?preview=true`, '_blank')}>
                Preview ↗
              </button>
            )}
            <button className="btn-primary" style={{ padding: '10px 22px' }} onClick={save} disabled={saving}>
              {saving ? 'Publicando...' : '🚀 Publicar'}
            </button>
          </div>
        </header>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Editor */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 40px' }}>

            {/* Info básica */}
            <div className="card" style={{ padding: '24px 28px', marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Informações do formulário
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nome do formulário *</label>
                  <input className="input" value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Ex: Ensaio Fotográfico" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Descrição curta (aparece pro cliente)</label>
                  <textarea className="input" value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Ex: Monte seu orçamento e veja o preço na hora." rows={2} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Seu WhatsApp <span style={{ fontWeight: 400, color: '#94A3B8' }}>(para o cliente te contatar direto)</span>
                  </label>
                  <input className="input" value={whatsappNumber}
                    onChange={e => setWhatsappNumber(formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    style={{ borderColor: !whatsappNumber ? '#FCA5A5' : undefined }} />
                  {!whatsappNumber ? (
                    <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4, fontWeight: 600 }}>
                      ⚠ Sem esse número o cliente não consegue falar com você pelo WhatsApp.
                    </p>
                  ) : (
                    <p style={{ fontSize: 11, color: '#10B981', marginTop: 4, fontWeight: 600 }}>
                      ✓ Cliente vai poder falar com você direto pelo WhatsApp.
                    </p>
                  )}
                </div>
                {slug && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', backgroundColor: '#EFF6FF', borderRadius: 10, border: '1px solid #BFDBFE' }}>
                    <span style={{ fontSize: 12, color: '#2563EB', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {window.location.origin}/f/{slug}
                    </span>
                    <button style={{ fontSize: 12, color: '#2563EB', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/f/${slug}`)}>
                      Copiar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Perguntas */}
            <div className="card" style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Perguntas e preços</p>
                  <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                    {questions.length === 0 ? 'Nenhuma pergunta ainda — adicione abaixo' : `${questions.length} pergunta${questions.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>

              {questions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#CBD5E1' }}>
                  <p style={{ fontSize: 32, marginBottom: 8 }}>◧</p>
                  <p style={{ fontSize: 14 }}>Seu formulário está vazio.</p>
                  <p style={{ fontSize: 13 }}>Adicione perguntas para calcular o orçamento.</p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {questions.map((q, qIdx) => (
                  <div key={q.id} style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '20px 22px' }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', paddingTop: 11, flexShrink: 0 }}>{qIdx + 1}</span>
                      <div style={{ flex: 1, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <input className="input" style={{ flex: 1, minWidth: 200 }}
                          value={q.label} onChange={e => updateQuestion(qIdx, { label: e.target.value })}
                          placeholder="Escreva a pergunta..." />
                        <select className="input" style={{ width: 'auto', flexShrink: 0 }}
                          value={q.type} onChange={e => updateQuestion(qIdx, { type: e.target.value as Question['type'] })}>
                          {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <button onClick={() => removeQuestion(qIdx)}
                        style={{ fontSize: 22, color: '#CBD5E1', background: 'none', border: 'none', cursor: 'pointer', paddingTop: 4, flexShrink: 0, lineHeight: 1, transition: 'color 0.15s' }}
                        onMouseOver={e => (e.currentTarget.style.color = '#EF4444')}
                        onMouseOut={e => (e.currentTarget.style.color = '#CBD5E1')}>×</button>
                    </div>

                    {(q.type === 'single' || q.type === 'multi') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 24 }}>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: q.type === 'multi' ? 3 : '50%', border: '2px solid #CBD5E1', flexShrink: 0 }} />
                            <input className="input" style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                              value={opt.label} onChange={e => updateOption(qIdx, oIdx, { label: e.target.value })}
                              placeholder="Nome da opção" />
                            <span style={{ fontSize: 12, color: '#94A3B8', flexShrink: 0 }}>+R$</span>
                            <input type="number" min={0} className="input" style={{ width: 90, padding: '8px 12px', fontSize: 13 }}
                              value={opt.price_add} onChange={e => updateOption(qIdx, oIdx, { price_add: Number(e.target.value) })} placeholder="0"
                              onFocus={e => e.target.select()} />
                            {q.options.length > 1 && (
                              <button onClick={() => removeOption(qIdx, oIdx)}
                                style={{ color: '#CBD5E1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1, flexShrink: 0 }}>×</button>
                            )}
                          </div>
                        ))}
                        <button onClick={() => addOption(qIdx)}
                          style={{ fontSize: 13, color: '#2563EB', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', paddingLeft: 18, marginTop: 4 }}>
                          + Adicionar opção
                        </button>
                      </div>
                    )}

                    {q.type === 'number' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 24 }}>
                        <span style={{ fontSize: 13, color: '#64748B' }}>Preço por unidade: R$</span>
                        <input type="number" min={0} className="input" style={{ width: 100, padding: '8px 12px', fontSize: 13 }}
                          value={q.options[0]?.price_add ?? 0}
                          onChange={e => updateOption(qIdx, 0, { price_add: Number(e.target.value), label: 'unidade' })}
                          onFocus={e => e.target.select()} />
                      </div>
                    )}

                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8', cursor: 'pointer', marginTop: 12, paddingLeft: 24 }}>
                      <input type="checkbox" checked={q.required} onChange={e => updateQuestion(qIdx, { required: e.target.checked })} />
                      Resposta obrigatória
                    </label>
                  </div>
                ))}
              </div>

              <button onClick={addQuestion} style={{
                marginTop: 16, width: '100%', padding: '14px 0', borderRadius: 12,
                border: '2px dashed #E2E8F0', backgroundColor: 'transparent',
                color: '#2563EB', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                + Adicionar pergunta
              </button>
            </div>
          </div>

          {/* Preview */}
          <div style={{
            width: 300, borderLeft: '1px solid #F1F5F9', backgroundColor: '#F1F5F9',
            padding: '24px 16px', overflowY: 'auto',
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
              Como o cliente vê
            </p>
            <div style={{ backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #E2E8F0' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px 16px 10px', borderBottom: '1px solid #F1F5F9' }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#0A0A0A' }}>{title || 'Seu formulário'}</p>
                {description && <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{description}</p>}
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {questions.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#CBD5E1', textAlign: 'center', padding: '16px 0' }}>Nenhuma pergunta ainda</p>
                ) : questions.slice(0, 2).map((q, i) => (
                  <div key={i}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{q.label || `Pergunta ${i + 1}`}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {q.options.slice(0, 3).map((opt, oi) => (
                        <div key={oi} style={{
                          padding: '8px 12px', borderRadius: 8,
                          border: `1.5px solid ${oi === 0 ? '#2563EB' : '#E2E8F0'}`,
                          backgroundColor: oi === 0 ? '#EFF6FF' : '#F8FAFC',
                          display: 'flex', justifyContent: 'space-between',
                        }}>
                          <span style={{ fontSize: 11, color: oi === 0 ? '#2563EB' : '#374151', fontWeight: oi === 0 ? 600 : 400 }}>
                            {opt.label || 'Opção'}
                          </span>
                          {opt.price_add > 0 && <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 600 }}>+{formatCurrency(opt.price_add)}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {questions.length > 2 && <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>+ {questions.length - 2} mais...</p>}
              </div>
              <div style={{ backgroundColor: '#0A0A0A', padding: '14px 16px' }}>
                <p style={{ fontSize: 11, color: '#64748B' }}>Total estimado</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{formatCurrency(calcPreviewTotal(questions))}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
