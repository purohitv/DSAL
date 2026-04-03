import { create } from 'zustand';

export interface CallStackFrame {
  id: string;
  functionName: string;
  line: number;
  fileName: string;
}

export interface Variable {
  name: string;
  value: string | number | boolean | null;
  type: string;
}

export interface MemoryFrame {
  callStack: CallStackFrame[];
  variables: Variable[];
  heap: any; // Can be more specific depending on the data structure
  output: string[];
  activeLine: number;
  description: string;
}

interface TimelineState {
  frames: MemoryFrame[];
  currentFrameIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  
  // Actions
  setFrames: (frames: MemoryFrame[]) => void;
  nextFrame: () => void;
  prevFrame: () => void;
  goToFrame: (index: number) => void;
  togglePlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;
  reset: () => void;
  appendFrames: (newFrames: MemoryFrame[]) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  frames: [],
  currentFrameIndex: 0,
  isPlaying: false,
  playbackSpeed: 1,

  setFrames: (frames) => set({ frames, currentFrameIndex: 0, isPlaying: false }),
  
  nextFrame: () => {
    const { currentFrameIndex, frames } = get();
    if (currentFrameIndex < frames.length - 1) {
      set({ currentFrameIndex: currentFrameIndex + 1 });
    } else {
      set({ isPlaying: false });
    }
  },
  
  prevFrame: () => {
    const { currentFrameIndex } = get();
    if (currentFrameIndex > 0) {
      set({ currentFrameIndex: currentFrameIndex - 1 });
    }
  },
  
  goToFrame: (index) => {
    const { frames } = get();
    if (index >= 0 && index < frames.length) {
      set({ currentFrameIndex: index });
    }
  },
  
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  
  reset: () => set({ currentFrameIndex: 0, isPlaying: false }),
  appendFrames: (newFrames) => set((state) => ({ frames: [...state.frames, ...newFrames] })),
}));
