import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Scissors, Sparkles, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface BeatMarker {
  time: number;
  intensity: number;
}

interface TimelineClip {
  id: string;
  thumbnail: string;
  startTime: number;
  duration: number;
  transition: "fade" | "slide" | "zoom" | "none";
}

interface TimelineProps {
  duration: number;
  beats?: BeatMarker[];
  clips?: TimelineClip[];
  currentTime?: number;
  onClipsReorder?: (clips: TimelineClip[]) => void;
}

interface SortableClipProps {
  clip: TimelineClip;
  index: number;
  selected: boolean;
  onSelect: () => void;
  getTransitionIcon: (transition: string) => string;
  getTransitionColor: (transition: string) => string;
}

const SortableClip = ({ 
  clip, 
  index, 
  selected, 
  onSelect, 
  getTransitionIcon, 
  getTransitionColor 
}: SortableClipProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: clip.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`h-20 min-w-[100px] cursor-move overflow-hidden rounded-lg border-2 transition-all hover:border-primary hover:shadow-elegant ${
        selected ? "border-primary shadow-glow" : "border-border/50"
      }`}
      onClick={onSelect}
    >
      <div className="h-full w-full bg-gradient-card relative group">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1 left-1 z-10 rounded bg-background/80 p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
          <div className="text-center">
            <div className="text-xs font-mono text-foreground/80">
              Clip {index + 1}
            </div>
            {clip.transition !== "none" && (
              <Badge className={`mt-1 text-xs ${getTransitionColor(clip.transition)}`}>
                {getTransitionIcon(clip.transition)} {clip.transition}
              </Badge>
            )}
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center pointer-events-none">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
};

export const Timeline = ({ 
  duration, 
  beats = [], 
  clips = [], 
  currentTime = 0,
  onClipsReorder 
}: TimelineProps) => {
  const [hoveredBeat, setHoveredBeat] = useState<number | null>(null);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [orderedClips, setOrderedClips] = useState<TimelineClip[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Generate mock data if not provided
  const mockBeats = beats.length === 0 
    ? Array.from({ length: 20 }, (_, i) => ({
        time: (i + 1) * (duration / 20),
        intensity: Math.random() * 0.5 + 0.5,
      }))
    : beats;

  const mockClips = clips.length === 0
    ? Array.from({ length: 8 }, (_, i) => ({
        id: `clip-${i}`,
        thumbnail: "/placeholder.svg",
        startTime: i * (duration / 8),
        duration: duration / 8,
        transition: ["fade", "slide", "zoom", "none"][Math.floor(Math.random() * 4)] as TimelineClip["transition"],
      }))
    : clips;

  // Initialize ordered clips when mockClips changes
  useState(() => {
    setOrderedClips(mockClips);
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedClips((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Recalculate startTime for each clip based on new order
        const clipDuration = duration / newOrder.length;
        const reorderedClips = newOrder.map((clip, index) => ({
          ...clip,
          startTime: index * clipDuration,
        }));

        // Notify parent component if callback provided
        if (onClipsReorder) {
          onClipsReorder(reorderedClips);
        }

        return reorderedClips;
      });
    }
  };

  const getTransitionIcon = (transition: string) => {
    switch (transition) {
      case "fade": return "⚡";
      case "slide": return "➡️";
      case "zoom": return "🔍";
      default: return "";
    }
  };

  const getTransitionColor = (transition: string) => {
    switch (transition) {
      case "fade": return "bg-primary/20 text-primary";
      case "slide": return "bg-secondary/20 text-secondary";
      case "zoom": return "bg-accent/20 text-accent";
      default: return "bg-muted/20 text-muted-foreground";
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Beat Timeline</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Music className="h-4 w-4" />
          <span>{mockBeats.length} beats detected</span>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="space-y-4">
        {/* Playhead and Time Markers */}
        <div className="relative h-8 rounded-lg bg-muted/30">
          {/* Time markers */}
          {Array.from({ length: 7 }).map((_, i) => {
            const time = (duration / 6) * i;
            return (
              <div
                key={i}
                className="absolute top-0 h-full flex items-center"
                style={{ left: `${(i / 6) * 100}%` }}
              >
                <div className="h-full w-px bg-border" />
                <span className="absolute top-full mt-1 -translate-x-1/2 text-xs text-muted-foreground">
                  {time.toFixed(1)}s
                </span>
              </div>
            );
          })}

          {/* Current time indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-glow transition-all duration-300"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-primary shadow-glow" />
          </div>
        </div>

        {/* Beat Markers */}
        <div className="relative h-16 rounded-lg bg-gradient-to-b from-muted/20 to-transparent">
          {mockBeats.map((beat, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 cursor-pointer transition-all hover:scale-y-110"
              style={{ left: `${(beat.time / duration) * 100}%` }}
              onMouseEnter={() => setHoveredBeat(i)}
              onMouseLeave={() => setHoveredBeat(null)}
            >
              <div
                className={`h-full w-1 rounded-full transition-all ${
                  hoveredBeat === i
                    ? "bg-primary shadow-glow"
                    : beat.intensity > 0.7
                    ? "bg-primary/80"
                    : "bg-primary/40"
                }`}
                style={{
                  height: `${beat.intensity * 100}%`,
                  minHeight: "30%",
                }}
              />
              {hoveredBeat === i && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-lg">
                  {beat.time.toFixed(2)}s
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Clips Timeline */}
        <div className="relative min-h-24 rounded-lg bg-muted/20 p-2">
          <div className="mb-2 text-xs text-muted-foreground">
            Drag clips to reorder • Click to select
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedClips.map(c => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex gap-2 overflow-x-auto pb-2">
                {orderedClips.map((clip, i) => (
                  <SortableClip
                    key={clip.id}
                    clip={clip}
                    index={i}
                    selected={selectedClip === clip.id}
                    onSelect={() => setSelectedClip(clip.id)}
                    getTransitionIcon={getTransitionIcon}
                    getTransitionColor={getTransitionColor}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span>Beat markers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gradient-card border border-border" />
            <span>Video clips</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="h-5 px-2 bg-primary/20 text-primary">⚡ fade</Badge>
            <Badge className="h-5 px-2 bg-secondary/20 text-secondary">➡️ slide</Badge>
            <Badge className="h-5 px-2 bg-accent/20 text-accent">🔍 zoom</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};
