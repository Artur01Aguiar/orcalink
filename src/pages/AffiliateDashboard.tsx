import { useEffect, useState } from 'react'
import { Copy, Check, Award, Plus } from 'lucide-react'
import { Sidebar } from '../components/Sidebar'
import { getMyAffiliateStats, registerAsAffiliate, listMyPartnerInvites, createPartnerInvite } from '../lib/affiliate'
import type { AffiliateStats, PartnerInvite } from '../lib/affiliate'

export default function AffiliateDashboard() {
  const [stats, setStats] = useState<AffiliateStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [copied, setCopied] = useState(false)
  const [invites, setInvites] = useState<PartnerInvite[]>([])
  const [newSlug, setNewSlug] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newMaxUses, setNewMaxUses] = useState(1)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [copiedInvite, setCopiedInvite] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const s = await getMyAffiliateStats()
    setStats(s)
    if (s) {
      const inv = await listMyPartnerInvites()
      setInvites(inv)
    }
    setLoading(false)
  }

  async function handleCreateInvite() {
    if (!newSlug.trim()) return
    setCreating(true)
    setCreateError(null)
    const result = await createPartnerInvite(newSlug.trim(), newLabel.trim() || null, newMaxUses)
    if (result.error) setCreateError(result.error)
    else {
      setNewSlug(''); setNewLabel(''); setNewMaxUses(1)
      const inv = await listMyPartnerInvites()
      setInvites(inv)
    }
    setCreating(false)
  }

  function copyInviteLink(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`)
    setCopiedInvite(slug)
    setTimeout(() => setCopiedInvite(null), 2000)
  }

  async function handleRegister() {
    setRegistering(true)
    await registerAsAffiliate('open')
    await load()
    setRegistering(false)
  }

  function copyLink() {
    if (!stats) return
    navigator.clipboard.writeText(`${window.location.origin}?ref=${stats.code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isPartner = stats?.tier === 'partner'
  const partnerExpires = stats?.partner_pro_until
    ? new Date(stats.partner_pro_until).toLocaleDateString('pt-BR')
    : null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Sidebar />

      <main style={{ flex: 1, overflow: 'auto' }} className="pb-24 md:pb-8">
        <header style={{
          backgroundColor: '#fff', borderBottom: '1px solid #F1F5F9',
          padding: '16px 20px', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0A0A0A' }}>Programa de Afiliados</h1>
          <p className="hidden sm:block" style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>
            Indique a OrcaLink e ganhe por cada novo assinante.
          </p>
        </header>

        <div style={{ padding: '24px 16px', maxWidth: 900 }} className="md:px-8 md:pt-7">

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
              <div className="spinner" />
            </div>
          ) : !stats ? (
            // Não-afiliado ainda — CTA pra entrar
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, backgroundColor: '#EFF6FF', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Award size={28} color="#2563EB" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0A0A0A', marginBottom: 8 }}>
                Ganhe R$20,93 por cliente que indicar
              </h2>
              <p style={{ fontSize: 14, color: '#64748B', maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.6 }}>
                Compartilhe seu link, alguém assina o Pro e você recebe 70% da primeira mensalidade.
                Saque via PIX quando quiser.
              </p>
              <button onClick={handleRegister} disabled={registering} className="btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
                {registering ? 'Gerando...' : 'Quero ser afiliado →'}
              </button>
            </div>
          ) : (
            <>
              {/* Banner partner */}
              {isPartner && (
                <div style={{
                  borderRadius: 14, marginBottom: 20, padding: '16px 20px',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 100%)',
                  color: '#fff',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <Award size={18} />
                    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Afiliado Partner</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                    Você tem Pro grátis enquanto trouxer pelo menos 1 conversão a cada 60 dias.
                    Comissão: <strong>R$14,95/mês</strong> (50%) recorrente — enquanto o cliente continuar pagando.
                    {partnerExpires && (
                      <> Próxima revisão: <strong>{partnerExpires}</strong>.</>
                    )}
                  </p>
                </div>
              )}

              {/* Link */}
              <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
                  Seu link de afiliado
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{
                    flex: 1, minWidth: 240,
                    backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10,
                    padding: '12px 14px', fontSize: 14, color: '#2563EB', fontWeight: 600,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {window.location.origin}?ref={stats.code}
                  </div>
                  <button
                    onClick={copyLink}
                    className="btn-primary"
                    style={{ padding: '12px 18px', fontSize: 13, gap: 6 }}
                  >
                    {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar link</>}
                  </button>
                </div>
                <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 10 }}>
                  Comissão: <strong style={{ color: '#0A0A0A' }}>R$ {stats.commission_value.toFixed(2).replace('.', ',')}</strong>
                  {' '}{isPartner ? '(50% recorrente — todo mês enquanto o cliente pagar)' : '(70% — só primeiro mês)'}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ marginBottom: 20 }}>
                {[
                  { label: 'Cliques no link', value: stats.total_clicks, color: '#2563EB' },
                  { label: 'Cadastros', value: stats.total_signups, color: '#8B5CF6' },
                  { label: 'Conversões pagas', value: stats.total_conversions, color: '#10B981' },
                  { label: 'Total ganho', value: `R$ ${stats.total_earned.toFixed(2).replace('.', ',')}`, color: '#F59E0B' },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
                    <p style={{ fontSize: 28, fontWeight: 800, color: '#0A0A0A', lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>{s.label}</p>
                    <div style={{ width: 28, height: 3, backgroundColor: s.color, borderRadius: 2, marginTop: 10 }} />
                  </div>
                ))}
              </div>

              {/* Convites Partner */}
              <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      Convites Partner
                    </p>
                    <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                      Crie links personalizados que dão Pro grátis + tier partner para quem se cadastrar.
                    </p>
                  </div>
                </div>

                {/* Form criar */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  <div style={{ flex: 2, minWidth: 180 }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff' }}>
                      <span style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRight: '1px solid #E2E8F0', fontSize: 12, color: '#64748B', whiteSpace: 'nowrap' }}>
                        /p/
                      </span>
                      <input
                        value={newSlug}
                        onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="joao"
                        style={{ flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontSize: 13, color: '#0A0A0A', fontWeight: 600, minWidth: 0 }}
                      />
                    </div>
                  </div>
                  <input
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    placeholder="Nome (opcional)"
                    className="input"
                    style={{ flex: 2, minWidth: 140 }}
                  />
                  <input
                    type="number" min={1}
                    value={newMaxUses}
                    onChange={e => setNewMaxUses(Math.max(1, Number(e.target.value)))}
                    className="input"
                    style={{ width: 90 }}
                    title="Máximo de usos"
                  />
                  <button
                    onClick={handleCreateInvite}
                    disabled={creating || !newSlug.trim()}
                    className="btn-primary"
                    style={{ padding: '10px 16px', fontSize: 13, gap: 6, opacity: (!newSlug.trim() || creating) ? 0.5 : 1 }}
                  >
                    <Plus size={14} /> {creating ? 'Criando...' : 'Criar'}
                  </button>
                </div>

                {createError && (
                  <p style={{ fontSize: 12, color: '#EF4444', marginBottom: 10 }}>{createError}</p>
                )}

                {/* Lista de convites */}
                {invites.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', padding: '14px 0' }}>
                    Nenhum convite criado ainda.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {invites.map(inv => {
                      const exhausted = inv.uses_count >= inv.max_uses
                      return (
                        <div key={inv.slug} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', backgroundColor: '#F8FAFC',
                          border: '1px solid #F1F5F9', borderRadius: 10,
                          opacity: exhausted ? 0.6 : 1,
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {window.location.origin}/p/{inv.slug}
                            </p>
                            <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                              {inv.label && <>{inv.label} · </>}
                              {inv.uses_count}/{inv.max_uses} usos {exhausted && '· esgotado'}
                            </p>
                          </div>
                          <button
                            onClick={() => copyInviteLink(inv.slug)}
                            disabled={exhausted}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5,
                              padding: '7px 12px', border: '1px solid #E2E8F0', borderRadius: 8,
                              background: '#fff', cursor: exhausted ? 'not-allowed' : 'pointer',
                              color: copiedInvite === inv.slug ? '#10B981' : '#64748B',
                              fontSize: 12, fontWeight: 600, flexShrink: 0,
                            }}
                          >
                            {copiedInvite === inv.slug ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Saque */}
              <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>Saque via PIX</p>
                  <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    Entre em contato quando quiser resgatar — pagamento manual.
                  </p>
                </div>
                <a
                  href={`https://wa.me/5511528681090?text=${encodeURIComponent('Quero resgatar meus ganhos de afiliado da OrcaLink. Código: ' + stats.code)}`}
                  target="_blank" rel="noreferrer"
                  className="btn-ghost"
                  style={{ padding: '10px 18px', fontSize: 13 }}
                >
                  Falar no WhatsApp
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
