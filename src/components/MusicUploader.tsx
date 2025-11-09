import { useRef, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Music, Upload, Trash2, Loader2 } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { detectBeats } from '@/lib/beatDetection';
import { toast } from 'sonner';

export const MusicUploader = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { musicFile, setMusicFile, setMusicBeats, setMusicTempo } = useEditorStore();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file');
      return;
    }

    setIsAnalyzing(true);
    toast.info('Analyzing music...');

    try {
      const { beats, tempo } = await detectBeats(file);
      setMusicFile(file);
      setMusicBeats(beats);
      setMusicTempo(tempo);
      toast.success(`Music analyzed! Detected ${beats.length} beats at ${tempo} BPM`);
    } catch (error) {
      console.error('Error analyzing music:', error);
      toast.error('Failed to analyze music');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveMusic = () => {
    setMusicFile(null);
    setMusicBeats([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Music className="h-5 w-5" />
        <h3 className="font-semibold">Background Music</h3>
      </div>

      {!musicFile ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Music
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-muted rounded-md">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{musicFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(musicFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleRemoveMusic}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
