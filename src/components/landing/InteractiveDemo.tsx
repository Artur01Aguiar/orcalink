import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ChevronLeft, Check, Zap, Calendar } from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────────────────

type Option = {
  label: string
  price: number
  tag?: string
}

type Question = {
  id: string
  text: string
  multiSelect?: boolean
  options: Option[]
}

const QUESTIONS: Question[] = [
  {
    id: 'tipo',
    text: 'Que tipo de ensaio você procura?',
    options: [
      { label: 'Individual', price: 350 },
      { label: 'Casal', price: 500 },
      { label: 'Família', price: 650 },
      { label: 'Gestante', price: 550 },
    ],
  },
  {
    id: 'local',
    text: 'Onde seria o ensaio?',
    options: [
      { label: 'Estúdio', price: 0, tag: 'incluso' },
      { label: 'Externo — praia ou parque', price: 150, tag: '+R$150' },
      { label: 'No seu local', price: 200, tag: '+R$200' },
    ],
  },
  {
    id: 'fotos',
    text: 'Quantas fotos editadas?',
    options: [
      { label: '15 fotos', price: 0, tag: 'incluso' },
      { label: '30 fotos', price: 120, tag: '+R$120' },
      { label: '50 fotos', price: 250, tag: '+R$250' },
    ],
  },
  {
    id: 'extras',
    text: 'Algum extra?',
    multiSelect: true,
    options: [
      { label: 'Vídeo Reels', price: 200, tag: '+R$200' },
      { label: 'Álbum impresso', price: 180, tag: '+R$180' },
      { label: 'Entrega em 48h', price: 100, tag: '+R$100' },
      { label: 'Nenhum extra', price: 0, tag: 'grátis' },
    ],
  },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function OptionButton({
  option,
  selected,
  multiSelect,
  onClick,
}: {
  option: Option
  selected: boolean
  multiSelect: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
        selected
          ? 'bg-primary border-primary text-white shadow-md'
          : 'bg-white border-border text-dark hover:border-primary/50 hover:bg-light/50'
      }`}
    >
      <span className="font-heading font-semibold text-sm">{option.label}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        {option.tag && (
          <span
            className={`text-xs font-mono font-semibold ${
              selected ? 'text-blue-100' : option.price === 0 ? 'text-success' : 'text-muted'
            }`}
          >
            {option.tag}
          </span>
        )}
        {multiSelect && (
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              selected ? 'bg-white border-white' : 'border-border'
            }`}
          >
            {selected && <Check size={12} className="text-primary" />}
          </div>
        )}
        {!multiSelect && (
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected ? 'border-white' : 'border-border'
            }`}
          >
            {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
          </div>
        )}
      </div>
    </motion.button>
  )
}

// ── Main Demo ──────────────────────────────────────────────────────────────────

export default function InteractiveDemo() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const [step, setStep] = useState(0)
  const [selections, setSelections] = useState<Record<string, number[]>>({})
  const [direction, setDirection] = useState(1)

  const currentQ = QUESTIONS[step]
  const isDone = step === QUESTIONS.length

  function getTotal() {
    let total = 0
    for (let i = 0; i < QUESTIONS.length; i++) {
      const q = QUESTIONS[i]
      const sel = selections[q.id] ?? []
      for (const idx of sel) {
        const opt = q.options[idx]
        if (i === 0) total = opt.price   // base price from first question
        else total += opt.price
      }
    }
    return total
  }

  function handleSelect(optIdx: number) {
    const q = currentQ
    if (q.multiSelect) {
      setSelections((prev) => {
        const existing = prev[q.id] ?? []
        // "Nenhum extra" is index 3
        if (optIdx === 3) {
          return { ...prev, [q.id]: [3] }
        }
        // deselect "Nenhum" if another option selected
        const without3 = existing.filter((x) => x !== 3)
        const alreadySelected = without3.includes(optIdx)
        return {
          ...prev,
          [q.id]: alreadySelected ? without3.filter((x) => x !== optIdx) : [...without3, optIdx],
        }
      })
    } else {
      setSelections((prev) => ({ ...prev, [q.id]: [optIdx] }))
      // Auto advance for single select
      setTimeout(() => {
        setDirection(1)
        setStep((s) => s + 1)
      }, 380)
    }
  }

  function handleNext() {
    setDirection(1)
    setStep((s) => s + 1)
  }

  function handleBack() {
    setDirection(-1)
    setStep((s) => s - 1)
  }

  function handleReset() {
    setSelections({})
    setDirection(-1)
    setStep(0)
  }

  const total = getTotal()

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
  }

  const getBreakdown = () => {
    const lines: { label: string; price: number }[] = []
    for (let i = 0; i < QUESTIONS.length; i++) {
      const q = QUESTIONS[i]
      const sel = selections[q.id] ?? []
      for (const idx of sel) {
        const opt = q.options[idx]
        if (opt.price > 0 || i === 0) {
          lines.push({
            label: opt.label,
            price: i === 0 ? opt.price : opt.price,
          })
        }
      }
    }
    return lines
  }

  return (
    <section id="demo" className="bg-light py-20 lg:py-28" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-5">
            <Zap size={13} className="text-primary" />
            <span className="text-xs font-semibold text-primary font-heading">
              Feito com OrcaLink — Crie o seu grátis
            </span>
          </div>
          <h2 className="section-heading text-3xl lg:text-4xl mb-4">
            Veja funcionando agora
          </h2>
          <p className="text-muted text-lg max-w-lg mx-auto">
            Esse é um link real de uma fotógrafa em Recife. Experimente.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_480px_1fr] gap-10 items-start">
          {/* Left: counter */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="hidden lg:flex flex-col justify-center h-full"
          >
            <div className="bg-white border border-border rounded-2xl p-7 shadow-card sticky top-24">
              <p className="text-sm text-muted mb-2">Enquanto você dormia...</p>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="font-mono font-bold text-5xl text-primary">847</span>
              </div>
              <p className="text-sm text-dark font-semibold leading-snug mb-5">
                orçamentos foram gerados essa semana com OrcaLink
              </p>
              <div className="space-y-3">
                {[
                  { name: 'Mariana F.', value: 'R$1.250', ago: '2 min' },
                  { name: 'Carlos S.', value: 'R$490', ago: '7 min' },
                  { name: 'Beatriz M.', value: 'R$780', ago: '14 min' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: ['#2563EB', '#10B981', '#8B5CF6'][i] }}
                      >
                        {item.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-dark">{item.name}</p>
                        <p className="text-[10px] text-muted">{item.ago} atrás</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-success">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Center: Demo card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl border border-border shadow-card-hover overflow-hidden">
              {/* Pro header */}
              <div className="px-6 pt-6 pb-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold font-heading">AB</span>
                  </div>
                  <div>
                    <p className="font-heading font-bold text-dark">Ana Beatriz | Fotografia</p>
                    <p className="text-sm text-muted">Eternizando momentos em Recife</p>
                  </div>
                </div>
              </div>

              {/* Steps indicator */}
              {!isDone && (
                <div className="px-6 pt-4 flex gap-1.5">
                  {QUESTIONS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i < step ? 'bg-primary' : i === step ? 'bg-primary/50' : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Question / Result */}
              <div className="px-6 py-5 min-h-[360px] flex flex-col">
                <AnimatePresence mode="wait" custom={direction}>
                  {!isDone ? (
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="flex flex-col gap-4 flex-1"
                    >
                      <div>
                        <p className="text-xs text-muted mb-1.5 font-heading">
                          Pergunta {step + 1} de {QUESTIONS.length}
                        </p>
                        <h3 className="font-heading font-bold text-lg text-dark leading-snug">
                          {currentQ.text}
                        </h3>
                        {currentQ.multiSelect && (
                          <p className="text-xs text-muted mt-1">Selecione quantos quiser</p>
                        )}
                      </div>

                      <div className="space-y-2.5 flex-1">
                        {currentQ.options.map((opt, i) => (
                          <OptionButton
                            key={i}
                            option={opt}
                            selected={(selections[currentQ.id] ?? []).includes(i)}
                            multiSelect={!!currentQ.multiSelect}
                            onClick={() => handleSelect(i)}
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={handleBack}
                          disabled={step === 0}
                          className="flex items-center gap-1 text-sm text-muted hover:text-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-heading font-medium"
                        >
                          <ChevronLeft size={16} />
                          Voltar
                        </button>

                        {currentQ.multiSelect && (
                          <button
                            onClick={handleNext}
                            disabled={(selections[currentQ.id] ?? []).length === 0}
                            className="btn-primary text-sm px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Ver orçamento →
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="result"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className="flex flex-col gap-4 flex-1"
                    >
                      {/* Result card */}
                      <div className="bg-light border border-blue-200 rounded-2xl p-5 text-center">
                        <p className="text-sm text-muted mb-1">Seu orçamento estimado</p>
                        <p className="font-mono font-bold text-5xl text-primary tracking-tight">
                          R${' '}
                          {total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-muted mt-1.5">
                          Valores finais confirmados após agendamento
                        </p>
                      </div>

                      {/* Breakdown */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wide font-heading">
                          Detalhamento
                        </p>
                        {getBreakdown().map((line, i) => (
                          <div key={i} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                            <span className="text-sm text-dark">{line.label}</span>
                            <span className="text-sm font-mono font-semibold text-dark">
                              {i === 0
                                ? `R$${line.price.toLocaleString('pt-BR')}`
                                : `+R$${line.price.toLocaleString('pt-BR')}`}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <motion.a
                        href="#precos"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex items-center justify-center gap-2 btn-primary text-base py-4 w-full"
                        aria-label="Quero agendar meu ensaio"
                      >
                        <Calendar size={18} />
                        Quero agendar meu ensaio
                      </motion.a>

                      <button
                        onClick={handleReset}
                        className="text-sm text-muted hover:text-primary text-center transition-colors font-heading"
                      >
                        ← Recalcular orçamento
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* OrcaLink branding tag */}
            <div className="flex justify-center mt-3">
              <span className="text-xs text-muted">
                Feito com{' '}
                <span className="font-bold">
                  <span className="text-primary">orca</span>link
                </span>
              </span>
            </div>
          </motion.div>

          {/* Right: CTA callout */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="hidden lg:flex flex-col justify-center h-full"
          >
            <div className="bg-dark rounded-2xl p-7 sticky top-24">
              <p className="text-white/50 text-sm mb-2 font-heading">Você poderia ter isso</p>
              <p className="text-white font-heading font-bold text-xl leading-snug mb-5">
                Um link assim no seu perfil ainda hoje.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  'Sem saber programar',
                  'Sem pagar nada pra começar',
                  'Pronto em 5 minutos',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-success" />
                    </div>
                    <span className="text-white/80 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <a
                href="#precos"
                className="block w-full text-center bg-primary hover:bg-blue-600 text-white font-heading font-bold text-sm py-3 rounded-xl transition-colors"
              >
                Criar meu link grátis →
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
