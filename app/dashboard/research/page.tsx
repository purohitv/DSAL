import Link from 'next/link';
export default function DsalResearchLabDashboard() {
  return (
    <>
      {/* 
        Warning: This is an auto-generated JSX file from HTML. 
      */}
      
<div className="flex min-h-[1080px] w-full">

<aside className="hidden md:flex w-20 lg:w-64 flex-col border-r border-white/5 bg-[#111818] z-20 transition-all duration-300">

<div className="p-6 flex items-center gap-3 border-b border-white/5">
<div className="relative shrink-0">
<div className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 ring-2 ring-primary/50" data-alt="Portrait of Dr. User" ></div>
<div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#111818]"></div>
</div>
<div className="hidden lg:flex flex-col overflow-hidden">
<h1 className="text-white text-sm font-bold truncate">Dr. User</h1>
<p className="text-primary text-xs truncate">Status: Optimal</p>
</div>
</div>

<nav className="flex-1 flex flex-col gap-2 p-4">
<Link className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary group transition-colors" href="/ide/bst/1">
<span className="material-symbols-outlined">science</span>
<span className="hidden lg:block text-sm font-medium">Experiments</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors group" href="#">
<span className="material-symbols-outlined">photo_camera</span>
<span className="hidden lg:block text-sm font-medium">Saved Snapshots</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors group" href="/library">
<span className="material-symbols-outlined">library_books</span>
<span className="hidden lg:block text-sm font-medium">Algo Library</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors group" href="/ide/quantum">
<span className="material-symbols-outlined">blur_on</span>
<span className="hidden lg:block text-sm font-medium">Quantum Lab</span>
</Link>
<div className="mt-auto">
<a className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors group" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="hidden lg:block text-sm font-medium">Settings</span>
</a>
</div>
</nav>
</aside>

<main className="flex-1 flex flex-col relative min-w-0">

<header className="flex items-center justify-between px-8 py-6 z-10">
<div>
<h2 className="text-2xl font-bold text-white tracking-tight">RESEARCH DASHBOARD</h2>
<p className="text-slate-400 text-sm">Reviewing active simulations and datasets.</p>
</div>
<div className="flex items-center gap-4">
<div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-mono text-primary border-primary/20">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
                        SERVER: ONLINE
                    </div>
<button className="glass-panel p-2 rounded-full hover:text-white text-slate-400 transition-colors">
<span className="material-symbols-outlined text-[20px]">notifications</span>
</button>
</div>
</header>

<div className="flex-1 overflow-y-auto px-8 pb-32">

<section className="mb-10">
<div className="flex items-center justify-between mb-4">
<h3 className="text-white text-lg font-bold tracking-wide flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-sm">history</span>
                            RECENT EXPERIMENTS
                        </h3>
<button className="text-xs text-primary hover:text-white transition-colors">View All</button>
</div>
<div className="flex gap-4 overflow-x-auto pb-4 snap-x">

<div className="glass-card min-w-[280px] w-[280px] rounded-2xl p-4 flex flex-col gap-3 snap-start relative group cursor-pointer overflow-hidden">
<div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
<span className="material-symbols-outlined text-white bg-black/50 rounded-full p-1 text-sm backdrop-blur-sm">play_arrow</span>
</div>
<div className="w-full aspect-video rounded-lg overflow-hidden relative">
<div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent"></div>
<img className="w-full h-full object-cover opacity-80" data-alt="Abstract red and black tree node visualization" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7OpIOHfoO67zRueaH4ULN1P7qVErkxLSt8eLizRMpLwwVWYScTXDBEYKrFZam43T-ciKuc_7Ozil1BXeofiz-hx93d_EQCVcwisGmjezNYLRFxntAiB6U_6guFgyDe9GGkaAnHXflHrL__0jbQSeFjnwXB9aRF5vaVwImwjeYnmiHsgtsh1xkCqEyFOSrOD0tYNi46PO2CpDbGsz4kd6CHj2fNfjNgqlE5gAotMjn5VnDoDQ2JkWrgkHnozzlimg9g41S684j6tVl"/>
<div className="absolute bottom-2 left-2 flex gap-2">
<span className="text-[10px] font-mono bg-black/60 text-primary px-2 py-0.5 rounded border border-primary/20">O(log n)</span>
</div>
</div>
<div>
<h4 className="text-white font-medium text-base truncate">RB Tree Balancing</h4>
<p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">schedule</span> 2h ago
                                </p>
</div>
</div>

<div className="glass-card min-w-[280px] w-[280px] rounded-2xl p-4 flex flex-col gap-3 snap-start relative group cursor-pointer">
<div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
<span className="material-symbols-outlined text-white bg-black/50 rounded-full p-1 text-sm backdrop-blur-sm">play_arrow</span>
</div>
<div className="w-full aspect-video rounded-lg overflow-hidden relative">
<div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent"></div>
<img className="w-full h-full object-cover opacity-80" data-alt="Cyberpunk style network graph nodes connection" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqvJ-6FlFSTSeKrowaWn7bnpbm0fyIF-qhYeAg4Uo0ww858EPrWJ3pITRDsKO0DnadMpcDRlA14MecccFfFCAPMt4KQoGnuSItohUcHdmKtQf_nI-hafiTlZnCU5lHITkdcKrhiKFOAteeLTnGWHebvXMT-IC_ZwHeBBxzHYG3FODHe6pFETF_ti3YSJIT-HmmxnvNJDb2UTgQU2cOyHpsXcb2LB6hISdHPShZuDUlk6CeLheYMRX5oirKZXnH-NPVQTxWBtGYDK16"/>
<div className="absolute bottom-2 left-2 flex gap-2">
<span className="text-[10px] font-mono bg-black/60 text-secondary px-2 py-0.5 rounded border border-secondary/20">O(E + V log V)</span>
</div>
</div>
<div>
<h4 className="text-white font-medium text-base truncate">Dijkstra Shortest Path</h4>
<p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">schedule</span> 5h ago
                                </p>
</div>
</div>

<div className="glass-card min-w-[280px] w-[280px] rounded-2xl p-4 flex flex-col gap-3 snap-start relative group cursor-pointer">
<div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
<span className="material-symbols-outlined text-white bg-black/50 rounded-full p-1 text-sm backdrop-blur-sm">play_arrow</span>
</div>
<div className="w-full aspect-video rounded-lg overflow-hidden relative">
<div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent"></div>
<img className="w-full h-full object-cover opacity-80" data-alt="Abstract data sorting columns visualization" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWx31t2K96AWzfIeynFw1k6fjQNBU-H7H8DdU8Ngg_iUFIvNunXn-VKqFfmSRBqYHjLB0VyJOudXchlch4ZciM6iq7uLWnqZPwLdGkm_nt8-r99EMpUpoQoRhXHagOT1DkL_YeOAdF0enZYT8g_EN6wkPEIVT3cpT17Y79hvVAZYzmdllovyiOIU3FgByRSOCXL6eHUu1KcyTU4QyFN6Z1rJgX9WKjQf4RoPILHbbyCMYyPLPXLTMEjf33BfNY1NPMmugMnI1j5HL2"/>
<div className="absolute bottom-2 left-2 flex gap-2">
<span className="text-[10px] font-mono bg-black/60 text-primary px-2 py-0.5 rounded border border-primary/20">O(n log n)</span>
</div>
</div>
<div>
<h4 className="text-white font-medium text-base truncate">Merge Sort Visualizer</h4>
<p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">schedule</span> 1d ago
                                </p>
</div>
</div>
</div>
</section>

<section>
<div className="flex items-center justify-between mb-4">
<h3 className="text-white text-lg font-bold tracking-wide flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-sm">folder_open</span>
                            RESEARCH WORKSPACE
                        </h3>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

<div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-48 relative overflow-hidden group cursor-pointer">
<div className="absolute -right-10 -top-10 h-32 w-32 bg-primary/20 blur-[50px] rounded-full group-hover:bg-primary/30 transition-colors"></div>
<div className="flex justify-between items-start z-10">
<div className="p-2.5 bg-white/5 rounded-lg border border-white/5 text-primary">
<span className="material-symbols-outlined">hub</span>
</div>
<span className="material-symbols-outlined text-slate-500">more_horiz</span>
</div>
<div className="z-10">
<h4 className="text-white text-xl font-semibold mb-1">Advanced Graph Theory</h4>
<p className="text-slate-400 text-sm">12 Active Experiments</p>
</div>
<div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden z-10">
<div className="bg-primary w-[75%] h-full rounded-full"></div>
</div>
</div>

<div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-48 relative overflow-hidden group cursor-pointer border-secondary/30">
<div className="absolute -right-10 -top-10 h-32 w-32 bg-secondary/20 blur-[50px] rounded-full group-hover:bg-secondary/30 transition-colors"></div>
<div className="flex justify-between items-start z-10">
<div className="p-2.5 bg-secondary/10 rounded-lg border border-secondary/20 text-secondary">
<span className="material-symbols-outlined">all_inclusive</span>
</div>
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/20 text-secondary border border-secondary/30">ACTIVE</span>
</div>
<div className="z-10">
<h4 className="text-white text-xl font-semibold mb-1">Quantum Search</h4>
<p className="text-slate-400 text-sm">Optimizing Grover's Algorithm</p>
</div>

<div className="flex -space-x-2 z-10 mt-2">
<img className="w-6 h-6 rounded-full border border-background-dark" data-alt="User Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFWZUVVyhWLq19Onchmw9aAFeLtg6n6S8UFTvTU7uJtXbbd2bgglmANJT0LQZo_Oja_LPN01geRHkCnxCOOO55ZY0c6W909I0e5AO1m6cmb2vka8JJS1mESPGjWbWLdv1ICzdfO-66aG59FCq5nrrPqlaPzKDGym2dBl4-78aOqpCH3BXvsSXv4FPu3cFyGokTsFk5xKls4quKXEPS2FM_Wsumda0PNkS4-aE_Uaewcu9pQBzBFr9x_dTi6AMjSYznyaPXvOvDUsNn"/>
<img className="w-6 h-6 rounded-full border border-background-dark" data-alt="Collaborator Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGYw58BpjoZ2d0bjVIQ_lQLHrw-UzTjKJSpdBZFTpWaGu8eW-E2cykCH5OsSkOuaf1CfiH7MQAOVJtFHej21PVF4SoBtdvgBy2wkAu7DOxeyk4EFX6WspHjhCqsWWbReu-KIeiy-slvceWEUakCTEHc_5We7_zy8GCxIcfVsB17g9esc1g276JXsoUlHKcfRu3MvHQvXkCrxy0ORszNlxhQ_Tvg5TFxPLUk2qNtfVjRz5H-ts69q-b_9SUrAKOjS_DOov2eDIEGC4F"/>
</div>
</div>

<div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-48 relative overflow-hidden group cursor-pointer">
<div className="absolute -right-10 -top-10 h-32 w-32 bg-blue-500/20 blur-[50px] rounded-full group-hover:bg-blue-500/30 transition-colors"></div>
<div className="flex justify-between items-start z-10">
<div className="p-2.5 bg-white/5 rounded-lg border border-white/5 text-blue-400">
<span className="material-symbols-outlined">segment</span>
</div>
<span className="material-symbols-outlined text-slate-500">more_horiz</span>
</div>
<div className="z-10">
<h4 className="text-white text-xl font-semibold mb-1">Dynamic Programming</h4>
<p className="text-slate-400 text-sm">Pattern Recognition Study</p>
</div>
<div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden z-10">
<div className="bg-blue-400 w-[30%] h-full rounded-full"></div>
</div>
</div>
</div>
</section>
</div>

<div className="absolute bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
<div className="pointer-events-auto glass-panel px-2 py-2 rounded-2xl flex gap-3 shadow-2xl shadow-black/50 border border-white/10">
<button className="bg-primary hover:bg-primary/90 text-background-dark font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(19,236,236,0.4)]">
<span className="material-symbols-outlined">add</span>
                        New Experiment
                    </button>
<div className="w-px bg-white/10 my-2"></div>
<button className="px-5 py-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors flex items-center gap-2">
<span className="material-symbols-outlined">terminal</span>
                        Open Terminal
                    </button>
<button className="px-3 py-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors">
<span className="material-symbols-outlined">search</span>
</button>
</div>
</div>
</main>

<aside className="w-80 border-l border-white/5 bg-[#111818] hidden xl:flex flex-col z-20">

<div className="p-6 border-b border-white/5">
<h3 className="text-white font-bold mb-6 flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-sm">insights</span>
                    LEARNING PROGRESS
                </h3>
<div className="space-y-6">

<div className="flex items-center gap-4">
<div className="relative h-12 w-12 flex items-center justify-center">
<svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
<path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
<path className="text-primary drop-shadow-[0_0_3px_rgba(19,236,236,0.8)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="80, 100" strokeLinecap="round" strokeWidth="3" />
</svg>
<span className="absolute text-[10px] font-bold text-white">80%</span>
</div>
<div>
<p className="text-white font-medium text-sm">Tree Structures</p>
<p className="text-slate-500 text-xs">Mastery Level: Expert</p>
</div>
</div>

<div className="flex items-center gap-4">
<div className="relative h-12 w-12 flex items-center justify-center">
<svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
<path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
<path className="text-secondary drop-shadow-[0_0_3px_rgba(168,85,247,0.8)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="45, 100" strokeLinecap="round" strokeWidth="3" />
</svg>
<span className="absolute text-[10px] font-bold text-white">45%</span>
</div>
<div>
<p className="text-white font-medium text-sm">Graph Theory</p>
<p className="text-slate-500 text-xs">Mastery Level: Intermediate</p>
</div>
</div>
</div>
</div>

<div className="flex-1 overflow-y-auto p-6">
<h3 className="text-white font-bold mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-slate-400 text-sm">list</span>
                    ACTIVITY FEED
                </h3>
<div className="relative border-l border-white/10 ml-2 space-y-6">
<div className="ml-6 relative">
<span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-[#111818]"></span>
<p className="text-slate-400 text-xs font-mono mb-1">10:42 AM</p>
<p className="text-white text-sm">Snapshot #402 saved in <span className="text-secondary">Quantum Search</span></p>
</div>
<div className="ml-6 relative">
<span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-slate-600 border-2 border-[#111818]"></span>
<p className="text-slate-400 text-xs font-mono mb-1">09:15 AM</p>
<p className="text-white text-sm">Algorithm "Merge Sort" complexity verified</p>
</div>
<div className="ml-6 relative">
<span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-slate-600 border-2 border-[#111818]"></span>
<p className="text-slate-400 text-xs font-mono mb-1">Yesterday</p>
<p className="text-white text-sm">New folder created: <span className="text-blue-400">Dynamic Programming</span></p>
</div>
<div className="ml-6 relative">
<span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-slate-600 border-2 border-[#111818]"></span>
<p className="text-slate-400 text-xs font-mono mb-1">2 days ago</p>
<p className="text-white text-sm">Exported data for "Binary Search"</p>
</div>
</div>
</div>

<div className="p-6 border-t border-white/5 bg-white/[0.02]">
<div className="flex items-center justify-between text-slate-400 text-xs font-mono">
<span>SYSTEM VER: 2.4.1</span>
<span className="h-2 w-2 rounded-full bg-green-500"></span>
</div>
</div>
</aside>
</div>

    </>
  );
}
