import { Button } from "@/components/ui/button";
import { Film, Upload, Wand2, Download, Sparkles, Clock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-4 py-20 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Video Creation</span>
            </div>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
              Relive Your Moments
              <span className="block bg-gradient-accent bg-clip-text text-transparent">
                In 30 Seconds
              </span>
            </h1>
            
            <p className="mb-10 text-xl text-muted-foreground sm:text-2xl">
              Upload photos and videos. Get a stunning cinematic reel.
              <span className="block mt-2">Automatically.</span>
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button 
                size="lg" 
                variant="hero"
                className="text-lg"
                onClick={() => navigate('/create')}
              >
                <Upload className="mr-2 h-5 w-5" />
                Create Your Reel
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg border-border bg-card/50 hover:bg-card"
                onClick={() => navigate('/jobs')}
              >
                <Film className="mr-2 h-5 w-5" />
                View Examples
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              Three Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground">
              From raw memories to cinematic masterpiece
            </p>
          </div>
          
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="group relative">
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-card opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
              <div className="rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-elegant">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Upload className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">1. Upload</h3>
                <p className="text-muted-foreground">
                  Drop your photos and videos. We handle any format, resolution, or device.
                </p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-card opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
              <div className="rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-elegant">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                  <Wand2 className="h-7 w-7 text-accent" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">2. AI Magic</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes every frame, detects beats, and crafts the perfect sequence.
                </p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-card opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
              <div className="rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-elegant">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Download className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">3. Download</h3>
                <p className="text-muted-foreground">
                  Get your vertical video ready for Instagram, TikTok, or any platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-card/30 py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">Beat-Synced Editing</h3>
                <p className="text-muted-foreground">
                  Every cut, transition, and moment perfectly timed to your music's rhythm.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">Smart Frame Selection</h3>
                <p className="text-muted-foreground">
                  AI identifies your best moments—smiles, action, perfect lighting.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Film className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">Cinematic Grading</h3>
                <p className="text-muted-foreground">
                  Professional color correction and mood matching applied automatically.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  From upload to finished video in minutes, not hours. No manual work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">
              Ready to relive your moments?
            </h2>
            <p className="mb-10 text-xl text-muted-foreground">
              Join thousands creating stunning video reels in seconds
            </p>
            <Button 
              size="lg" 
              variant="hero"
              className="text-lg"
              onClick={() => navigate('/create')}
            >
              <Upload className="mr-2 h-5 w-5" />
              Start Creating Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
