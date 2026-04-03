import Link from 'next/link';
export default function DsalOnboardingStep3IdeFramework() {
  return (
    <>
      {/* 
        Warning: This is an auto-generated JSX file from HTML. 
      */}
      

<div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-40">
<div className="perspective-grid w-[3840px] h-[2160px] absolute -top-[540px] animate-pulse-fast"></div>

<div className="absolute w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
</div>

<nav className="relative z-50 w-full px-8 py-6 flex justify-between items-center">
<div className="flex items-center gap-2">
<div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
<span className="text-white font-bold tracking-widest text-sm uppercase opacity-80">DSAL Platform</span>
</div>
<div className="flex items-center gap-4">
<span className="text-white/40 text-sm">Onboarding</span>
<div className="flex gap-1">
<div className="w-8 h-1 bg-primary/30 rounded-full"></div>
<div className="w-8 h-1 bg-primary/30 rounded-full"></div>
<div className="w-8 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(164,19,236,0.8)]"></div>
</div>
<span className="text-white font-medium text-sm">Step 3 of 3</span>
</div>
</nav>

<main className="relative z-10 flex-grow flex flex-col items-center justify-center">

<div className="relative w-full max-w-5xl h-[450px] flex items-center justify-center mb-8 animate-float">

<svg className="absolute w-full h-full pointer-events-none" >
<defs>
<linearGradient id="beamGradient" x1="0%" x2="100%" y1="0%" y2="0%">
<stop offset="0%" ></stop>
<stop offset="50%" ></stop>
<stop offset="100%" ></stop>
</linearGradient>
</defs>

<path className="animate-beam" d="M350 225 L 500 225 L 650 225" stroke="url(#beamGradient)" strokeDasharray="4 4" strokeWidth="2" />
</svg>

<div className="flex items-center justify-center gap-6 perspective-[1200px] group">

<div className="relative w-48 h-64 glass-panel rounded-xl transform rotate-y-12 transition-all duration-500 group-hover:rotate-y-6 group-hover:scale-105 flex flex-col p-4 border-l-4 border-primary/50">
<div className="absolute -top-10 left-0 w-full text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
<span className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded">SOURCE_VIEW</span>
</div>
<div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
<span className="material-icons-outlined text-white/60 text-sm">code</span>
<span className="text-xs text-white/80 font-mono">main.dsal</span>
</div>
<div className="space-y-2">
<div className="h-1.5 w-3/4 bg-primary/40 rounded-full"></div>
<div className="h-1.5 w-1/2 bg-white/10 rounded-full"></div>
<div className="h-1.5 w-5/6 bg-white/10 rounded-full"></div>
<div className="h-1.5 w-2/3 bg-white/10 rounded-full"></div>
<div className="h-1.5 w-1/3 bg-primary/20 rounded-full ml-4"></div>
<div className="h-1.5 w-1/2 bg-white/10 rounded-full ml-4"></div>
</div>
</div>

<div className="relative w-64 h-80 glass-panel rounded-xl transform translate-z-12 transition-all duration-500 group-hover:scale-110 z-20 flex flex-col overflow-hidden border-t-4 border-primary">
<div className="absolute -top-12 left-0 w-full text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
<span className="text-xs text-white font-mono bg-primary px-3 py-1 rounded shadow-lg shadow-primary/50">SIMULATION_CORE</span>
</div>

<div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>

<div className="flex-1 p-4 relative flex items-center justify-center">
<div className="w-24 h-24 rounded-full border border-primary/30 flex items-center justify-center animate-[spin_10s_linear_infinite]">
<div className="w-16 h-16 rounded-full border border-primary/60 border-dashed animate-[spin_5s_linear_infinite_reverse]"></div>
</div>
<div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></div>
</div>
<div className="h-12 border-t border-white/10 bg-black/20 backdrop-blur-md flex justify-between items-center px-4">
<span className="text-[10px] font-mono text-primary animate-pulse">Running...</span>
<div className="flex gap-1">
<div className="w-1 h-1 bg-white/50 rounded-full"></div>
<div className="w-1 h-1 bg-white/50 rounded-full"></div>
<div className="w-1 h-1 bg-white/50 rounded-full"></div>
</div>
</div>
</div>

<div className="relative w-48 h-64 glass-panel rounded-xl transform -rotate-y-12 transition-all duration-500 group-hover:-rotate-y-6 group-hover:scale-105 flex flex-col p-4 border-r-4 border-primary/50">
<div className="absolute -top-10 left-0 w-full text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
<span className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded">MEMORY_STATE</span>
</div>
<div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
<span className="material-icons-outlined text-white/60 text-sm">memory</span>
<span className="text-xs text-white/80 font-mono">0x004F2A</span>
</div>
<div className="grid grid-cols-4 gap-1.5">

<div className="h-6 bg-primary/60 rounded text-[8px] flex items-center justify-center font-mono text-white">FF</div>
<div className="h-6 bg-white/5 rounded text-[8px] flex items-center justify-center font-mono text-white/30">00</div>
<div className="h-6 bg-white/5 rounded text-[8px] flex items-center justify-center font-mono text-white/30">A1</div>
<div className="h-6 bg-primary/30 rounded text-[8px] flex items-center justify-center font-mono text-white">4C</div>
<div className="h-6 bg-white/5 rounded text-[8px] flex items-center justify-center font-mono text-white/30">1B</div>
<div className="h-6 bg-white/5 rounded text-[8px] flex items-center justify-center font-mono text-white/30">00</div>
<div className="h-6 bg-primary/50 rounded text-[8px] flex items-center justify-center font-mono text-white">E2</div>
<div className="h-6 bg-white/5 rounded text-[8px] flex items-center justify-center font-mono text-white/30">00</div>
<div className="h-6 bg-white/5 rounded text-[8px] flex items-center justify-center font-mono text-white/30">99</div>
<div className="h-6 bg-white/5 rounded text-[8px] flex items-center justify-center font-mono text-white/30">00</div>
<div className="h-6 bg-white/5 rounded text-[8px] flex items-center justify-center font-mono text-white/30">00</div>
<div className="h-6 bg-primary/20 rounded text-[8px] flex items-center justify-center font-mono text-white">1A</div>
</div>
</div>
</div>
</div>

<div className="relative z-20 glass-panel rounded-2xl max-w-2xl w-full p-8 text-center neon-glow mx-4">
<h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                Multi-Context <span className="text-primary">IDE</span>
</h1>
<p className="text-lg text-gray-300 font-light mb-8 max-w-lg mx-auto leading-relaxed">
                See the code, the visual logic, and the raw memory state simultaneously. Total transparency for deep research.
            </p>
<Link href="/dashboard/research" className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-primary rounded-lg hover:bg-opacity-90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-gray-900 shadow-[0_0_20px_rgba(164,19,236,0.6)] animate-pulse hover:animate-none">
<span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
<span className="relative flex items-center gap-2">
                    ENTER LABORATORY
                    <span className="material-icons-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
</span>

<div className="absolute inset-0 rounded-lg ring-2 ring-white/20 group-hover:ring-white/40"></div>
</Link>
</div>
</main>

<footer className="relative z-50 w-full py-4 px-8 border-t border-white/5 bg-background-dark/80 backdrop-blur-sm flex justify-between items-center text-xs text-gray-500 font-mono">
<div className="flex gap-6">
<span className="flex items-center gap-2">
<span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                System Ready
            </span>
<span className="flex items-center gap-2">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                Grid Active
            </span>
</div>
<div>
            SESSION_ID: <span className="text-gray-400">DSAL_003_ALPHA</span>
</div>
</footer>

    </>
  );
}
