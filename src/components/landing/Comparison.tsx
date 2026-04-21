import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, X, AlertTriangle } from 'lucide-react'

const features = [
  {
    label: 'Cliente calcula sozinho',
    planilha: { status: 'no' },
    typeform: { status: 'no', note: 'só coleta dados' },
    orcalink: { status: 'yes' },
  },
  {
    label: 'Em português pra MEI',
    planilha: { status: 'no', note: 'genérico' },
    typeform: { status: 'no', note: 'gringo' },
    orcalink: { status: 'yes' },
  },
  {
    label: 'Orçamento automático',
    planilha: { status: 'no', note: 'manual' },
    typeform: { status: 'no', note: 'sem cálculo' },
    orcalink: { status: 'yes' },
  },
  {
    label: 'Setup em 5 minutos',
    planilha: { status: 'no', note: 'demora' },
    typeform: { status: 'warn', note: 'complexo' },
    orcalink: { status: 'yes' },
  },
  {
    label: 'Plano grátis real',
    planilha: { status: 'no' },
    typeform: { status: 'no', note: 'trial 14 dias' },
    orcalink: { status: 'yes', note: 'pra sempre' },
  },
]

function StatusIcon({ status }: { status: string }) {
  if (status === 'yes') return <Check size={18} className="text-success" strokeWidth={2.5} />
  if (status === 'warn') return <AlertTriangle size={18} className="text-amber-500" strokeWidth={2.5} />
  return <X size={18} className="text-red-400" strokeWidth={2.5} />
}

export default function Comparison() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="diferenciais" className="bg-background py-20 lg:py-28" ref={ref}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <h2 className="section-heading text-3xl lg:text-4xl mb-4">
            Por que não continuar do jeito que está?
          </h2>
          <p className="text-muted text-lg max-w-lg mx-auto">
            Compare e veja por que o WhatsApp manual não é a melhor opção.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="overflow-hidden rounded-2xl border border-border bg-white shadow-card"
        >
          {/* Header */}
          <div className="grid grid-cols-4">
            <div className="px-5 py-4 border-b border-border" />
            {['Planilha / WhatsApp', 'Typeform', 'OrcaLink'].map((col, i) => (
              <div
                key={col}
                className={`px-4 py-4 border-b text-center ${
                  i === 2
                    ? 'bg-light border-primary/30 border-l-2 border-r-2'
                    : 'border-border'
                }`}
              >
                <span
                  className={`text-sm font-heading font-bold ${
                    i === 2 ? 'text-primary' : 'text-dark'
                  }`}
                >
                  {col}
                </span>
                {i === 2 && (
                  <div className="mt-1">
                    <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-heading font-semibold">
                      Recomendado
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Rows */}
          {features.map((feature, rowIdx) => (
            <div
              key={rowIdx}
              className={`grid grid-cols-4 ${rowIdx < features.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className="px-5 py-4 flex items-center">
                <span className="text-sm font-medium text-dark">{feature.label}</span>
              </div>

              {[feature.planilha, feature.typeform, feature.orcalink].map((cell, colIdx) => (
                <div
                  key={colIdx}
                  className={`px-4 py-4 flex flex-col items-center justify-center gap-1 ${
                    colIdx === 2
                      ? 'bg-light border-l-2 border-r-2 border-primary/30'
                      : ''
                  }`}
                >
                  <StatusIcon status={cell.status} />
                  {cell.note && (
                    <span className="text-[10px] text-muted text-center leading-tight">{cell.note}</span>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* OrcaLink footer highlight */}
          <div className="grid grid-cols-4">
            <div className="px-5 py-3" />
            <div className="py-3" />
            <div className="py-3" />
            <div className="bg-primary/5 border-l-2 border-r-2 border-b-2 border-primary/30 rounded-b-2xl px-4 py-3 text-center">
              <span className="text-xs font-semibold text-primary font-heading">Melhor escolha ✓</span>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.55, delay: 0.35 }}
          className="text-center text-muted text-sm mt-8 max-w-2xl mx-auto leading-relaxed"
        >
          <span className="text-dark font-semibold">OrcaLink é o único feito pra você.</span>
        </motion.p>
      </div>
    </section>
  )
}
