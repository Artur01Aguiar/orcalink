import { Mail, Instagram, Phone } from 'lucide-react'

const navLinks = [
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Preços', href: '#precos' },
  { label: 'Blog', href: '#' },
  { label: 'Termos de Uso', href: '#' },
  { label: 'Privacidade', href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#" className="inline-block mb-4">
              <span className="font-heading font-bold text-2xl">
                <span className="text-primary">orca</span>
                <span className="text-white">link</span>
              </span>
            </a>
            <p className="text-white/50 text-sm leading-relaxed">
              Seu cliente calcula.<br />Você fecha.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-heading font-semibold text-white/40 uppercase tracking-widest mb-4">
              Produto
            </p>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-heading font-semibold text-white/40 uppercase tracking-widest mb-4">
              Contato
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:orcalink.app@gmail.com"
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Mail size={14} />
                  orcalink.app@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5511528681090"
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Phone size={14} />
                  +55 11 5286-8190
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/orcalink.app/"
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Instagram size={14} />
                  @orcalink.app
                </a>
              </li>
            </ul>
          </div>

          {/* Made with love */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-heading font-semibold text-white/40 uppercase tracking-widest">
              Origem
            </p>
            <p className="text-sm text-white/60 leading-relaxed">
              Feito com ❤️ em Recife, Brasil.
            </p>
            <a
              href="#precos"
              className="inline-flex items-center justify-center bg-primary hover:bg-blue-600 text-white text-sm font-heading font-bold px-5 py-2.5 rounded-xl transition-colors self-start"
            >
              Criar conta grátis →
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © 2026 OrcaLink. Todos os direitos reservados.
          </p>
          <p className="text-xs text-white/30">
            CNPJ: Em registro · Recife, PE · Brasil
          </p>
        </div>
      </div>
    </footer>
  )
}
