import { supabase } from './supabase'

export async function startProCheckout(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) { window.location.href = '/login?signup=true'; return }

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!res.ok) {
    const err = await res.text()
    console.error('Checkout error:', err)
    alert('Erro ao iniciar checkout. Tente novamente.')
    return
  }

  const { url } = await res.json()
  window.location.href = url
}
