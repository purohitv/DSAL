import Link from 'next/link';
export default function DsalOnboardingStep1Welcome() {
  return (
    <>
      {/* 
        Warning: This is an auto-generated JSX file from HTML. 
      */}
      

<div className="absolute inset-0 z-0 overflow-hidden pointer-events-none perspective-container flex items-center justify-center">

<div className="absolute w-full h-[200%] top-[40%] grid-bg grid-floor opacity-30"></div>

<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[128px] opacity-20"></div>
<div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary rounded-full blur-[150px] opacity-10"></div>
</div>

<div className="absolute inset-0 z-0 pointer-events-none">
<div className="absolute top-[20%] left-[10%] w-1 h-1 bg-primary/60 rounded-full animate-pulse"></div>
<div className="absolute top-[40%] right-[20%] w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-700"></div>
<div className="absolute bottom-[30%] left-[30%] w-1 h-1 bg-primary/40 rounded-full animate-pulse delay-300"></div>
<div className="absolute top-[15%] right-[15%] w-2 h-2 bg-primary/20 rounded-full animate-pulse delay-1000"></div>
</div>

<main className="relative z-10 flex flex-col items-center justify-center h-full w-full p-6">

<div className="flex-1 flex items-center justify-center w-full max-w-4xl animate-float">
<div className="relative w-full aspect-square max-h-[648px] flex items-center justify-center holographic-glow">

<img alt="Holographic Neural Network" className="w-full h-full object-contain opacity-90 mix-blend-lighten" data-alt="Abstract 3D network nodes forming a brain shape in purple neon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiUiKzGEzNm3HJtnAOCjtsd7imQRhIAnTNwkeqcAV6CT3-VO94-tJ_cQJ1H5IRnsOcyIjlEUKVt3SUI5ijvHzh8YxHsYf_Rwnn8hC7k6I8_aVYjp2e847xN3YsczN8likcLzoc3mnNcnMYEES_mu4TIz5dGJBpXra72rxNbbr82qfkTZ5S2T_Zr5YDChwpACrJm-lw8WD9bL_h4CbV2Mql37Q9Nd2nJZrLRBxTZmlyMolsEop6mnopCXZfFVs0aCt7Yw_hhTAVf2hN"/>

<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/30 rounded-full blur-2xl"></div>
</div>
</div>

<div className="w-full max-w-2xl mt-auto mb-12">
<div className="glass-panel rounded-xl p-8 md:p-10 text-center relative overflow-hidden group transition-all duration-500 hover:border-primary/40">

<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70"></div>

<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs tracking-widest uppercase mb-6 font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    Step 01: The Logic Awakening
                </div>

<h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-primary/60">
                    Welcome to the Laboratory.
                </h1>

<p className="text-gray-400 text-lg md:text-xl font-light mb-10 max-w-lg mx-auto leading-relaxed">
                    DSAL isn't just a visualizer—it's a <span className="text-primary font-medium">Time Machine</span> for your code.
                </p>

<Link href="/onboarding/2" className="relative group inline-flex items-center justify-center px-8 py-4 bg-primary text-white rounded-lg font-medium text-lg transition-all duration-300 hover:bg-primary/90 hover:scale-105 active:scale-95 animate-pulse-glow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark">
<span className="relative z-10 flex items-center gap-2">
                        Next
                        <span className="material-icons text-xl transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
</span>
</Link>
</div>

<div className="text-center mt-6 opacity-40 hover:opacity-100 transition-opacity duration-300">
<p className="text-xs uppercase tracking-[0.2em] text-primary/80">Press Enter to Continue</p>
</div>
</div>
</main>

<header className="absolute top-0 left-0 w-full p-6 md:p-8 flex justify-between items-center z-20 pointer-events-none">

<div className="flex items-center gap-2 pointer-events-auto">
<div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-purple-900 flex items-center justify-center">
<span className="font-bold text-white text-sm">DS</span>
</div>
<span className="text-white/80 font-bold tracking-widest text-sm">DSAL</span>
</div>

<button className="text-sm text-gray-500 hover:text-white transition-colors uppercase tracking-widest pointer-events-auto">
            Skip Intro
        </button>
</header>

    </>
  );
}
