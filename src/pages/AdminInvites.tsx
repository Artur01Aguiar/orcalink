import { useEffect, useState } from 'react'
import { Copy, Check, Plus } from 'lucide-react'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../contexts/AuthContext'
import { listMyPartnerInvites, createPartnerInvite } from '../lib/affiliate'
import type { PartnerInvite } from '../lib/affiliate'

const ADMIN_EMAIL = 'arturaguiarmvo@gmail.com'

export default function AdminInvites() {
  const { user, loading: authLoading } = useAuth()
  const [invites, setInvites] = useState<PartnerInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [newSlug, setNewSlug] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newMaxUses, setNewMaxUses] = useState(1)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [copiedInvite, setCopiedInvite] = useState<string | null>(null)

  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    if (isAdmin) load()
    else setLoading(false)
  }, [isAdmin])

  async function load() {
    setLoading(true)
    const inv = await listMyPartnerInvites()
    setInvites(inv)
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
      await load()
    }
    setCreating(false)
  }

  function copyInviteLink(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`)
    setCopiedInvite(slug)
    setTimeout(() => setCopiedInvite(null), 2000)
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card" style={{ padding: 40, maxWidth: 380, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, backgroundColor: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24, color: '#DC2626' }}>×</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0A0A0A', marginBottom: 8 }}>Acesso restrito</h2>
            <p style={{ fontSize: 13, color: '#64748B' }}>Esta página é exclusiva do administrador.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Sidebar />

      <main style={{ flex: 1, overflow: 'auto' }} className="pb-24 md:pb-8">
        <header style={{
          backgroundColor: '#fff', borderBottom: '1px solid #F1F5F9',
          padding: '16px 20px', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0A0A0A' }}>Convites Partner (Admin)</h1>
          <p className="hidden sm:block" style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>
            Gere links que dão Pro grátis + tier partner ao se cadastrarem.
          </p>
        </header>

        <div style={{ padding: '24px 16px', maxWidth: 900 }} className="md:px-8 md:pt-7">

          {/* Form criar */}
          <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
              Criar novo convite
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ flex: 2, minWidth: 180 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff' }}>
                  <span style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRight: '1px solid #E2E8F0', fontSize: 12, color: '#64748B', whiteSpace: 'nowrap' }}>
                    /p/
                  </span>
                  <input
                    value={newSlug}
                    onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="joao-fotografo"
                    style={{ flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontSize: 13, color: '#0A0A0A', fontWeight: 600, minWidth: 0 }}
                  />
                </div>
              </div>
              <input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Nome / anotação"
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
              <p style={{ fontSize: 12, color: '#EF4444', marginTop: 10 }}>{createError}</p>
            )}
          </div>

          {/* Lista */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
              Convites criados ({invites.length})
            </p>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}>
                <div className="spinner" />
              </div>
            ) : invites.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', padding: '24px 0' }}>
                Nenhum convite criado ainda.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {invites.map(inv => {
                  const exhausted = inv.uses_count >= inv.max_uses
                  return (
                    <div key={inv.slug} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 14px', backgroundColor: '#F8FAFC',
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
                          padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8,
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
        </div>
      </main>
    </div>
  )
}
