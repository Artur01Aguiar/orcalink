import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const chats = [
  {
    messages: [
      { text: 'Oi, quanto custa um ensaio externo com 30 fotos?', time: '08:23', mine: false },
      { text: 'Oi! Ensaio externo começa em R$450, com 30 fotos fica...', time: '08:47', mine: true },
    ],
    tag: '24 minutos depois',
    tagColor: 'bg-red-100 text-red-600',
    title: 'A pergunta infinita',
  },
  {
    messages: [
      { text: 'Oi, quanto custa um ensaio externo com 30 fotos?', time: '09:10', mine: false },
      { text: 'Ensaio externo com 30 fotos editadas fica R$570. Tem disponibilidade neste fim de semana!', time: '09:12', mine: true },
      { text: 'Ah entendi, obrigada!', time: '09:15', mine: false },
    ],
    tag: 'Nunca mais respondeu',
    tagColor: 'bg-gray-100 text-gray-500',
    title: 'O cliente que sumiu',
  },
  {
    messages: [
      { text: 'Oi, vi que você faz ensaios. Qual o preço?', time: '14:30', mine: false },
    ],
    tag: 'Cliente fechou com outro',
    tagColor: 'bg-orange-100 text-orange-600',
    title: 'A venda perdida',
    noReply: true,
  },
]

export default function Problem() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

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
            Você já viveu isso hoje?
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {chats.map((chat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className="card p-6"
            >
              {/* Chat header */}
              <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
                <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">W</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark font-heading">Cliente</p>
                  <p className="text-xs text-success">online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-2.5 mb-4">
                {chat.messages.map((msg, j) => (
                  <div key={j} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                        msg.mine
                          ? 'bg-[#DCF8C6] text-dark rounded-br-sm'
                          : 'bg-gray-100 text-dark rounded-bl-sm'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-[10px] text-muted mt-0.5 text-right">{msg.time}</p>
                    </div>
                  </div>
                ))}

                {chat.noReply && (
                  <div className="flex justify-center py-2">
                    <span className="text-xs text-muted italic">aguardando resposta...</span>
                  </div>
                )}
              </div>

              {/* Tag */}
              <div className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold font-heading ${chat.tagColor}`}>
                {chat.tag}
              </div>

              <p className="text-xs font-semibold text-muted mt-3 font-heading uppercase tracking-wide">
                {chat.title}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.5 }}
          className="text-center text-muted text-lg max-w-2xl mx-auto leading-relaxed"
        >
          Enquanto você digita o mesmo orçamento pela décima vez, outro profissional com preço visível já fechou o serviço.{' '}
          <span className="text-dark font-semibold">A OrcaLink resolve isso em 5 minutos.</span>
        </motion.p>
      </div>
    </section>
  )
}
