import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Check, Pencil, Pause, Play, Trash2 } from 'lucide-react'
import { startProCheckout } from '../lib/stripe'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Sidebar } from '../components/Sidebar'
import type { FormWithStats } from '../lib/types'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [forms, setForms] = useState<FormWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [totalSubmissions, setTotalSubmissions] = useState(0)
  const [monthlySubmissions, setMonthlySubmissions] = useState(0)
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'business'>('free')
  const [copied, setCopied] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => { if (user) loadForms() }, [user])

  async function loadForms() {
    setLoading(true)
    const [{ data }, { data: profile }] = await Promise.all([
      supabase.from('forms').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('plan').eq('id', user!.id).single(),
    ])
    if (profile?.plan) setUserPlan(profile.plan as 'free' | 'pro' | 'business')

    if (data) {
      const withStats = await Promise.all(data.map(async f => {
        const { count } = await supabase
          .from('submissions').select('*', { count: 'exact', head: true }).eq('form_id', f.id)
        return { ...f, submissions_count: count ?? 0 }
      }))
      setForms(withStats)
      setTotalSubmissions(withStats.reduce((a, f) => a + (f.submissions_count ?? 0), 0))

      if (data.length > 0) {
        const startOfMonth = new Date()
        startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)
        const { count: mCount } = await supabase
          .from('submissions').select('*', { count: 'exact', head: true })
          .in('form_id', data.map(f => f.id))
          .gte('created_at', startOfMonth.toISOString())
        setMonthlySubmissions(mCount ?? 0)
      }
    }
    setLoading(false)
  }

  async function toggleActive(form: FormWithStats) {
    await supabase.from('forms').update({ active: !form.active }).eq('id', form.id)
    setForms(prev => prev.map(f => f.id === form.id ? { ...f, active: !f.active } : f))
  }

  async function deleteForm(id: string) {
    if (!confirm('Deletar este formulário? Ação irreversível.')) return
    await supabase.from('forms').delete().eq('id', id)
    setForms(prev => prev.filter(f => f.id !== id))
  }

  function copyLink(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/f/${slug}`)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  const isFreePlan = userPlan === 'free'
  const canCreateForm = !isFreePlan || forms.length < 1
  const stats = [
    { label: 'Formulários ativos', value: forms.filter(f => f.active).length, color: '#2563EB' },
    { label: 'Orçamentos este mês', value: isFreePlan ? monthlySubmissions : totalSubmissions, color: '#10B981' },
    { label: 'Total de formulários', value: forms.length, color: '#8B5CF6' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Sidebar />

      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <header style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #F1F5F9',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 1px 0 #F1F5F9',
        }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0A0A0A' }}>Meus Formulários</h1>
            <p className="hidden sm:block" style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Gerencie seus links de orçamento</p>
          </div>
          <button
            className="btn-primary"
            style={{ fontSize: 13, padding: '9px 14px', opacity: canCreateForm ? 1 : 0.5, cursor: canCreateForm ? 'pointer' : 'not-allowed' }}
            onClick={() => canCreateForm ? navigate('/forms/new') : setShowUpgradeModal(true)}
            title={canCreateForm ? undefined : 'Upgrade para Pro para criar mais formulários'}
          >
            + Novo formulário
          </button>
        </header>

        <div style={{ padding: '20px 16px', maxWidth: 1100 }} className="pb-24 md:pb-8 md:px-8">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3" style={{ marginBottom: 32 }}>
            {stats.map((s, i) => (
              <div key={s.label} className="card" style={{ padding: '20px 24px' }}>
                <p style={{ fontSize: 36, fontWeight: 800, color: '#0A0A0A', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>{s.label}</p>
                {isFreePlan && i === 1 ? (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min((monthlySubmissions / 10) * 100, 100)}%`, backgroundColor: monthlySubmissions >= 10 ? '#EF4444' : monthlySubmissions >= 7 ? '#F59E0B' : '#10B981', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <p style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>{monthlySubmissions}/10 no plano grátis</p>
                  </div>
                ) : (
                  <div style={{ width: 32, height: 3, backgroundColor: s.color, borderRadius: 2, marginTop: 12 }} />
                )}
              </div>
            ))}
          </div>
          {/* Card de plano — sempre visível para free */}
          {isFreePlan && (
            <div style={{
              borderRadius: 16, marginBottom: 20, overflow: 'hidden',
              border: '1px solid #BFDBFE',
              background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)',
            }}>
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8' }}>Plano Grátis</span>
                    {monthlySubmissions >= 10 && (
                      <span style={{ fontSize: 10, backgroundColor: '#FEE2E2', color: '#EF4444', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>LIMITE ATINGIDO</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 6, backgroundColor: '#BFDBFE', borderRadius: 3, overflow: 'hidden', maxWidth: 180 }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min((monthlySubmissions / 10) * 100, 100)}%`,
                        backgroundColor: monthlySubmissions >= 10 ? '#EF4444' : monthlySubmissions >= 7 ? '#F59E0B' : '#2563EB',
                        borderRadius: 3, transition: 'width 0.4s',
                      }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {monthlySubmissions}/10 orçamentos
                    </span>
                  </div>
                </div>
                <button
                  onClick={startProCheckout}
                  style={{
                    backgroundColor: '#2563EB', color: '#fff', border: 'none', borderRadius: 10,
                    padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
                  }}
                >
                  ⚡ Upgrade Pro — R$29,90/mês
                </button>
              </div>
            </div>
          )}

          {/* Lista */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
              <div className="spinner" />
            </div>
          ) : forms.length === 0 ? (
            /* Empty state — onboarding */
            <div className="card" style={{ padding: 56, textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64,
                backgroundColor: '#EFF6FF',
                borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 20px',
              }}>◧</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0A0A0A', marginBottom: 8 }}>
                Crie seu primeiro link de orçamento
              </h2>
              <p style={{ fontSize: 14, color: '#64748B', maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.6 }}>
                Em menos de 5 minutos você tem um link que calcula o preço pra seu cliente na hora — sem precisar responder mensagem.
              </p>
              <button className="btn-primary" onClick={() => navigate('/forms/new')} style={{ fontSize: 15, padding: '12px 28px' }}>
                Criar meu primeiro formulário →
              </button>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 36 }}>
                {['Formulário pronto em 3 min', 'Link para compartilhar', 'Orçamento automático'].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8' }}>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span> {t}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {forms.map(form => (
                <div key={form.id} className="card-sm" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Status */}
                  <div style={{
                    width: 10, height: 10,
                    borderRadius: '50%',
                    backgroundColor: form.active ? '#10B981' : '#CBD5E1',
                    flexShrink: 0,
                  }} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: '#0A0A0A', fontSize: 15 }}>{form.title}</p>
                    <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {window.location.origin}/f/{form.slug}
                    </p>
                    <p style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>
                      {form.submissions_count} orçamento{form.submissions_count !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Actions — ícones no mobile, texto no desktop */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {/* Copiar */}
                    <button
                      onClick={() => copyLink(form.slug)}
                      title="Copiar link"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '8px', border: '1px solid #E2E8F0', borderRadius: 8,
                        background: '#fff', cursor: 'pointer', color: copied === form.slug ? '#10B981' : '#64748B',
                        fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s',
                      }}
                    >
                      {copied === form.slug ? <Check size={15} /> : <Copy size={15} />}
                      <span className="hidden sm:inline">{copied === form.slug ? 'Copiado' : 'Copiar'}</span>
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => navigate(`/forms/${form.id}`)}
                      title="Editar"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '8px', border: '1px solid #BFDBFE', borderRadius: 8,
                        background: '#EFF6FF', cursor: 'pointer', color: '#2563EB',
                        fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s',
                      }}
                    >
                      <Pencil size={15} />
                      <span className="hidden sm:inline">Editar</span>
                    </button>

                    {/* Pausar/Ativar */}
                    <button
                      onClick={() => toggleActive(form)}
                      title={form.active ? 'Pausar' : 'Ativar'}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '8px', border: '1px solid #E2E8F0', borderRadius: 8,
                        background: '#fff', cursor: 'pointer', color: '#64748B',
                        fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s',
                      }}
                    >
                      {form.active ? <Pause size={15} /> : <Play size={15} />}
                      <span className="hidden sm:inline">{form.active ? 'Pausar' : 'Ativar'}</span>
                    </button>

                    {/* Deletar */}
                    <button
                      onClick={() => deleteForm(form.id)}
                      title="Deletar"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '8px', border: '1px solid #FECACA', borderRadius: 8,
                        background: '#fff', cursor: 'pointer', color: '#EF4444',
                        fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s',
                      }}
                    >
                      <Trash2 size={15} />
                      <span className="hidden sm:inline">Deletar</span>
                    </button>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>
      </main>

      {/* Modal upgrade — plano grátis tentando criar 2º formulário */}
      {showUpgradeModal && (
        <div
          onClick={() => setShowUpgradeModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 440,
              overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 100%)',
              padding: '28px 28px 24px',
              position: 'relative',
            }}>
              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >×</button>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Limite atingido</p>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                Plano Grátis: 1 formulário
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                Faça upgrade para criar formulários ilimitados e remover o badge OrcaLink.
              </p>
            </div>

            {/* Planos */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Pro */}
              <div style={{ border: '2px solid #2563EB', borderRadius: 14, padding: '18px 20px', position: 'relative', backgroundColor: '#EFF6FF' }}>
                <span style={{ position: 'absolute', top: -10, left: 20, backgroundColor: '#2563EB', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mais popular</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#0A0A0A' }}>Pro</p>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Para autônomos que querem crescer</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: '#2563EB' }}>R$29,90</p>
                    <p style={{ fontSize: 11, color: '#94A3B8' }}>/mês</p>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Formulários ilimitados', 'Orçamentos ilimitados', 'Sem badge OrcaLink', 'Analytics de respostas'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { setShowUpgradeModal(false); startProCheckout() }}
                  style={{
                    width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
                    backgroundColor: '#2563EB', color: '#fff', fontSize: 14, fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
                  }}
                >
                  ⚡ Assinar Pro — R$29,90/mês
                </button>
              </div>

              {/* Free atual */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: 14, padding: '14px 20px', backgroundColor: '#F8FAFC' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#64748B' }}>Grátis (atual)</p>
                    <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>1 formulário · 10 orçamentos/mês · com badge</p>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#94A3B8' }}>R$0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
