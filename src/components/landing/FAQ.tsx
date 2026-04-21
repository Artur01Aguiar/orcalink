import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    q: 'Precisa saber programar pra usar a OrcaLink?',
    a: 'Não. O editor é visual, arrastar e soltar. Se você sabe usar o Instagram, sabe usar a OrcaLink. Nenhuma linha de código necessária.',
  },
  {
    q: 'Qual a diferença pro Typeform ou Linktree?',
    a: 'Typeform coleta dados mas não calcula preço. Linktree só redireciona links. A OrcaLink é a única que gera orçamento automático para o cliente final, em português, feito para MEIs brasileiros.',
  },
  {
    q: 'Como o cliente paga o serviço pela OrcaLink?',
    a: 'A OrcaLink não processa pagamentos — ela gera o orçamento e conecta você com o cliente. O pagamento acontece como você preferir: Pix, cartão, boleto. Integração de pagamento está no roadmap.',
  },
  {
    q: 'E se meu preço variar muito por projeto?',
    a: 'Por isso o formulário é interativo. Você cria perguntas ("qual o tamanho?", "tem deadline agressivo?") e cada resposta adiciona ou desconta valor automaticamente. O preço final é gerado com base nas escolhas do cliente.',
  },
  {
    q: 'O plano grátis é para sempre?',
    a: 'Sim. Sem trial, sem cartão de crédito. O plano grátis com 1 formulário e 30 orçamentos/mês é seu para sempre. Upgrade só quando fizer sentido pra você.',
  },
  {
    q: 'Funciona pra qualquer profissão?',
    a: 'Qualquer profissional que cobra por serviço e recebe pedidos de orçamento no WhatsApp ou Instagram. Fotógrafo, designer, tatuador, personal, nutricionista, videomaker, advogado, arquiteto — todos.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="faq" className="bg-white py-20 lg:py-28" ref={ref}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <h2 className="section-heading text-3xl lg:text-4xl mb-4">Dúvidas frequentes</h2>
          <p className="text-muted text-lg">Tudo que você precisa saber antes de criar seu link.</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="border border-border rounded-2xl overflow-hidden bg-background"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/60 transition-colors"
                aria-expanded={open === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span className="font-heading font-semibold text-dark pr-4 leading-snug">
                  {faq.q}
                </span>
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center">
                  {open === i ? (
                    <Minus size={14} className="text-primary" />
                  ) : (
                    <Plus size={14} className="text-muted" />
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    id={`faq-answer-${i}`}
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className="px-6 pb-5 text-muted text-sm leading-relaxed border-t border-border pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
