import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function FinalCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-primary py-20 lg:py-28" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="font-heading font-bold text-3xl lg:text-5xl text-white leading-tight tracking-tight">
            Quantas vendas você perdeu essa semana porque demorou pra responder?
          </h2>

          <p className="text-blue-200 text-lg lg:text-xl max-w-xl mx-auto">
            5 minutos pra criar seu link. Zero reais pra começar.
          </p>

          <motion.a
            href="#precos"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2.5 bg-white text-primary font-heading font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
            aria-label="Criar meu link agora — é grátis"
          >
            Criar meu link agora — é grátis
            <ArrowRight size={20} />
          </motion.a>

          <p className="text-blue-200/80 text-sm">
            Sem cartão de crédito · Cancela quando quiser · Setup em 5 minutos
          </p>
        </motion.div>
      </div>
    </section>
  )
}
