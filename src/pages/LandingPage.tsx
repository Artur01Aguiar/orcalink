import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import SocialProof from '../components/landing/SocialProof'
import Problem from '../components/landing/Problem'
import HowItWorks from '../components/landing/HowItWorks'
import InteractiveDemo from '../components/landing/InteractiveDemo'
import ForWho from '../components/landing/ForWho'
import Comparison from '../components/landing/Comparison'
import Pricing from '../components/landing/Pricing'
import Testimonials from '../components/landing/Testimonials'
import FAQ from '../components/landing/FAQ'
import FinalCTA from '../components/landing/FinalCTA'
import Footer from '../components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen font-body">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Problem />
        <HowItWorks />
        <InteractiveDemo />
        <ForWho />
        <Comparison />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
