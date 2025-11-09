import { detectBeats, analyzeAudioMood } from './beatDetection';
import { selectBestClips, analyzeClip } from './clipAnalysis';
import { mergeVideos, addAudioToVideo, convertToVertical } from './ffmpeg';
import type { EditorClip, TextOverlay } from '@/stores/editorStore';

export interface AutoEditOptions {
  clips: File[];
  musicFile: File | null;
  targetDuration?: number;
}

export interface AutoEditResult {
  finalVideo: Blob;
  selectedClips: File[];
  structure: {
    intro: { start: number; end: number };
    body: { start: number; end: number };
    outro: { start: number; end: number };
  };
  textOverlays: TextOverlay[];
}

export const autoEdit = async (
  options: AutoEditOptions,
  onProgress?: (progress: number, status: string) => void
): Promise<AutoEditResult> => {
  const { clips, musicFile, targetDuration = 30 } = options;

  // Step 1: Analyze music
  onProgress?.(10, 'Analyzing music...');
  let beats: number[] = [];
  let tempo = 120;
  let mood: 'upbeat' | 'emotional' = 'emotional';

  if (musicFile) {
    const analysis = await detectBeats(musicFile);
    beats = analysis.beats;
    tempo = analysis.tempo;
    mood = analyzeAudioMood(tempo);
  }

  // Step 2: Select best clips
  onProgress?.(25, 'Analyzing clips...');
  const selectedClips = await selectBestClips(clips, targetDuration);

  // Step 3: Determine story structure
  onProgress?.(40, 'Creating story structure...');
  const introDuration = 3;
  const outroDuration = 3;
  const bodyDuration = targetDuration - introDuration - outroDuration;

  const structure = {
    intro: { start: 0, end: introDuration },
    body: { start: introDuration, end: introDuration + bodyDuration },
    outro: { start: introDuration + bodyDuration, end: targetDuration },
  };

  // Step 4: Create text overlays
  const textOverlays: TextOverlay[] = [
    {
      id: 'intro-text',
      text: 'My Story',
      timestamp: 0.5,
      duration: 2,
      style: {
        fontSize: 64,
        color: '#FFFFFF',
        fontFamily: 'Arial',
        position: { x: 0.5, y: 0.3 },
      },
    },
    {
      id: 'outro-text',
      text: '2025',
      timestamp: structure.outro.start + 0.5,
      duration: 2,
      style: {
        fontSize: 48,
        color: '#FFFFFF',
        fontFamily: 'Arial',
        position: { x: 0.5, y: 0.5 },
      },
    },
  ];

  // Step 5: Apply color grading based on mood
  onProgress?.(55, 'Applying filters...');
  // Filters will be applied during rendering

  // Step 6: Merge videos
  onProgress?.(70, 'Merging clips...');
  const mergedBlob = await mergeVideos(selectedClips);

  // Step 7: Add music
  let finalBlob = mergedBlob;
  if (musicFile) {
    onProgress?.(85, 'Adding music...');
    const mergedFile = new File([mergedBlob], 'merged.mp4', { type: 'video/mp4' });
    finalBlob = await addAudioToVideo(mergedFile, musicFile, 0.5);
  }

  // Step 8: Convert to vertical format
  onProgress?.(95, 'Converting to vertical format...');
  const finalFile = new File([finalBlob], 'final.mp4', { type: 'video/mp4' });
  const finalVideo = await convertToVertical(finalFile);

  onProgress?.(100, 'Complete!');

  return {
    finalVideo,
    selectedClips,
    structure,
    textOverlays,
  };
};

export const syncClipsToBeats = (
  clips: EditorClip[],
  beats: number[]
): EditorClip[] => {
  if (beats.length === 0) return clips;

  return clips.map((clip, index) => {
    // Assign clip to nearest beat
    const beatIndex = Math.min(index, beats.length - 1);
    const nextBeatIndex = Math.min(beatIndex + 1, beats.length - 1);
    
    const startTime = beats[beatIndex];
    const duration = beats[nextBeatIndex] - beats[beatIndex];

    return {
      ...clip,
      startTime,
      duration: Math.min(duration, clip.duration),
    };
  });
};
