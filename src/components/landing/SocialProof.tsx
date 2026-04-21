import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const metrics = [
  {
    value: '23x',
    suffix: '/dia',
    label: 'É quantas vezes um fotógrafo responde "quanto custa?" no WhatsApp',
  },
  {
    value: '47',
    suffix: ' min',
    label: 'Perdidos por dia respondendo orçamentos manualmente',
  },
  {
    value: '32,5M',
    suffix: '',
    label: 'Autônomos e MEIs no Brasil com esse problema',
  },
  {
    value: 'R$0',
    suffix: '',
    label: 'Que você precisa pagar pra começar hoje',
  },
]

function AnimatedNumber({ value, inView }: { value: string; inView: boolean }) {
  const [display, setDisplay] = useState('0')
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!inView || hasAnimated.current) return
    hasAnimated.current = true

    // Just animate opacity for complex values
    setDisplay(value)
  }, [inView, value])

  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="font-mono font-bold text-4xl lg:text-5xl text-white tracking-tight"
    >
      {display}
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
              <div className="mb-3 flex items-baseline gap-0.5">
                <AnimatedNumber value={m.value} inView={inView} />
                {m.suffix && (
                  <span className="font-mono font-bold text-2xl text-white/60 ml-0.5">{m.suffix}</span>
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
