import { create } from 'zustand';

export interface CallStackFrame {
  id: string;
  functionName: string;
  line: number;
}

export interface Variable {
  name: string;
  value: any;
  type: string;
}

export interface TimelineFrame {
  heap: Record<number, any>;
  variables: Variable[];
  callStack: CallStackFrame[];
  output: string[];
  activeLine: number;
  description: string;
}

interface TimelineStore {
  frames: TimelineFrame[];
  currentFrameIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  setFrames: (frames: TimelineFrame[]) => void;
  nextFrame: () => void;
  prevFrame: () => void;
  goToFrame: (index: number) => void;
  togglePlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;
}

export const useTimelineStore = create<TimelineStore>((set) => ({
  frames: [],
  currentFrameIndex: 0,
  isPlaying: false,
  playbackSpeed: 1,
  setFrames: (frames) => set({ frames, currentFrameIndex: 0 }),
  nextFrame: () => set((state) => ({ 
    currentFrameIndex: Math.min(state.currentFrameIndex + 1, state.frames.length - 1) 
  })),
  prevFrame: () => set((state) => ({ 
    currentFrameIndex: Math.max(state.currentFrameIndex - 1, 0) 
  })),
  goToFrame: (index) => set({ currentFrameIndex: index }),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
}));
