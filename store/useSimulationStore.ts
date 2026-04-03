import { create } from 'zustand';

interface SimulationState {
  currentStep: number;
  isPlaying: boolean;
  playbackSpeed: number;
  terminalOutput: string[];
  callStack: string[];
  variables: Record<string, any>;
  activeLine: number | null;
  
  // Actions
  setCurrentStep: (step: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  addTerminalOutput: (msg: string) => void;
  clearTerminal: () => void;
  setCallStack: (stack: string[]) => void;
  setVariables: (vars: Record<string, any>) => void;
  setActiveLine: (line: number | null) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  currentStep: 1,
  isPlaying: false,
  playbackSpeed: 1,
  terminalOutput: [],
  callStack: [],
  variables: {},
  activeLine: null,

  setCurrentStep: (step) => set({ currentStep: step }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  addTerminalOutput: (msg) => set((state) => ({ terminalOutput: [...state.terminalOutput, msg] })),
  clearTerminal: () => set({ terminalOutput: [] }),
  setCallStack: (stack) => set({ callStack: stack }),
  setVariables: (vars) => set({ variables: vars }),
  setActiveLine: (line) => set({ activeLine: line }),
  reset: () => set({
    currentStep: 1,
    isPlaying: false,
    terminalOutput: [],
    callStack: [],
    variables: {},
    activeLine: null,
  }),
}));
