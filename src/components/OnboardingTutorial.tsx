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
    target: "input[type='file']",
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
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      // Cleanup highlights when component unmounts
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
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

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm" />
      
      {/* Tutorial card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card className="w-full max-w-lg p-6 shadow-2xl pointer-events-auto animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
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
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip Tutorial
            </Button>

            <Button onClick={handleNext} variant="hero">
              {currentStep === TUTORIAL_STEPS.length - 1 ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
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
          animation: pulse-highlight 2s infinite;
          box-shadow: 0 0 0 4px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.5) !important;
          border-radius: 8px;
        }
        
        @keyframes pulse-highlight {
          0%, 100% {
            box-shadow: 0 0 0 4px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.5);
          }
          50% {
            box-shadow: 0 0 0 8px hsl(var(--primary)), 0 0 30px hsl(var(--primary) / 0.7);
          }
        }
      `}</style>
    </>
  );
};
