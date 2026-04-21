import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const metrics = [
  { target: 23, prefix: '', suffix: 'x', unit: '/dia', label: 'É quantas vezes um fotógrafo responde "quanto custa?" no WhatsApp' },
  { target: 47, prefix: '', suffix: '', unit: ' min', label: 'Perdidos por dia respondendo orçamentos manualmente' },
  { target: 32.5, prefix: '', suffix: 'M', unit: '', label: 'Autônomos e MEIs no Brasil com esse problema', decimal: true },
  { target: 0, prefix: 'R$', suffix: '', unit: '', label: 'Que você precisa pagar pra começar hoje' },
]

function AnimatedNumber({ target, prefix, suffix, decimal, inView, delay }: {
  target: number; prefix: string; suffix: string; decimal?: boolean; inView: boolean; delay: number
}) {
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!inView || hasAnimated.current) return
    hasAnimated.current = true
    if (target === 0) { setCount(0); return }

    const duration = 1400
    const steps = 60
    const interval = duration / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(parseFloat((eased * target).toFixed(decimal ? 1 : 0)))
      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [inView, target])

  const display = decimal ? count.toFixed(1).replace('.', ',') : String(Math.round(count))

  return (
    <motion.span
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay }}
      className="font-mono font-bold text-4xl lg:text-5xl text-white tracking-tight"
    >
      {prefix}{display}{suffix}
    </motion.span>
  )
}

export default function SocialProof() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="bg-dark py-20 lg:py-28" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading font-bold text-3xl lg:text-4xl text-white leading-tight">
            O problema que custa caro para{' '}
            <span className="text-primary">32 milhões</span> de brasileiros
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/8 transition-colors"
            >
              <div className="mb-3 flex items-baseline gap-1">
                <AnimatedNumber target={m.target} prefix={m.prefix} suffix={m.suffix} decimal={m.decimal} inView={inView} delay={i * 0.1} />
                {m.unit && (
                  <span className="font-mono font-bold text-2xl text-white/60">{m.unit}</span>
                )}
              </div>
              <p className="text-white/60 text-sm leading-relaxed">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
