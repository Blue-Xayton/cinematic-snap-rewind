import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Film, Upload, Wand2, Download, Sparkles, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import featureAiEditing from "@/assets/feature-ai-editing.jpg";
import featureSmartSelection from "@/assets/feature-smart-selection.jpg";
import featureCinematic from "@/assets/feature-cinematic.jpg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden">
        {/* Hero Image Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="AI transforming memories" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>
        
        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 py-24 sm:py-40">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-primary shadow-glow">
              <Sparkles className="h-4 w-4" />
              <span>Transform Memories Into Cinematic Stories</span>
            </div>
            
            <h1 className="mb-8 text-6xl font-bold tracking-tight text-foreground sm:text-8xl leading-tight">
              Your Memories,
              <span className="block bg-gradient-accent bg-clip-text text-transparent mt-2">
                Cinematically Reborn
              </span>
            </h1>
            
            <p className="mb-12 text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Upload your everyday photos and videos. ReliveAI's advanced AI transforms them into stunning, 
              beat-synced cinematic reels in seconds.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
              <Button 
                size="lg" 
                variant="hero"
                className="text-lg h-14 px-8"
                onClick={() => navigate('/create')}
              >
                <Upload className="mr-2 h-5 w-5" />
                Start Creating Free
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg h-14 px-8 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card"
                onClick={() => navigate('/jobs')}
              >
                <Film className="mr-2 h-5 w-5" />
                See Examples
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>No editing skills required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Ready in 30 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Free to start</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Narrative */}
      <section className="py-20 sm:py-32 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Tired of Hours Spent Editing?
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Most people have hundreds of photos collecting digital dust. Creating a compelling video 
                reel traditionally requires expensive software, hours of learning, and tedious manual work.
              </p>
            </div>
            
            <Card className="bg-gradient-card border-border/50 p-8 sm:p-12 text-center shadow-elegant">
              <Sparkles className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-foreground mb-4">
                ReliveAI Does It All Automatically
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Our AI analyzes every frame, identifies the best moments, syncs to music beats, 
                applies cinematic grading, and delivers a professional reel—all without you lifting a finger.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Three Hero Features with Images */}
      <section className="py-20 sm:py-32 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three revolutionary features that make ReliveAI the future of video creation
            </p>
          </div>

          <div className="mx-auto max-w-6xl space-y-24">
            {/* Feature 1: Beat-Synced Editing */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
                  <Zap className="h-4 w-4" />
                  <span>Feature 01</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Beat-Synced Editing
                </h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Our AI analyzes your music's rhythm and tempo, automatically cutting and 
                  transitioning clips precisely on beat. Every moment flows seamlessly with the soundtrack, 
                  creating that professional, TikTok-ready feel.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Automatic beat detection and analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Perfect timing on every cut and transition</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Professional-quality rhythm matching</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2">
                <Card className="overflow-hidden border-border/50 shadow-elegant">
                  <img 
                    src={featureAiEditing} 
                    alt="AI beat-synced editing interface" 
                    className="w-full h-full object-cover"
                  />
                </Card>
              </div>
            </div>

            {/* Feature 2: Smart Frame Selection */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Card className="overflow-hidden border-border/50 shadow-elegant">
                  <img 
                    src={featureSmartSelection} 
                    alt="Smart frame selection visualization" 
                    className="w-full h-full object-cover"
                  />
                </Card>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent mb-4">
                  <Sparkles className="h-4 w-4" />
                  <span>Feature 02</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Smart Frame Selection
                </h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Not all moments are created equal. Our AI identifies your best shots—genuine smiles, 
                  dynamic action, perfect lighting—and automatically selects the frames that tell 
                  your story most powerfully.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Emotion and action detection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Quality assessment for each frame</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Intelligent scene composition analysis</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3: Cinematic Grading */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
                  <Film className="h-4 w-4" />
                  <span>Feature 03</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Cinematic Color Grading
                </h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Transform ordinary footage into cinema-quality visuals. Our AI applies professional 
                  color correction, mood matching, and film-grade effects that would normally require 
                  expensive software and years of experience.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Hollywood-grade color correction</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Automatic mood and tone matching</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Professional lighting enhancement</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2">
                <Card className="overflow-hidden border-border/50 shadow-elegant">
                  <img 
                    src={featureCinematic} 
                    alt="Cinematic color grading example" 
                    className="w-full h-full object-cover"
                  />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-20 text-center">
            <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">
              Create Your Reel in Three Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From raw memories to cinematic masterpiece—faster than making coffee
            </p>
          </div>
          
          <div className="mx-auto max-w-5xl">
            <div className="relative">
              {/* Connection Line */}
              <div className="absolute left-8 top-16 bottom-16 w-0.5 bg-gradient-to-b from-primary via-accent to-primary hidden md:block" />
              
              <div className="space-y-12">
                {/* Step 1 */}
                <div className="relative flex gap-8 items-start">
                  <div className="flex-shrink-0">
                    <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-glow">
                      <Upload className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                  <Card className="flex-1 bg-card border-border/50 p-8 shadow-elegant hover:shadow-glow transition-all">
                    <div className="text-sm font-semibold text-primary mb-2">STEP 01</div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">Upload Your Memories</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Drag and drop your photos and videos—any format, any resolution, from any device. 
                      Add your favorite track or let us suggest the perfect soundtrack.
                    </p>
                  </Card>
                </div>

                {/* Step 2 */}
                <div className="relative flex gap-8 items-start">
                  <div className="flex-shrink-0">
                    <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-glow">
                      <Wand2 className="h-8 w-8 text-accent-foreground" />
                    </div>
                  </div>
                  <Card className="flex-1 bg-card border-border/50 p-8 shadow-elegant hover:shadow-glow transition-all">
                    <div className="text-sm font-semibold text-accent mb-2">STEP 02</div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">AI Works Its Magic</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Sit back while our AI analyzes every frame, detects beats, selects the best moments, 
                      and applies cinematic grading. All in under 30 seconds.
                    </p>
                  </Card>
                </div>

                {/* Step 3 */}
                <div className="relative flex gap-8 items-start">
                  <div className="flex-shrink-0">
                    <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-glow">
                      <Download className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                  <Card className="flex-1 bg-card border-border/50 p-8 shadow-elegant hover:shadow-glow transition-all">
                    <div className="text-sm font-semibold text-primary mb-2">STEP 03</div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">Download & Share</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Your professional vertical reel is ready! Download in perfect quality and share 
                      directly to Instagram, TikTok, or any social platform.
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-accent opacity-10" />
        <div className="container relative mx-auto px-4">
          <Card className="mx-auto max-w-4xl bg-gradient-card border-border/50 p-12 sm:p-16 text-center shadow-elegant">
            <Sparkles className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">
              Ready to Transform Your Memories?
            </h2>
            <p className="mb-10 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join thousands creating stunning cinematic reels in seconds. No editing skills required. 
              Start free today.
            </p>
            <Button 
              size="lg" 
              variant="hero"
              className="text-lg h-14 px-10"
              onClick={() => navigate('/create')}
            >
              <Upload className="mr-2 h-5 w-5" />
              Start Creating Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <div className="mt-8 text-sm text-muted-foreground">
              No credit card required • Create your first reel in 30 seconds
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;