import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Stethoscope, LineChart, Sparkles, ArrowRight } from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight text-primary">
              ਪੰਖ <span className="text-sm font-medium text-muted-foreground">PANKH</span>
            </span>
            <Badge variant="outline" className="text-xs">Punjab Poultry Platform</Badge>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost">ਲਾਗਇਨ / Login</Button>
            </Link>
            <Link href="/register">
              <Button>ਰਜਿਸਟਰ / Register</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-4 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>ਪੰਜਾਬੀ-ਫਸਟ ਪੋਲਟਰੀ ਫਾਰਮ ਇੰਟੈਲੀਜੈਂਸ ਪਲੇਟਫਾਰਮ</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            ਪੋਲਟਰੀ ਕਿਸਾਨਾਂ ਦੀ ਤਰੱਕੀ ਅਤੇ ਸੁਰੱਖਿਆ ਲਈ{" "}
            <span className="text-primary underline decoration-muted">ਪੰਖ</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Early disease alerts, Punjabi-first AI advice, direct vet escalation, and automated flock
            cost tracking — designed for broiler and layer farms across Punjab.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                ਸੁਰੂ ਕਰੋ / Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                ਡੈਸ਼ਬੋਰਡ / Dashboard
              </Button>
            </Link>
          </div>
        </section>

        {/* 4 Modules Overview */}
        <section className="py-16 border-t bg-muted/20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold">ਚਾਰ ਮੁੱਖ ਸੇਵਾਵਾਂ / Four Core Modules</h2>
              <p className="text-muted-foreground mt-2">Comprehensive farm management built for high yield and disease control.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <Sparkles className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Pankh AI</CardTitle>
                  <CardDescription>Punjabi Voice & Assistant</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Ask poultry questions in Punjabi, Hinglish, or English via voice or text with strict RAG knowledge citations.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <ShieldAlert className="h-8 w-8 text-amber-600 mb-2" />
                  <CardTitle className="text-lg">Pankh Sentinel</CardTitle>
                  <CardDescription>Early Disease Risk Alerts</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Continuous mortality, feed drop, and microclimate risk monitoring with rule-based early warning thresholds.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Stethoscope className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">Pankh Connect</CardTitle>
                  <CardDescription>Vet & Lab Escalation</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Verified veterinary doctors and diagnostic labs locator across Punjab with 1-tap WhatsApp case escalation.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <LineChart className="h-8 w-8 text-emerald-600 mb-2" />
                  <CardTitle className="text-lg">Pankh Economics</CardTitle>
                  <CardDescription>Flock Cost & Profit</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Real-time FCR calculation, feed cost tracking, mortality loss assessment, and batch-wise profitability analysis.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          © {new Date().getFullYear()} Pankh Platform. Built for Indian poultry farmers. Single shared account per farm.
        </div>
      </footer>
    </div>
  );
}
