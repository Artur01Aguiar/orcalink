import { supabase } from './supabase'

const COOKIE_REF = 'orcalink_ref'
const COOKIE_TIER = 'orcalink_tier'
const MAX_AGE_DAYS = 30

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86400_000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function clearCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

/**
 * Lê ?ref= e ?tier= da URL atual, salva em cookie e registra clique.
 * Chamar uma vez no boot do app.
 */
export async function captureRefFromUrl(): Promise<void> {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const ref = params.get('ref')
  const tier = params.get('tier')
  if (!ref) return

  setCookie(COOKIE_REF, ref, MAX_AGE_DAYS)
  if (tier === 'partner') setCookie(COOKIE_TIER, 'partner', MAX_AGE_DAYS)

  try {
    await supabase.rpc('track_affiliate_click', { p_code: ref })
  } catch (e) {
    console.warn('Affiliate click tracking failed', e)
  }
}

export function getRefCookie(): string | null {
  return getCookie(COOKIE_REF)
}

export function getTierCookie(): 'partner' | null {
  return getCookie(COOKIE_TIER) === 'partner' ? 'partner' : null
}

/**
 * Após signup confirmado, vincula o usuário ao referrer e — se veio com
 * tier=partner — cria afiliado partner (ativa Pro grátis automaticamente).
 */
export async function applyReferralOnSignup(): Promise<void> {
  const ref = getRefCookie()
  const tier = getTierCookie()

  if (ref) {
    try {
      await supabase.rpc('set_referrer', { p_code: ref })
    } catch (e) {
      console.warn('set_referrer failed', e)
    }
    clearCookie(COOKIE_REF)
  }

  if (tier === 'partner') {
    try {
      await supabase.rpc('register_affiliate', { p_tier: 'partner' })
    } catch (e) {
      console.warn('register_affiliate (partner) failed', e)
    }
    clearCookie(COOKIE_TIER)
  }
}

export type AffiliateStats = {
  code: string
  tier: 'open' | 'partner'
  commission_value: number
  total_clicks: number
  total_signups: number
  total_conversions: number
  total_earned: number
  partner_pro_until: string | null
}

export async function getMyAffiliateStats(): Promise<AffiliateStats | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('affiliates')
    .select('code, tier, commission_value, total_clicks, total_signups, total_conversions, total_earned, partner_pro_until')
    .eq('user_id', user.id)
    .maybeSingle()
  return (data as AffiliateStats) ?? null
}

export async function registerAsAffiliate(tier: 'open' | 'partner' = 'open'): Promise<string | null> {
  const { data, error } = await supabase.rpc('register_affiliate', { p_tier: tier })
  if (error) { console.error(error); return null }
  return data as string
}
