import { useEffect } from 'react';
import { Timeline } from './Timeline';
import { useEditorStore } from '@/stores/editorStore';
import { Button } from './ui/button';
import { Trash2, Scissors } from 'lucide-react';
import { Card } from './ui/card';

export const EnhancedTimeline = () => {
  const {
    clips,
    selectedClipId,
    musicBeats,
    currentTime,
    selectClip,
    updateClip,
    removeClip,
    reorderClips,
  } = useEditorStore();

  // Convert editor clips to timeline format
  const timelineClips = clips.map((clip) => ({
    id: clip.id,
    thumbnail: clip.thumbnail,
    startTime: clip.startTime,
    duration: clip.duration,
    transition: clip.transition,
    originalDuration: clip.duration,
    trimStart: clip.trimStart,
    trimEnd: clip.trimEnd,
  }));

  // Convert beats to timeline format
  const timelineBeats = musicBeats.map((time) => ({
    time,
    intensity: 0.8,
  }));

  const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0);

  const handleClipsReorder = (reorderedClips: typeof timelineClips) => {
    const startIndex = clips.findIndex((c) => c.id === reorderedClips[0].id);
    const endIndex = clips.findIndex(
      (c) => c.id === reorderedClips[reorderedClips.length - 1].id
    );
    reorderClips(startIndex, endIndex);
  };

  const handleClipTrim = (clipId: string, trimStart: number, trimEnd: number) => {
    updateClip(clipId, { trimStart, trimEnd });
  };

  const handleDeleteClip = () => {
    if (selectedClipId) {
      removeClip(selectedClipId);
    }
  };

  const handleSplitClip = () => {
    if (!selectedClipId) return;
    
    const clip = clips.find((c) => c.id === selectedClipId);
    if (!clip) return;

    // Split at current time (placeholder - full implementation needed)
    console.log('Split clip at:', currentTime);
    // TODO: Implement actual split logic with FFmpeg
  };

  if (clips.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Upload clips to see them in the timeline
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Timeline
        duration={totalDuration || 30}
        beats={timelineBeats}
        clips={timelineClips}
        currentTime={currentTime}
        selectedClipId={selectedClipId}
        onClipSelect={selectClip}
        onClipsReorder={handleClipsReorder}
        onClipTrim={handleClipTrim}
      />

      {selectedClipId && (
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSplitClip}
          >
            <Scissors className="mr-2 h-4 w-4" />
            Split
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteClip}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};
