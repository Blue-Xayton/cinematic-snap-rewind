import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Film, Upload, Wand2, Download, Sparkles, Zap, CheckCircle2, ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-image.jpg";
import featureAiEditing from "@/assets/feature-ai-editing.jpg";
import featureSmartSelection from "@/assets/feature-smart-selection.jpg";
import featureCinematic from "@/assets/feature-cinematic.jpg";
import showcaseBefore1 from "@/assets/showcase-before-1.jpg";
import showcaseAfter1 from "@/assets/showcase-after-1.jpg";
import showcaseBefore2 from "@/assets/showcase-before-2.jpg";
import showcaseAfter2 from "@/assets/showcase-after-2.jpg";
import showcaseBefore3 from "@/assets/showcase-before-3.jpg";
import showcaseAfter3 from "@/assets/showcase-after-3.jpg";

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

      {/* Video Showcase Gallery */}
      <section className="py-20 sm:py-32 bg-card/20 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
              <Play className="h-4 w-4" />
              <span>See the Transformation</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              From Everyday Photos to Cinematic Magic
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real reels created by ReliveAI. Watch how our AI transforms raw memories into stunning cinematic stories.
            </p>
          </div>

          <div className="mx-auto max-w-6xl space-y-16">
            {/* Example 1: Vacation Memories */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-8 items-start"
            >
              <div className="space-y-4">
                <Card className="overflow-hidden border-border/50 shadow-elegant group relative">
                  <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-foreground border border-border/50">
                    Before
                  </div>
                  <img 
                    src={showcaseBefore1} 
                    alt="Raw vacation photos" 
                    className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Card>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">45 random vacation snapshots</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Card className="overflow-hidden border-primary/50 shadow-elegant shadow-primary/20 group relative">
                  <div className="absolute top-4 left-4 z-10 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-primary-foreground border border-primary">
                    After AI
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <img 
                    src={showcaseAfter1} 
                    alt="Cinematic vacation reel" 
                    className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-primary/90 backdrop-blur-sm rounded-full p-4">
                      <Play className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                </Card>
                <div className="text-center space-y-2">
                  <p className="text-sm text-foreground font-medium">30-second cinematic reel</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      Beat-synced
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      Color graded
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      Auto-edited
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Example 2: Travel Adventure */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid md:grid-cols-2 gap-8 items-start"
            >
              <div className="space-y-4">
                <Card className="overflow-hidden border-border/50 shadow-elegant group relative">
                  <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-foreground border border-border/50">
                    Before
                  </div>
                  <img 
                    src={showcaseBefore2} 
                    alt="Raw travel footage" 
                    className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Card>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Shaky phone videos & tourist shots</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Card className="overflow-hidden border-accent/50 shadow-elegant shadow-accent/20 group relative">
                  <div className="absolute top-4 left-4 z-10 bg-accent/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-accent-foreground border border-accent">
                    After AI
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <img 
                    src={showcaseAfter2} 
                    alt="Cinematic travel reel" 
                    className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-accent/90 backdrop-blur-sm rounded-full p-4">
                      <Play className="h-8 w-8 text-accent-foreground" />
                    </div>
                  </div>
                </Card>
                <div className="text-center space-y-2">
                  <p className="text-sm text-foreground font-medium">Stabilized cinematic journey</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-accent" />
                      Golden hour tones
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-accent" />
                      Smooth flow
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-accent" />
                      Pro editing
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Example 3: Celebration */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid md:grid-cols-2 gap-8 items-start"
            >
              <div className="space-y-4">
                <Card className="overflow-hidden border-border/50 shadow-elegant group relative">
                  <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-foreground border border-border/50">
                    Before
                  </div>
                  <img 
                    src={showcaseBefore3} 
                    alt="Raw celebration footage" 
                    className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Card>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Unedited birthday party clips</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Card className="overflow-hidden border-primary/50 shadow-elegant shadow-primary/20 group relative">
                  <div className="absolute top-4 left-4 z-10 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-primary-foreground border border-primary">
                    After AI
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <img 
                    src={showcaseAfter3} 
                    alt="Cinematic celebration reel" 
                    className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-primary/90 backdrop-blur-sm rounded-full p-4">
                      <Play className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                </Card>
                <div className="text-center space-y-2">
                  <p className="text-sm text-foreground font-medium">Emotional celebration story</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      Best moments
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      Vibrant colors
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      Perfect timing
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Button 
              size="lg" 
              variant="hero"
              onClick={() => navigate('/create')}
            >
              <Upload className="mr-2 h-5 w-5" />
              Create Your Own Reel
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-32 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to know about ReliveAI
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {/* Video Formats */}
              <AccordionItem value="formats" className="border border-border/50 rounded-lg px-6 bg-card/30">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary hover:no-underline">
                  What video and photo formats do you support?
                </AccordionTrigger>
                <AccordionContent asChild>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    ReliveAI supports all common formats including MP4, MOV, AVI, WEBM for videos, and JPG, PNG, HEIC, 
                    WEBP for images. We automatically handle any resolution from smartphone clips to 4K footage. The final 
                    reel is exported as a high-quality MP4 optimized for social media platforms in vertical (9:16) format, 
                    perfect for Instagram Reels, TikTok, and YouTube Shorts.
                  </motion.div>
                </AccordionContent>
              </AccordionItem>

              {/* Processing Time */}
              <AccordionItem value="processing" className="border border-border/50 rounded-lg px-6 bg-card/30">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary hover:no-underline">
                  How long does it take to create a reel?
                </AccordionTrigger>
                <AccordionContent asChild>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    Most reels are ready in under 30 seconds! Processing time depends on the number and size of files you 
                    upload. For example, 10-20 photos and short clips typically process in 15-30 seconds. Larger batches 
                    (50+ files) or longer videos may take 1-2 minutes. Our AI works in real-time, so you'll see progress 
                    updates throughout the creation process.
                  </motion.div>
                </AccordionContent>
              </AccordionItem>

              {/* AI Capabilities */}
              <AccordionItem value="ai-features" className="border border-border/50 rounded-lg px-6 bg-card/30">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary hover:no-underline">
                  What exactly does the AI do?
                </AccordionTrigger>
                <AccordionContent asChild>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    <p className="mb-4">Our AI performs multiple sophisticated tasks automatically:</p>
                    <ul className="space-y-3 mb-4">
                      <li className="flex gap-3">
                        <span className="font-semibold text-foreground flex-shrink-0">1.</span>
                        <span><strong className="text-foreground">Content Analysis</strong> - Identifies faces, emotions, action, and visual quality in every frame.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-foreground flex-shrink-0">2.</span>
                        <span><strong className="text-foreground">Beat Detection</strong> - Analyzes your music track and detects rhythm patterns.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-foreground flex-shrink-0">3.</span>
                        <span><strong className="text-foreground">Smart Editing</strong> - Selects the best moments and times cuts precisely to music beats.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-foreground flex-shrink-0">4.</span>
                        <span><strong className="text-foreground">Cinematic Grading</strong> - Applies professional color correction, mood enhancement, and film-grade effects.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-foreground flex-shrink-0">5.</span>
                        <span><strong className="text-foreground">Scene Flow</strong> - Creates smooth transitions and ensures narrative coherence.</span>
                      </li>
                    </ul>
                    <p>All of this happens automatically with zero manual editing required.</p>
                  </motion.div>
                </AccordionContent>
              </AccordionItem>

              {/* Customization */}
              <AccordionItem value="customization" className="border border-border/50 rounded-lg px-6 bg-card/30">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary hover:no-underline">
                  Can I customize the AI's output?
                </AccordionTrigger>
                <AccordionContent asChild>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    Yes! While ReliveAI is designed for fully automatic creation, you have control over key aspects. You can 
                    choose your own music track, select which files to include, and adjust the overall style and mood. Future 
                    updates will include more granular controls like manual clip reordering, custom transitions, and text 
                    overlay options. However, the core AI decisions (frame selection, beat-sync, grading) are optimized for 
                    best results.
                  </motion.div>
                </AccordionContent>
              </AccordionItem>

              {/* Pricing */}
              <AccordionItem value="pricing" className="border border-border/50 rounded-lg px-6 bg-card/30">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary hover:no-underline">
                  How much does ReliveAI cost?
                </AccordionTrigger>
                <AccordionContent asChild>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    ReliveAI offers a <strong>free tier</strong> that lets you create your first reels with watermarks to test 
                    the platform. Our <strong>Pro plan</strong> ($9.99/month) includes unlimited reels, no watermarks, priority 
                    processing, and access to premium AI features. <strong>Business plans</strong> are available for teams and 
                    agencies with volume discounts and API access. No credit card is required to start with the free tier—just 
                    sign up and create your first reel immediately.
                  </motion.div>
                </AccordionContent>
              </AccordionItem>

              {/* Music Copyright */}
              <AccordionItem value="music" className="border border-border/50 rounded-lg px-6 bg-card/30">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary hover:no-underline">
                  What about music copyright?
                </AccordionTrigger>
                <AccordionContent asChild>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    You can upload any music track for personal use. However, we recommend using royalty-free music or tracks 
                    you have rights to if you plan to share your reels publicly on social media. ReliveAI also offers a library 
                    of licensed, copyright-free music tracks perfect for social media sharing. These tracks are pre-cleared for 
                    commercial use on platforms like Instagram, TikTok, and YouTube.
                  </motion.div>
                </AccordionContent>
              </AccordionItem>

              {/* Data Privacy */}
              <AccordionItem value="privacy" className="border border-border/50 rounded-lg px-6 bg-card/30">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary hover:no-underline">
                  Is my content private and secure?
                </AccordionTrigger>
                <AccordionContent asChild>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    Absolutely. Your photos and videos are encrypted during upload and processing. We never share, sell, or use 
                    your content for any purpose other than creating your reels. All files are stored securely and automatically 
                    deleted after 30 days unless you choose to save them in your account. You can delete your content at any time 
                    from your dashboard. We're GDPR compliant and take data privacy seriously.
                  </motion.div>
                </AccordionContent>
              </AccordionItem>

              {/* Quality */}
              <AccordionItem value="quality" className="border border-border/50 rounded-lg px-6 bg-card/30">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary hover:no-underline">
                  What quality is the final reel?
                </AccordionTrigger>
                <AccordionContent asChild>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    Final reels are exported in 1080p HD (1920x1080 vertical) at 30fps with high-bitrate encoding optimized 
                    for social media. Pro users can export in up to 4K resolution (2160x3840). We use advanced compression 
                    techniques that maintain visual quality while keeping file sizes manageable for easy sharing and fast uploads 
                    to social platforms.
                  </motion.div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* CTA after FAQ */}
            <Card className="mt-16 bg-gradient-card border-border/50 p-8 text-center shadow-elegant">
              <p className="text-lg text-foreground mb-4">
                Still have questions?
              </p>
              <p className="text-muted-foreground mb-6">
                Our support team is here to help you create amazing reels
              </p>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/create')}
              >
                Get Started Now
              </Button>
            </Card>
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