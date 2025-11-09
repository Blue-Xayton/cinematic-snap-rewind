import { create } from 'zustand';

export interface EditorClip {
  id: string;
  file: File;
  thumbnail: string;
  duration: number;
  startTime: number;
  trimStart: number;
  trimEnd: number;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
  transition: 'fade' | 'slide' | 'zoom' | 'none';
}

export interface TextOverlay {
  id: string;
  text: string;
  timestamp: number;
  duration: number;
  style: {
    fontSize: number;
    color: string;
    fontFamily: string;
    position: { x: number; y: number };
  };
}

interface EditorState {
  clips: EditorClip[];
  selectedClipId: string | null;
  musicFile: File | null;
  musicBeats: number[];
  musicTempo: number;
  textOverlays: TextOverlay[];
  currentTime: number;
  isPlaying: boolean;
  projectName: string;
  
  // Actions
  addClip: (clip: EditorClip) => void;
  removeClip: (id: string) => void;
  updateClip: (id: string, updates: Partial<EditorClip>) => void;
  reorderClips: (startIndex: number, endIndex: number) => void;
  selectClip: (id: string | null) => void;
  setMusicFile: (file: File | null) => void;
  setMusicBeats: (beats: number[]) => void;
  setMusicTempo: (tempo: number) => void;
  addTextOverlay: (overlay: TextOverlay) => void;
  removeTextOverlay: (id: string) => void;
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setProjectName: (name: string) => void;
  clearProject: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  clips: [],
  selectedClipId: null,
  musicFile: null,
  musicBeats: [],
  musicTempo: 120,
  textOverlays: [],
  currentTime: 0,
  isPlaying: false,
  projectName: 'Untitled Project',

  addClip: (clip) =>
    set((state) => ({
      clips: [...state.clips, clip],
    })),

  removeClip: (id) =>
    set((state) => ({
      clips: state.clips.filter((c) => c.id !== id),
      selectedClipId: state.selectedClipId === id ? null : state.selectedClipId,
    })),

  updateClip: (id, updates) =>
    set((state) => ({
      clips: state.clips.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  reorderClips: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.clips);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { clips: result };
    }),

  selectClip: (id) => set({ selectedClipId: id }),

  setMusicFile: (file) => set({ musicFile: file }),

  setMusicBeats: (beats) => set({ musicBeats: beats }),

  setMusicTempo: (tempo) => set({ musicTempo: tempo }),

  addTextOverlay: (overlay) =>
    set((state) => ({
      textOverlays: [...state.textOverlays, overlay],
    })),

  removeTextOverlay: (id) =>
    set((state) => ({
      textOverlays: state.textOverlays.filter((t) => t.id !== id),
    })),

  updateTextOverlay: (id, updates) =>
    set((state) => ({
      textOverlays: state.textOverlays.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  setCurrentTime: (time) => set({ currentTime: time }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setProjectName: (name) => set({ projectName: name }),

  clearProject: () =>
    set({
      clips: [],
      selectedClipId: null,
      musicFile: null,
      musicBeats: [],
      musicTempo: 120,
      textOverlays: [],
      currentTime: 0,
      isPlaying: false,
      projectName: 'Untitled Project',
    }),
}));
