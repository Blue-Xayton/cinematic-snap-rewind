import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Play, Pause } from 'lucide-react';

export const VideoPreview = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  
  const {
    clips,
    selectedClipId,
    currentTime,
    isPlaying,
    textOverlays,
    setCurrentTime,
    setIsPlaying,
  } = useEditorStore();

  const selectedClip = clips.find((c) => c.id === selectedClipId) || clips[currentClipIndex];

  useEffect(() => {
    if (!videoRef.current || !selectedClip) return;

    videoRef.current.src = URL.createObjectURL(selectedClip.file);
    videoRef.current.currentTime = selectedClip.trimStart;

    return () => {
      if (videoRef.current) {
        URL.revokeObjectURL(videoRef.current.src);
      }
    };
  }, [selectedClip]);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);

    // Apply filters to canvas
    applyFiltersToCanvas();
  };

  const applyFiltersToCanvas = () => {
    if (!videoRef.current || !canvasRef.current || !selectedClip) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Draw video frame
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Apply filters
    const { brightness, contrast, saturation } = selectedClip.filters;
    
    if (brightness !== 1 || contrast !== 1 || saturation !== 1) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Apply brightness
        data[i] *= brightness;
        data[i + 1] *= brightness;
        data[i + 2] *= brightness;

        // Apply contrast
        data[i] = ((data[i] / 255 - 0.5) * contrast + 0.5) * 255;
        data[i + 1] = ((data[i + 1] / 255 - 0.5) * contrast + 0.5) * 255;
        data[i + 2] = ((data[i + 2] / 255 - 0.5) * contrast + 0.5) * 255;

        // Apply saturation
        const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
        data[i] = gray + saturation * (data[i] - gray);
        data[i + 1] = gray + saturation * (data[i + 1] - gray);
        data[i + 2] = gray + saturation * (data[i + 2] - gray);
      }

      ctx.putImageData(imageData, 0, 0);
    }

    // Draw text overlays
    const activeOverlays = textOverlays.filter(
      (overlay) =>
        currentTime >= overlay.timestamp &&
        currentTime <= overlay.timestamp + overlay.duration
    );

    activeOverlays.forEach((overlay) => {
      ctx.font = `${overlay.style.fontSize}px ${overlay.style.fontFamily}`;
      ctx.fillStyle = overlay.style.color;
      ctx.textAlign = 'center';
      ctx.fillText(
        overlay.text,
        overlay.style.position.x * canvas.width,
        overlay.style.position.y * canvas.height
      );
    });
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (!selectedClip) {
    return (
      <Card className="w-full aspect-[9/16] flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">No clips to preview</p>
      </Card>
    );
  }

  return (
    <Card className="relative w-full aspect-[9/16] bg-black overflow-hidden">
      <video
        ref={videoRef}
        className="hidden"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
      />
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={togglePlayPause}
          className="rounded-full"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
      </div>
    </Card>
  );
};
