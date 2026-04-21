import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import PhoneMockup from './PhoneMockup'

const notifications = [
  { emoji: '📸', text: 'Ana viu seu orçamento', delay: 0 },
  { emoji: '💰', text: 'Pedro aceitou: R$890', delay: 0.8 },
  { emoji: '⚡', text: '12 orçamentos hoje', delay: 1.6 },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-background"
      style={{ minHeight: 'calc(100vh - 64px)' }}
    >
      {/* Dot pattern background */}
      <div className="absolute inset-0 dot-pattern opacity-50" />
      {/* Subtle blue glow top-right */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-light border border-blue-200 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-primary font-heading">
                A única ferramenta brasileira de orçamento automático
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-heading font-bold text-4xl sm:text-5xl lg:text-[56px] text-dark leading-[1.08] tracking-tight mb-6"
            >
              Seu cliente pergunta o preço.{' '}
              <span className="text-primary">Você já respondeu.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-muted leading-relaxed mb-10"
            >
              Crie um link com seu cardápio de serviços. Seu cliente abre, escolhe o que quer e já vê o valor — sem te mandar mensagem.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-8">
              <a
                href="#precos"
                className="inline-flex items-center gap-2 bg-primary text-white font-heading font-bold text-base px-7 py-4 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Criar meu link grátis
                <ArrowRight size={18} />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 text-dark font-heading font-semibold text-base hover:text-primary transition-colors duration-150 underline underline-offset-4"
              >
                <div className="w-9 h-9 bg-white border border-border rounded-full flex items-center justify-center shadow-sm">
                  <Play size={14} fill="currentColor" />
                </div>
                Ver demo ao vivo
              </a>
            </motion.div>

            {/* Social proof bar */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-x-5 gap-y-2">
              {['Sem cartão de crédito', 'Grátis pra sempre no plano básico', 'Setup em 5 minutos'].map((text, i) => (
                <span key={i} className="flex items-center gap-1.5 text-sm text-muted">
                  <span className="text-success">✓</span>
                  {text}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: phone + notifications */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              <PhoneMockup />

              {/* Floating notifications */}
              {notifications.map((notif, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20, y: 0 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: [0, -6, 0],
                  }}
                  transition={{
                    opacity: { delay: 0.8 + notif.delay, duration: 0.4 },
                    x: { delay: 0.8 + notif.delay, duration: 0.4 },
                    y: {
                      delay: 1.2 + notif.delay,
                      duration: 3,
                      repeat: Infinity,
                      repeatType: 'loop',
                      ease: 'easeInOut',
                    },
                  }}
                  className="absolute bg-white border border-border rounded-xl px-3 py-2 shadow-card flex items-center gap-2 whitespace-nowrap"
                  style={{
                    left: i === 0 ? '-120px' : i === 2 ? '-110px' : undefined,
                    right: i === 1 ? '-110px' : undefined,
                    top: i === 0 ? '60px' : i === 1 ? '180px' : '310px',
                    zIndex: 10,
                  }}
                >
                  <span className="text-base">{notif.emoji}</span>
                  <span className="text-xs font-semibold text-dark font-heading">{notif.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
