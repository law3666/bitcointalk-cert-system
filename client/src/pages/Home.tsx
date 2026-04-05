import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Award, CheckCircle2, Users, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-secondary" />
            <span className="text-xl font-bold text-primary">BitcoinTalk Cert</span>
          </div>
          <Button size="sm" asChild>
            <a href={isAuthenticated ? "/dashboard" : getLoginUrl()}>
              {isAuthenticated ? "Dashboard" : "Sign In"}
            </a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <Badge className="w-fit">Community-Driven Certification</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
            Turn Your Bitcointalk Expertise Into Real Credentials
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            Get recognized for your knowledge and contributions on Bitcointalk. Our community-verified certification system converts your forum reputation into portable, verifiable credentials endorsed by veteran members.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {isAuthenticated ? (
              <>
                <Button size="lg" asChild>
                  <Link href="/apply">Apply for Certification</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/verify">Verify Certificate</Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild>
                  <a href={getLoginUrl()}>Get Started</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/verify">Verify Certificate</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="space-y-4">
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Award className="w-16 h-16 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary mb-1">Gold Certificate</h3>
                <p className="text-muted">Score: 94.5/100</p>
              </div>
              <div className="space-y-3 py-4 border-t border-b border-blue-200">
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Technical Knowledge</span>
                  <span className="font-semibold text-primary">9.5/10</span>
                </div>
                <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "95%" }}></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Contribution Quality</span>
                  <span className="font-semibold text-primary">9.2/10</span>
                </div>
                <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "92%" }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border py-20 bg-card">
        <div className="container">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8 text-secondary" />,
                title: "Apply for Certification",
                desc: "Submit your expertise area, contributions, and supporting evidence to be evaluated by the community.",
              },
              {
                icon: <CheckCircle2 className="w-8 h-8 text-secondary" />,
                title: "Expert Review",
                desc: "Hero and Legendary members evaluate your knowledge on technical depth, contribution quality, and consistency.",
              },
              {
                icon: <Award className="w-8 h-8 text-secondary" />,
                title: "Get Certified",
                desc: "Receive a verifiable digital certificate with unique ID and QR code that proves your expertise.",
              },
            ].map((feature, i) => (
              <Card key={i} className="p-8 space-y-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-secondary/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary">{feature.title}</h3>
                <p className="text-muted">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certification Levels */}
      <section className="container py-20">
        <h2 className="text-4xl font-bold text-primary mb-12 text-center">Certification Levels</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { level: "Bronze", score: "70-79", color: "bg-orange-100 border-orange-200", icon: "🥉" },
            { level: "Silver", score: "80-89", color: "bg-gray-100 border-gray-200", icon: "🥈" },
            { level: "Gold", score: "90-100", color: "bg-amber-100 border-amber-200", icon: "🥇" },
          ].map((cert) => (
            <Card key={cert.level} className={`p-8 border-2 ${cert.color} text-center space-y-4`}>
              <p className="text-4xl">{cert.icon}</p>
              <h3 className="text-2xl font-bold text-primary">{cert.level}</h3>
              <p className="text-lg font-semibold text-secondary">{cert.score}</p>
              <p className="text-sm text-muted">
                {cert.level === "Bronze" && "Solid expertise and contributions"}
                {cert.level === "Silver" && "Strong expertise and consistent quality"}
                {cert.level === "Gold" && "Outstanding expertise and leadership"}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border py-20 bg-card">
        <div className="container text-center space-y-6">
          <h2 className="text-4xl font-bold text-primary">Ready to Get Certified?</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Join hundreds of Bitcointalk members who have converted their expertise into verifiable credentials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Button size="lg" asChild>
                  <Link href="/apply">Start Your Application</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild>
                  <a href={getLoginUrl()}>Sign In to Apply</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/verify">Verify a Certificate</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background">
        <div className="container text-center text-sm text-muted">
          <p>© 2026 Bitcointalk Certification System. Community-driven expertise verification.</p>
        </div>
      </footer>
    </div>
  );
}
