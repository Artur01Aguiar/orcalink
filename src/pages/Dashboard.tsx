import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 1px 0 #F1F5F9',
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A0A0A' }}>Meus Formulários</h1>
            <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Gerencie seus links de orçamento</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/forms/new')}>
            + Criar novo formulário
          </button>
        </header>

        <div style={{ padding: '28px 32px', maxWidth: 1100 }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
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

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      className="btn-ghost"
                      style={{ fontSize: 13, padding: '8px 14px', color: copied === form.slug ? '#10B981' : undefined }}
                      onClick={() => copyLink(form.slug)}
                    >
                      {copied === form.slug ? '✓ Copiado!' : 'Copiar link'}
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: 13, padding: '8px 14px' }}
                      onClick={() => navigate(`/forms/${form.id}`)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-ghost"
                      style={{ fontSize: 13, padding: '8px 14px' }}
                      onClick={() => toggleActive(form)}
                    >
                      {form.active ? 'Pausar' : 'Ativar'}
                    </button>
                    <button
                      className="btn-ghost"
                      style={{ fontSize: 13, padding: '8px 14px', color: '#EF4444', borderColor: '#FECACA' }}
                      onClick={() => deleteForm(form.id)}
                    >
                      Deletar
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
