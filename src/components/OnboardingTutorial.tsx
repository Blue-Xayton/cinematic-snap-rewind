import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  route?: string; // Route to navigate to
  target?: string; // CSS selector for highlighting
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Video Reel Creator! 🎬",
    description: "Let's take a quick tour to help you create amazing video reels in minutes.",
    route: "/",
  },
  {
    id: "upload",
    title: "Upload Your Media 📸",
    description: "Start by uploading your photos and videos. You can drag & drop or click to browse.",
    route: "/create",
    target: "[data-tutorial='upload-area']",
  },
  {
    id: "templates",
    title: "Choose a Template ✨",
    description: "Select from pre-designed templates to match your video's mood and style.",
    route: "/create",
    target: "[data-tutorial='template-selector']",
  },
  {
    id: "customize",
    title: "Customize Your Reel 🎨",
    description: "Switch to custom mode to adjust mood, music, and duration settings.",
    route: "/create",
    target: "[data-tutorial='custom-settings']",
  },
  {
    id: "share",
    title: "Share Your Creation 🚀",
    description: "Once your video is ready, you can view it in your job list and share it with friends!",
    route: "/jobs",
  },
];

interface OnboardingTutorialProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export const OnboardingTutorial = ({ onComplete, onSkip }: OnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  useEffect(() => {
    const checkTutorialStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsVisible(false);
        return;
      }

      const { data } = await supabase
        .from('user_tutorial_progress')
        .select('is_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      // Show tutorial if user hasn't completed it
      if (!data || !data.is_completed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    checkTutorialStatus();

    // Listen for auth state changes to recheck for new users
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // Small delay to ensure profile is created
        setTimeout(checkTutorialStatus, 500);
      } else if (event === 'SIGNED_OUT') {
        setIsVisible(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Navigate to the route when step changes
  useEffect(() => {
    if (!isVisible) return;
    
    const step = TUTORIAL_STEPS[currentStep];
    if (step.route && location.pathname !== step.route) {
      navigate(step.route);
    }
  }, [currentStep, isVisible, navigate, location.pathname]);

  // Add spotlight effect to target element
  useEffect(() => {
    if (!isVisible) return;

    const step = TUTORIAL_STEPS[currentStep];
    if (!step.target) {
      // Remove any existing highlights
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });
      return;
    }

    // Wait for navigation to complete
    const timeout = setTimeout(() => {
      const element = document.querySelector(step.target);
      if (element) {
        // Remove previous highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
          el.classList.remove('tutorial-highlight');
        });
        
        // Add highlight to current element
        element.classList.add('tutorial-highlight');
        
        // Make element interactive (clickable)
        const originalPointerEvents = (element as HTMLElement).style.pointerEvents;
        (element as HTMLElement).style.pointerEvents = 'auto';
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Store original value to restore later
        (element as any)._originalPointerEvents = originalPointerEvents;
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      // Cleanup highlights when component unmounts
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
        // Restore original pointer events
        if ((el as any)._originalPointerEvents !== undefined) {
          (el as HTMLElement).style.pointerEvents = (el as any)._originalPointerEvents;
        }
      });
    };
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_tutorial_progress')
        .upsert({
          user_id: user.id,
          completed_steps: TUTORIAL_STEPS.map(s => s.id),
          is_completed: true,
        });
    }

    setIsVisible(false);
    toast({
      title: "Tutorial completed!",
      description: "You're all set to create amazing video reels.",
    });
    onComplete?.();
  };

  const handleSkip = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_tutorial_progress')
        .upsert({
          user_id: user.id,
          completed_steps: [],
          is_completed: true,
        });
    }

    setIsVisible(false);
    onSkip?.();
  };

  if (!isVisible) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const hasTarget = !!step.target;

  return (
    <>
      {/* Dark overlay - NO blur, with pointer-events-none to allow clicking through */}
      <div className="fixed inset-0 z-40 bg-black/60 pointer-events-none" />
      
      {/* Tutorial card */}
      <div className={`fixed z-50 pointer-events-none ${
        hasTarget 
          ? 'bottom-4 left-1/2 -translate-x-1/2 md:bottom-auto md:top-4 md:left-4 md:translate-x-0' 
          : 'inset-0 flex items-center justify-center'
      } p-4`}>
        <Card className="w-full max-w-lg p-6 shadow-2xl pointer-events-auto animate-scale-in relative">
          {/* Arrow pointer to highlighted element */}
          {hasTarget && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 md:hidden">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-border" />
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-card absolute -top-[11px] left-1/2 -translate-x-1/2" />
            </div>
          )}
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground font-medium">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <Progress value={progress} className="mb-6" />

          {/* Content */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {step.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {step.description}
            </p>
            {hasTarget && (
              <p className="text-sm text-primary font-medium mt-3 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                Try clicking the highlighted area below!
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground text-sm"
              size="sm"
            >
              Skip
            </Button>

            <Button onClick={handleNext} variant="hero" size="sm">
              {currentStep === TUTORIAL_STEPS.length - 1 ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Done
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Tutorial highlight styles */}
      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 45 !important;
          animation: pulse-glow 2s infinite;
          pointer-events: auto !important;
        }
        
        .tutorial-highlight::before {
          content: '';
          position: absolute;
          inset: -4px;
          background: hsl(var(--background));
          border: 3px solid hsl(var(--primary));
          border-radius: 12px;
          z-index: -1;
          pointer-events: none;
        }
        
        .tutorial-highlight::after {
          content: '👆 Click here';
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          animation: bounce 2s infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            filter: drop-shadow(0 0 8px hsl(var(--primary) / 0.6));
          }
          50% {
            filter: drop-shadow(0 0 20px hsl(var(--primary) / 0.9));
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(-5px);
          }
        }
      `}</style>
    </>
  );
};
