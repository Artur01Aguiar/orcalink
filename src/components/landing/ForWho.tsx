import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const profiles = [
  {
    emoji: '📸',
    profession: 'Fotógrafo',
    pain: 'Ensaio, casamento, formatura. Cada cliente pergunta de um jeito diferente.',
    example: 'Ana usou a OrcaLink e reduziu 80% das mensagens de orçamento.',
    color: 'from-blue-50 to-blue-100/50',
    accent: 'text-blue-600',
  },
  {
    emoji: '🎨',
    profession: 'Designer',
    pain: 'Logo, identidade visual, social media. Preço varia muito? Deixa o cliente montar.',
    example: 'Pedro converte 3x mais clientes com o link na bio.',
    color: 'from-purple-50 to-purple-100/50',
    accent: 'text-purple-600',
  },
  {
    emoji: '💉',
    profession: 'Tatuador',
    pain: 'Flash, custom, cobertura. O cliente precisa entender o que afeta o preço antes de perguntar.',
    example: 'Rafael para de receber pedidos de orçamento sem referência.',
    color: 'from-gray-50 to-gray-100/50',
    accent: 'text-gray-700',
  },
  {
    emoji: '🏋️',
    profession: 'Personal Trainer',
    pain: 'Presencial, online, pacotes. Explica uma vez no link, responde zero vezes no WhatsApp.',
    example: 'Camila fechou 5 alunos novos em uma semana.',
    color: 'from-green-50 to-green-100/50',
    accent: 'text-green-600',
  },
  {
    emoji: '🥗',
    profession: 'Nutricionista',
    pain: 'Consulta, acompanhamento, plano. Tudo tem preço diferente. Deixa o link explicar.',
    example: 'Dra. Julia eliminou 2h/dia de respostas repetitivas.',
    color: 'from-emerald-50 to-emerald-100/50',
    accent: 'text-emerald-600',
  },
  {
    emoji: '🎬',
    profession: 'Videomaker',
    pain: 'Institucional, casamento, social media. Briefing antes do orçamento? O formulário faz isso.',
    example: 'Lucas fecha projetos maiores porque qualifica o cliente primeiro.',
    color: 'from-orange-50 to-orange-100/50',
    accent: 'text-orange-600',
  },
]

export default function ForWho() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-white py-20 lg:py-28" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <h2 className="section-heading text-3xl lg:text-4xl mb-4">
            Para qualquer profissional que cobra por serviço
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Se você recebe pedidos de orçamento no WhatsApp, a OrcaLink é pra você.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {profiles.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4, boxShadow: '0 12px 28px -6px rgba(0,0,0,0.12)' }}
              className={`rounded-2xl border border-border bg-gradient-to-br ${p.color} p-6 cursor-default transition-shadow`}
            >
              <div className="text-4xl mb-4">{p.emoji}</div>
              <h3 className="font-heading font-bold text-lg text-dark mb-2">{p.profession}</h3>
              <p className="text-sm text-muted italic leading-relaxed mb-4">"{p.pain}"</p>
              <div className="flex items-start gap-2 pt-3 border-t border-border/50">
                <span className="text-success flex-shrink-0 mt-0.5">✓</span>
                <p className={`text-sm font-semibold ${p.accent}`}>{p.example}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.55, delay: 0.6 }}
          className="text-center text-muted text-sm mt-10"
        >
          Também usado por arquitetos, advogados, coaches, fotógrafos de eventos e muito mais.
        </motion.p>
      </div>
    </section>
  )
}
