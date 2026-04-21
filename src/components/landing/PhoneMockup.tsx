import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Phase =
  | 'q1-show'
  | 'q1-select'
  | 'q2-show'
  | 'q2-select'
  | 'result-show'
  | 'result-pause'

const PHASE_DURATION: Record<Phase, number> = {
  'q1-show': 1200,
  'q1-select': 900,
  'q2-show': 1200,
  'q2-select': 900,
  'result-show': 600,
  'result-pause': 2200,
}

const PHASES: Phase[] = ['q1-show', 'q1-select', 'q2-show', 'q2-select', 'result-show', 'result-pause']

const q1Options = ['Individual', 'Casal', 'Família']
const q2Options = ['Estúdio', 'Praia / Parque', 'No seu local']

export default function PhoneMockup() {
  const [phase, setPhase] = useState<Phase>('q1-show')

  useEffect(() => {
    const currentIdx = PHASES.indexOf(phase)
    const nextPhase = PHASES[(currentIdx + 1) % PHASES.length]
    const timer = setTimeout(() => setPhase(nextPhase), PHASE_DURATION[phase])
    return () => clearTimeout(timer)
  }, [phase])

  const showQ1 = ['q1-show', 'q1-select'].includes(phase)
  const showQ2 = ['q2-show', 'q2-select'].includes(phase)
  const showResult = ['result-show', 'result-pause'].includes(phase)
  const q1Selected: number = phase === 'q1-select' ? 1 : -1
  const q2Selected: number = phase === 'q2-select' ? 0 : -1

  return (
    <div className="relative flex justify-center">
      {/* Phone shell */}
      <div
        className="relative bg-[#1a1a2e] rounded-[44px] p-3 w-[270px] shadow-2xl"
        style={{ boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)' }}
      >
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#0d0d1a] rounded-full z-10" />

        {/* Screen */}
        <div className="bg-white rounded-[34px] overflow-hidden h-[520px] flex flex-col">
          {/* Status bar */}
          <div className="bg-white px-6 pt-7 pb-2 flex justify-between items-center flex-shrink-0">
            <span className="text-[10px] font-semibold text-dark">9:41</span>
            <div className="flex gap-1 items-center">
              <div className="w-3 h-1.5 bg-dark rounded-sm opacity-80" />
              <div className="w-0.5 h-2 bg-dark rounded-sm opacity-40" />
            </div>
          </div>

          {/* Header */}
          <div className="px-5 pb-3 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold font-heading">AB</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-dark font-heading leading-tight">Ana Beatriz</p>
                <p className="text-[9px] text-muted">Fotografia · Recife</p>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden relative px-4 py-3">
            <AnimatePresence mode="wait">
              {showQ1 && (
                <motion.div
                  key="q1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <div>
                    <p className="text-[9px] text-muted mb-1">Pergunta 1 de 3</p>
                    <p className="text-[12px] font-bold text-dark font-heading leading-tight">
                      Que tipo de ensaio você procura?
                    </p>
                  </div>
                  <div className="space-y-2">
                    {q1Options.map((opt, i) => (
                      <motion.div
                        key={opt}
                        animate={q1Selected === i ? {
                          backgroundColor: '#2563EB',
                          borderColor: '#2563EB',
                          scale: 0.97,
                        } : {
                          backgroundColor: '#ffffff',
                          borderColor: '#E2E8F0',
                          scale: 1,
                        }}
                        transition={{ duration: 0.25 }}
                        className="border rounded-xl px-3 py-2.5 cursor-pointer"
                      >
                        <span className={`text-[11px] font-medium ${q1Selected === i ? 'text-white' : 'text-dark'}`}>
                          {opt}
                        </span>
                        {i === 0 && (
                          <span className={`text-[9px] ml-1 ${q1Selected === i ? 'text-blue-200' : 'text-muted'}`}>
                            R$350
                          </span>
                        )}
                        {i === 1 && (
                          <span className={`text-[9px] ml-1 ${q1Selected === i ? 'text-blue-200' : 'text-muted'}`}>
                            R$500
                          </span>
                        )}
                        {i === 2 && (
                          <span className={`text-[9px] ml-1 ${q1Selected === i ? 'text-blue-200' : 'text-muted'}`}>
                            R$650
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {showQ2 && (
                <motion.div
                  key="q2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <div>
                    <p className="text-[9px] text-muted mb-1">Pergunta 2 de 3</p>
                    <p className="text-[12px] font-bold text-dark font-heading leading-tight">
                      Onde seria o ensaio?
                    </p>
                  </div>
                  <div className="space-y-2">
                    {q2Options.map((opt, i) => (
                      <motion.div
                        key={opt}
                        animate={q2Selected === i ? {
                          backgroundColor: '#2563EB',
                          borderColor: '#2563EB',
                          scale: 0.97,
                        } : {
                          backgroundColor: '#ffffff',
                          borderColor: '#E2E8F0',
                          scale: 1,
                        }}
                        transition={{ duration: 0.25 }}
                        className="border rounded-xl px-3 py-2.5 cursor-pointer"
                      >
                        <span className={`text-[11px] font-medium ${q2Selected === i ? 'text-white' : 'text-dark'}`}>
                          {opt}
                        </span>
                        {i === 0 && (
                          <span className={`text-[9px] ml-1 ${q2Selected === i ? 'text-blue-200' : 'text-success'}`}>
                            incluso
                          </span>
                        )}
                        {i === 1 && (
                          <span className={`text-[9px] ml-1 ${q2Selected === i ? 'text-blue-200' : 'text-muted'}`}>
                            +R$150
                          </span>
                        )}
                        {i === 2 && (
                          <span className={`text-[9px] ml-1 ${q2Selected === i ? 'text-blue-200' : 'text-muted'}`}>
                            +R$200
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {showResult && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3"
                >
                  <div className="bg-light rounded-2xl p-4 text-center">
                    <p className="text-[10px] text-muted mb-1">Seu orçamento estimado</p>
                    <p className="font-mono font-bold text-3xl text-primary">R$ 650</p>
                    <p className="text-[9px] text-muted mt-1">Família · Estúdio · 30 fotos</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted">Ensaio Família</span>
                      <span className="text-[10px] font-semibold text-dark font-mono">R$650</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted">Local (incluso)</span>
                      <span className="text-[10px] font-semibold text-success font-mono">R$0</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full bg-primary text-white text-[11px] font-bold py-2.5 rounded-xl font-heading"
                  >
                    Quero agendar →
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="px-5 pb-4 flex-shrink-0">
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{
                  width: showQ1 ? '33%' : showQ2 ? '66%' : '100%',
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
