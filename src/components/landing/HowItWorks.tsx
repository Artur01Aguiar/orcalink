import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Settings, Link2, Calculator, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: Settings,
    step: '01',
    title: 'Você monta seu cardápio',
    description:
      'Adicione seus serviços, faça perguntas personalizadas e defina os preços de cada opção. Arrastar e soltar, sem código.',
    visual: (
      <div className="bg-background rounded-xl p-4 border border-border space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-muted ml-2">Editor OrcaLink</span>
        </div>
        {['Tipo de ensaio', 'Local do ensaio', 'Qtd de fotos'].map((field, i) => (
          <div key={i} className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2">
            <div className="w-3 h-3 flex flex-col gap-0.5">
              <div className="w-full h-px bg-muted/50" />
              <div className="w-full h-px bg-muted/50" />
              <div className="w-full h-px bg-muted/50" />
            </div>
            <span className="text-xs text-dark font-medium">{field}</span>
            <div className="ml-auto w-5 h-5 rounded bg-light flex items-center justify-center">
              <span className="text-primary text-xs">+</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Link2,
    step: '02',
    title: 'Você compartilha o link',
    description:
      'Coloca o link na bio do Instagram, no WhatsApp Business, no cartão de visita. Um link pra tudo.',
    visual: (
      <div className="bg-background rounded-xl p-4 border border-border">
        <div className="flex flex-col items-center gap-3">
          {/* Instagram mock bio */}
          <div className="w-full bg-white rounded-xl border border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" />
              <div>
                <p className="text-xs font-bold text-dark">@anabeatriz.foto</p>
                <p className="text-[10px] text-muted">Fotógrafa · Recife, PE</p>
              </div>
            </div>
            <p className="text-[10px] text-dark mb-2">📸 Eternizando momentos especiais<br />📍 Recife e região</p>
            <div className="bg-light border border-blue-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <Link2 size={10} className="text-primary flex-shrink-0" />
              <span className="text-[10px] text-primary font-semibold">orcalink.com/anabeatriz</span>
            </div>
          </div>
          <p className="text-xs text-muted text-center">Seu link funciona no Instagram, WhatsApp, TikTok — em qualquer lugar.</p>
        </div>
      </div>
    ),
  },
  {
    icon: Calculator,
    step: '03',
    title: 'Seu cliente calcula sozinho',
    description:
      'O cliente abre o link, responde as perguntas e vê o preço instantaneamente. Você recebe a notificação.',
    visual: (
      <div className="bg-background rounded-xl p-4 border border-border">
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="bg-primary px-4 py-3">
            <p className="text-white text-xs font-heading font-bold">Orçamento pronto!</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="text-center py-2">
              <p className="text-xs text-muted mb-1">Valor total estimado</p>
              <p className="font-mono font-bold text-3xl text-primary">R$ 890</p>
            </div>
            <div className="space-y-1.5 border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="text-xs text-muted">Ensaio casal</span>
                <span className="text-xs font-mono font-semibold">R$500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted">Externo +</span>
                <span className="text-xs font-mono font-semibold">R$150</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted">50 fotos</span>
                <span className="text-xs font-mono font-semibold">R$240</span>
              </div>
            </div>
            <button className="w-full bg-primary text-white text-xs font-bold py-2.5 rounded-lg font-heading">
              Quero agendar →
            </button>
          </div>
        </div>
      </div>
    ),
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="como-funciona" className="bg-background py-20 lg:py-28" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <h2 className="section-heading text-3xl lg:text-4xl mb-4">
            Simples como criar um Linktree.{' '}
            <span className="text-primary">Só que gera dinheiro.</span>
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Três passos. Sem código. Sem complicação.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-4 relative">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="relative flex items-stretch">
                <motion.div
                  initial={{ opacity: 0, y: 32 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.55, delay: i * 0.15 }}
                  className="card p-6 flex flex-col gap-5 w-full"
                >
                  {/* Step number + icon */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon size={22} className="text-primary" />
                    </div>
                    <span className="font-mono font-bold text-3xl text-border">{step.step}</span>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-lg text-dark mb-2">{step.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{step.description}</p>
                  </div>

                  {/* Visual mockup */}
                  <div className="mt-auto">{step.visual}</div>
                </motion.div>

                {/* Arrow between steps */}
                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 bg-white border border-border rounded-full shadow-card"
                  >
                    <ArrowRight size={16} className="text-primary" />
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
