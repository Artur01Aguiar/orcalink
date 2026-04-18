import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Sidebar } from '../components/Sidebar'
import type { Form, Submission } from '../lib/types'

interface SubmissionRow extends Submission {
  form_title: string
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function formatAnswers(answers: Record<string, string | string[] | number>): string {
  return Object.values(answers)
    .map(v => Array.isArray(v) ? v.join(', ') : String(v))
    .filter(Boolean)
    .join(' · ')
}

export default function Respostas() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedForm, setSelectedForm] = useState<string>('all')
  const [forms, setForms] = useState<Form[]>([])

  useEffect(() => { if (user) loadData() }, [user])

  async function loadData() {
    setLoading(true)

    const { data: userForms } = await supabase
      .from('forms')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })

    if (!userForms || userForms.length === 0) {
      setLoading(false)
      return
    }

    setForms(userForms)
    const formIds = userForms.map((f: Form) => f.id)

    const { data: subs } = await supabase
      .from('submissions')
      .select('*')
      .in('form_id', formIds)
      .order('created_at', { ascending: false })

    if (subs) {
      const rows: SubmissionRow[] = subs.map((s: Submission) => ({
        ...s,
        form_title: userForms.find((f: Form) => f.id === s.form_id)?.title ?? '—',
      }))
      setSubmissions(rows)
    }

    setLoading(false)
  }

  const filtered = selectedForm === 'all'
    ? submissions
    : submissions.filter(s => s.form_id === selectedForm)

  const totalRevenue = filtered.reduce((acc, s) => acc + (s.total_price ?? 0), 0)

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
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A0A0A' }}>Respostas</h1>
            <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Orçamentos recebidos pelos seus formulários</p>
          </div>

          {/* Filtro por formulário */}
          {forms.length > 1 && (
            <select
              value={selectedForm}
              onChange={e => setSelectedForm(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1.5px solid #E2E8F0',
                backgroundColor: '#fff',
                fontSize: 13,
                color: '#374151',
                fontFamily: 'inherit',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">Todos os formulários</option>
              {forms.map(f => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          )}
        </header>

        <div style={{ padding: '28px 32px', maxWidth: 1200 }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }}>
            <div className="card" style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: 36, fontWeight: 800, color: '#0A0A0A', lineHeight: 1 }}>{filtered.length}</p>
              <p style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>Orçamentos recebidos</p>
              <div style={{ width: 32, height: 3, backgroundColor: '#2563EB', borderRadius: 2, marginTop: 12 }} />
            </div>
            <div className="card" style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#0A0A0A', lineHeight: 1 }}>{formatCurrency(totalRevenue)}</p>
              <p style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>Total de orçamentos</p>
              <div style={{ width: 32, height: 3, backgroundColor: '#8B5CF6', borderRadius: 2, marginTop: 12 }} />
            </div>
          </div>

          {/* Tabela */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
              <div className="spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ padding: 56, textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64,
                backgroundColor: '#EFF6FF',
                borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 20px',
              }}>📋</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0A0A0A', marginBottom: 8 }}>
                Nenhum orçamento ainda
              </h2>
              <p style={{ fontSize: 14, color: '#64748B', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
                Quando alguém preencher seu formulário, o orçamento aparece aqui.
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #F1F5F9' }}>
                    {['Data', 'Formulário', 'Escolhas', 'Total'].map(h => (
                      <th key={h} style={{
                        padding: '12px 20px',
                        textAlign: 'left',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#94A3B8',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: i < filtered.length - 1 ? '1px solid #F1F5F9' : 'none',
                        transition: 'background 0.1s',
                      }}
                      onMouseOver={e => (e.currentTarget.style.backgroundColor = '#FAFBFD')}
                      onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 20px', fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                        {row.created_at ? formatDate(row.created_at) : '—'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontSize: 12, fontWeight: 600, color: '#2563EB',
                          backgroundColor: '#EFF6FF', borderRadius: 6, padding: '3px 8px',
                        }}>
                          {row.form_title}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748B', maxWidth: 280 }}>
                        <span style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        } as React.CSSProperties}>
                          {row.answers ? formatAnswers(row.answers as Record<string, string | string[] | number>) : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#2563EB' }}>
                          {formatCurrency(row.total_price ?? 0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
