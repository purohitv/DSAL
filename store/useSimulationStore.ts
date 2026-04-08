import { create } from 'zustand';

export interface ComplexityDataPoint {
  step: number;
  operations: number;
  memory: number;
}

interface SimulationState {
  currentStep: number;
  isPlaying: boolean;
  playbackSpeed: number;
  terminalOutput: string[];
  callStack: string[];
  variables: Record<string, any>;
  activeLine: number | null;
  complexityData: ComplexityDataPoint[];
  steps: any[];
  userCode: string;
  playgroundLanguage: string;
  
  // Actions
  setCurrentStep: (step: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  addTerminalOutput: (msg: string) => void;
  clearTerminal: () => void;
  setCallStack: (stack: string[]) => void;
  setVariables: (vars: Record<string, any>) => void;
  setActiveLine: (line: number | null) => void;
  setComplexityData: (data: ComplexityDataPoint[]) => void;
  setSteps: (steps: any[]) => void;
  setUserCode: (code: string) => void;
  setPlaygroundLanguage: (lang: string) => void;
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
  complexityData: [],
  steps: [],
  userCode: '',
  playgroundLanguage: 'javascript',

  setCurrentStep: (step) => set({ currentStep: step }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  addTerminalOutput: (msg) => set((state) => ({ terminalOutput: [...state.terminalOutput, msg] })),
  clearTerminal: () => set({ terminalOutput: [] }),
  setCallStack: (stack) => set({ callStack: stack }),
  setVariables: (vars) => set({ variables: vars }),
  setActiveLine: (line) => set({ activeLine: line }),
  setComplexityData: (data) => set({ complexityData: data }),
  setSteps: (steps) => set({ steps }),
  setUserCode: (code) => set({ userCode: code }),
  setPlaygroundLanguage: (lang) => set({ playgroundLanguage: lang }),
  reset: () => set({
    currentStep: 1,
    isPlaying: false,
    terminalOutput: [],
    callStack: [],
    variables: {},
    activeLine: null,
    complexityData: [],
    steps: [],
    userCode: '',
    playgroundLanguage: 'javascript',
  }),
}));
