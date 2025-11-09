import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Video Reel Creator! 🎬",
    description: "Let's take a quick tour to help you create amazing video reels in minutes.",
  },
  {
    id: "upload",
    title: "Upload Your Media 📸",
    description: "Start by uploading your photos and videos. You can drag & drop or click to browse.",
  },
  {
    id: "templates",
    title: "Choose a Template ✨",
    description: "Select from pre-designed templates to match your video's mood and style.",
  },
  {
    id: "customize",
    title: "Customize Your Reel 🎨",
    description: "Add transitions, adjust timing, and personalize your video on the timeline.",
  },
  {
    id: "share",
    title: "Share Your Creation 🚀",
    description: "Once your video is ready, download it or share it directly with friends!",
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
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  useEffect(() => {
    const checkTutorialStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_tutorial_progress')
        .select('is_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      // Show tutorial if user hasn't completed it
      if (!data || !data.is_completed) {
        setIsVisible(true);
      }
    };

    checkTutorialStatus();
  }, []);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg p-6 mx-4 shadow-2xl">
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
  );
};
