import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, MoveRight, ZoomIn, Minus } from "lucide-react";

interface TransitionSelectorProps {
  selectedClipId: string | null;
  currentTransition: "fade" | "slide" | "zoom" | "none";
  onTransitionChange: (transition: "fade" | "slide" | "zoom" | "none") => void;
}

export const TransitionSelector = ({
  selectedClipId,
  currentTransition,
  onTransitionChange,
}: TransitionSelectorProps) => {
  const transitions = [
    { 
      value: "fade" as const, 
      label: "Fade", 
      icon: Zap, 
      description: "Smooth cross-fade",
      color: "bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary"
    },
    { 
      value: "slide" as const, 
      label: "Slide", 
      icon: MoveRight, 
      description: "Directional slide",
      color: "bg-secondary/10 hover:bg-secondary/20 border-secondary/30 text-secondary"
    },
    { 
      value: "zoom" as const, 
      label: "Zoom", 
      icon: ZoomIn, 
      description: "Scale transition",
      color: "bg-accent/10 hover:bg-accent/20 border-accent/30 text-accent"
    },
    { 
      value: "none" as const, 
      label: "None", 
      icon: Minus, 
      description: "Hard cut",
      color: "bg-muted/10 hover:bg-muted/20 border-muted/30 text-muted-foreground"
    },
  ];

  if (!selectedClipId) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-sm">
        <div className="text-center text-muted-foreground py-8">
          <p className="text-sm">Select a clip to customize its transition</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Transition Type</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how this clip transitions to the next
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {transitions.map((transition) => {
          const Icon = transition.icon;
          const isSelected = currentTransition === transition.value;
          
          return (
            <Button
              key={transition.value}
              variant="outline"
              className={`h-auto flex-col gap-2 p-4 transition-all ${
                isSelected 
                  ? `${transition.color} border-2 shadow-elegant` 
                  : "border hover:shadow-md"
              }`}
              onClick={() => onTransitionChange(transition.value)}
            >
              <Icon className={`h-6 w-6 ${isSelected ? '' : 'text-muted-foreground'}`} />
              <div className="text-center">
                <div className="font-medium">{transition.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {transition.description}
                </div>
              </div>
              {isSelected && (
                <Badge variant="secondary" className="text-xs mt-1">
                  Active
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Transitions are applied between the current clip and the next one. 
          The last clip's transition setting is ignored.
        </p>
      </div>
    </Card>
  );
};
