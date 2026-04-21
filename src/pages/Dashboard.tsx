import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Check, Pencil, Pause, Play, Trash2 } from 'lucide-react'
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
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => { if (user) loadForms() }, [user])

  async function loadForms() {
    setLoading(true)
    const { data } = await supabase
      .from('forms').select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })

    if (data) {
      const withStats = await Promise.all(data.map(async f => {
        const { count } = await supabase
          .from('submissions').select('*', { count: 'exact', head: true }).eq('form_id', f.id)
        return { ...f, submissions_count: count ?? 0 }
      }))
      setForms(withStats)
      setTotalSubmissions(withStats.reduce((a, f) => a + (f.submissions_count ?? 0), 0))
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

  const stats = [
    { label: 'Formulários ativos', value: forms.filter(f => f.active).length, color: '#2563EB' },
    { label: 'Orçamentos este mês', value: totalSubmissions, color: '#10B981' },
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
          <button className="btn-primary" style={{ fontSize: 13, padding: '9px 14px' }} onClick={() => navigate('/forms/new')}>
            + Novo formulário
          </button>
        </header>

        <div style={{ padding: '20px 16px', maxWidth: 1100 }} className="pb-24 md:pb-8 md:px-8">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {stats.map(s => (
              <div key={s.label} className="card" style={{ padding: '20px 24px' }}>
                <p style={{ fontSize: 36, fontWeight: 800, color: '#0A0A0A', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>{s.label}</p>
                <div style={{ width: 32, height: 3, backgroundColor: s.color, borderRadius: 2, marginTop: 12 }} />
              </div>
            ))}
          </div>

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
    </div>
  )
}
