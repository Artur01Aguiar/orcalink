import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    initials: 'AB',
    name: 'Ana B.',
    role: 'Fotógrafa',
    city: 'Recife, PE',
    quote:
      'Eu respondia em média umas 20 mensagens de orçamento por dia. Com a OrcaLink, mando o link e o cliente já chega sabendo o preço. Só fecho a data.',
    color: 'from-blue-500 to-blue-700',
  },
  {
    initials: 'PL',
    name: 'Pedro L.',
    role: 'Designer Gráfico',
    city: 'São Paulo, SP',
    quote:
      'Meu link ficou mais bonito que o Typeform que eu usava e ainda calcula o preço automaticamente. Não tem comparação.',
    color: 'from-purple-500 to-purple-700',
  },
  {
    initials: 'CR',
    name: 'Camila R.',
    role: 'Personal Trainer',
    city: 'Belo Horizonte, MG',
    quote:
      'Três alunos fecharam o plano depois de ver o orçamento no link — sem eu precisar responder nada. Isso pra mim vale muito mais que R$30/mês.',
    color: 'from-green-500 to-green-700',
  },
]

function Stars() {
  return (
    <div className="flex gap-0.5" aria-label="5 estrelas">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} fill="#F59E0B" className="text-amber-400" />
      ))}
    </div>
  )
}

export default function Testimonials() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-background py-20 lg:py-28" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <h2 className="section-heading text-3xl lg:text-4xl mb-4">
            O que profissionais estão dizendo
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -3 }}
              className="card p-7 flex flex-col gap-4 cursor-default"
            >
              <Stars />

              <blockquote className="text-dark text-sm leading-relaxed flex-1">
                "{t.quote}"
              </blockquote>

              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-xs font-bold font-heading">{t.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-dark font-heading">{t.name}</p>
                  <p className="text-xs text-muted">
                    {t.role} · {t.city}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
