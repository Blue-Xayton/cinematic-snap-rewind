import { useState } from 'react';
import { Button } from './ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { autoEdit } from '@/lib/autoEdit';
import { useEditorStore } from '@/stores/editorStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const AutoEditButton = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  
  const { clips, musicFile, addTextOverlay } = useEditorStore();

  const handleAutoEdit = async () => {
    if (clips.length === 0) {
      toast.error('Please upload some clips first');
      return;
    }

    setIsProcessing(true);
    toast.info('Starting auto-edit...');

    try {
      const result = await autoEdit(
        {
          clips: clips.map((c) => c.file),
          musicFile,
          targetDuration: 30,
        },
        (prog, stat) => {
          setProgress(prog);
          setStatus(stat);
        }
      );

      // Add generated text overlays
      result.textOverlays.forEach((overlay) => {
        addTextOverlay(overlay);
      });

      // Download the final video
      const url = URL.createObjectURL(result.finalVideo);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'auto-edited-reel.mp4';
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Auto-edit complete! Video downloaded.');
    } catch (error) {
      console.error('Auto-edit error:', error);
      toast.error('Auto-edit failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setStatus('');
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <Button
        onClick={handleAutoEdit}
        disabled={isProcessing || clips.length === 0}
        className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 transition-opacity shadow-glow"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {status || 'Processing...'}
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Auto Edit ✨
          </>
        )}
      </Button>
      
      {isProcessing && (
        <div className="absolute -bottom-8 left-0 right-0">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {progress.toFixed(0)}%
          </p>
        </div>
      )}
    </motion.div>
  );
};
