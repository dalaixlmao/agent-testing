import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spotlight } from '@/components/ui/spotlight'
import { Timeline } from '@/components/ui/timeline'
import { GooeyText } from '@/components/ui/gooey-text-morphing'
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid'
import {
  Receipt,
  Users,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Globe,
  Sparkles,
} from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  const timelineData = [
    {
      title: "Step 1",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Create an account in seconds with email or Google OAuth
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80"
              alt="signup"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05)]"
            />
            <img
              src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=500&q=80"
              alt="team"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05)]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Step 2",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Add expenses and split them with friends instantly
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&q=80"
              alt="expense tracking"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05)]"
            />
            <img
              src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=500&q=80"
              alt="friends"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05)]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Step 3",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
            View optimized settlements and settle up easily
          </p>
          <div className="mb-8">
            <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-xs md:text-sm">
              ✅ Smart debt simplification algorithm
            </div>
            <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-xs md:text-sm">
              ✅ Minimized number of transactions
            </div>
            <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-xs md:text-sm">
              ✅ Real-time balance calculations
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80"
              alt="analytics"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05)]"
            />
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80"
              alt="dashboard"
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05)]"
            />
          </div>
        </div>
      ),
    },
  ];

  const features = [
    {
      Icon: Receipt,
      name: "Expense Tracking",
      description: "Add expenses with custom splits or equal division among friends",
      href: "/signup",
      cta: "Get Started",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
      ),
      className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    },
    {
      Icon: Users,
      name: "Group Management",
      description: "Easily manage expenses with multiple friends and groups",
      href: "/signup",
      cta: "Learn more",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10" />
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    },
    {
      Icon: TrendingUp,
      name: "Smart Settlements",
      description: "Optimized algorithm minimizes the number of transactions needed",
      href: "/signup",
      cta: "Learn more",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
      Icon: DollarSign,
      name: "Balance Overview",
      description: "See your total paid, total owed, and net balance at a glance",
      href: "/signup",
      cta: "Learn more",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10" />
      ),
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: Zap,
      name: "Real-time Updates",
      description: "Get instant balance updates and settlement calculations",
      href: "/signup",
      cta: "Learn more",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10" />
      ),
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section with Spotlight */}
      <section className="relative overflow-hidden">
        <Card className="w-full min-h-[600px] bg-black/[0.96] relative overflow-hidden border-none rounded-none">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />

          <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Gooey Text Animation */}
              <div className="h-[120px] flex items-center justify-center">
                <GooeyText
                  texts={["Track", "Split", "Settle", "Repeat"]}
                  morphTime={1}
                  cooldownTime={0.5}
                  className="font-bold"
                  textClassName="text-white"
                />
              </div>

              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                Expense Tracking Made Simple
              </h1>

              <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto">
                Split expenses with friends, track who owes what, and settle up with optimized calculations. No more complicated spreadsheets.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="gap-2 bg-white text-black hover:bg-white/90"
                  onClick={() => navigate('/signup')}
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/20 text-white hover:bg-white/10"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-4 justify-center pt-8">
                {[
                  { icon: Shield, text: "Secure" },
                  { icon: Globe, text: "OAuth2 Login" },
                  { icon: Sparkles, text: "Smart Algorithm" },
                  { icon: Check, text: "Free Forever" },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                  >
                    <feature.icon className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-neutral-200">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Features Bento Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features to make expense tracking effortless
          </p>
        </div>

        <BentoGrid className="lg:grid-rows-3">
          {features.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </section>

      {/* Timeline Section */}
      <section className="bg-white dark:bg-neutral-950">
        <Timeline data={timelineData} />
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 border-none">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-24 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Simplify Your Expenses?
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Join thousands of users who trust us to manage their shared expenses. Get started in less than a minute.
            </p>
            <Button
              size="lg"
              className="gap-2 bg-white text-blue-600 hover:bg-white/90 text-lg px-8"
              onClick={() => navigate('/signup')}
            >
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Expense Share</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Expense Share. Built with ❤️ for seamless expense tracking.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
