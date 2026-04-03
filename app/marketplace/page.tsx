import Link from 'next/link';
export default function DsalPluginVisualizerMarketplace() {
  return (
    <>
      {/* 
        Warning: This is an auto-generated JSX file from HTML. 
      */}
      

<header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-border-dark px-6 py-3 bg-white dark:bg-[#111817] z-20">
<div className="flex items-center gap-4 text-slate-900 dark:text-white">
<div className="size-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
<span className="material-symbols-outlined">dataset</span>
</div>
<h2 className="text-xl font-bold leading-tight tracking-tight">DSAL Marketplace</h2>
</div>
<div className="flex-1 max-w-2xl px-12">
<div className="relative group">
<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-text-secondary">
<span className="material-symbols-outlined">search</span>
</div>
<input className="block w-full rounded-lg border-none bg-gray-100 dark:bg-border-dark py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-gray-500 dark:placeholder-text-secondary focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-surface-dark transition-all" placeholder="Search plugins, themes, algorithms..." type="text"/>
<div className="absolute inset-y-0 right-0 pr-2 flex items-center">
<kbd className="inline-flex items-center border border-gray-300 dark:border-gray-600 rounded px-2 text-xs font-sans font-medium text-gray-400">⌘K</kbd>
</div>
</div>
</div>
<div className="flex items-center gap-6">
<div className="hidden md:flex items-center gap-6">
<Link className="text-sm font-medium hover:text-primary transition-colors" href="/marketplace">Discover</Link>
<Link className="text-sm font-medium hover:text-primary transition-colors text-gray-500 dark:text-text-secondary" href="/library">Library</Link>
<Link className="text-sm font-medium hover:text-primary transition-colors text-gray-500 dark:text-text-secondary" href="/dashboard/research">Docs</Link>
</div>
<button className="flex items-center justify-center gap-2 rounded-lg h-9 px-4 bg-primary hover:bg-primary/90 text-[#111817] text-sm font-bold transition-all shadow-[0_0_15px_-3px_rgba(19,236,218,0.3)] hover:shadow-[0_0_20px_-3px_rgba(19,236,218,0.5)]">
<span className="material-symbols-outlined text-[18px]">upload</span>
<span>Upload Plugin</span>
</button>
<div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 bg-center bg-cover border-2 border-transparent hover:border-primary transition-colors cursor-pointer" data-alt="User Avatar" ></div>
</div>
</header>

<div className="flex flex-1 overflow-hidden">

<aside className="w-64 flex-none overflow-y-auto border-r border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-[#111817] p-5 hidden md:block">
<h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-text-secondary mb-4">Categories</h3>
<div className="flex flex-col gap-2 mb-8">
<label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-border-dark transition-colors group">
<input defaultChecked className="hidden peer" name="category" type="radio"/>
<span className="material-symbols-outlined text-gray-400 peer-checked:text-primary group-hover:text-primary transition-colors">grid_view</span>
<span className="text-sm font-medium text-gray-600 dark:text-gray-300 peer-checked:text-slate-900 dark:peer-checked:text-white">All Plugins</span>
</label>
<label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-border-dark transition-colors group">
<input className="hidden peer" name="category" type="radio"/>
<span className="material-symbols-outlined text-gray-400 peer-checked:text-primary group-hover:text-primary transition-colors">account_tree</span>
<span className="text-sm font-medium text-gray-600 dark:text-gray-300 peer-checked:text-slate-900 dark:peer-checked:text-white">Tree Skins</span>
</label>
<label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-border-dark transition-colors group">
<input className="hidden peer" name="category" type="radio"/>
<span className="material-symbols-outlined text-gray-400 peer-checked:text-primary group-hover:text-primary transition-colors">hub</span>
<span className="text-sm font-medium text-gray-600 dark:text-gray-300 peer-checked:text-slate-900 dark:peer-checked:text-white">Graph Engines</span>
</label>
<label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-border-dark transition-colors group">
<input className="hidden peer" name="category" type="radio"/>
<span className="material-symbols-outlined text-gray-400 peer-checked:text-primary group-hover:text-primary transition-colors">science</span>
<span className="text-sm font-medium text-gray-600 dark:text-gray-300 peer-checked:text-slate-900 dark:peer-checked:text-white">Quantum Visualizers</span>
</label>
<label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-border-dark transition-colors group">
<input className="hidden peer" name="category" type="radio"/>
<span className="material-symbols-outlined text-gray-400 peer-checked:text-primary group-hover:text-primary transition-colors">memory</span>
<span className="text-sm font-medium text-gray-600 dark:text-gray-300 peer-checked:text-slate-900 dark:peer-checked:text-white">Memory Themes</span>
</label>
</div>
<h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-text-secondary mb-4">Compatibility</h3>
<div className="flex flex-col gap-3">
<label className="flex items-center gap-3 cursor-pointer group">
<input className="rounded border-gray-300 dark:border-gray-600 bg-transparent text-primary focus:ring-0 focus:ring-offset-0" type="checkbox"/>
<span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors">Dijkstra</span>
</label>
<label className="flex items-center gap-3 cursor-pointer group">
<input className="rounded border-gray-300 dark:border-gray-600 bg-transparent text-primary focus:ring-0 focus:ring-offset-0" type="checkbox"/>
<span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors">A* Search</span>
</label>
<label className="flex items-center gap-3 cursor-pointer group">
<input className="rounded border-gray-300 dark:border-gray-600 bg-transparent text-primary focus:ring-0 focus:ring-offset-0" type="checkbox"/>
<span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors">Sorting Algos</span>
</label>
<label className="flex items-center gap-3 cursor-pointer group">
<input className="rounded border-gray-300 dark:border-gray-600 bg-transparent text-primary focus:ring-0 focus:ring-offset-0" type="checkbox"/>
<span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors">Binary Trees</span>
</label>
</div>
<div className="mt-10 p-4 bg-gray-200 dark:bg-surface-dark rounded-xl">
<div className="flex items-center gap-2 text-primary mb-2">
<span className="material-symbols-outlined text-sm">tips_and_updates</span>
<span className="text-xs font-bold uppercase">Pro Tip</span>
</div>
<p className="text-xs text-gray-600 dark:text-text-secondary leading-relaxed">
                    Use <span className="text-primary font-mono bg-primary/10 px-1 rounded">CTRL+P</span> to quickly switch between installed visualizers while debugging.
                </p>
</div>
</aside>

<main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background-light dark:bg-background-dark relative">
<div className="max-w-[1200px] mx-auto">

<div className="flex justify-between items-end mb-8">
<div>
<h1 className="text-3xl font-bold mb-2">Discover Plugins</h1>
<p className="text-gray-500 dark:text-text-secondary">Enhance your algorithm visualization with community themes and engines.</p>
</div>
<div className="flex items-center gap-2 bg-white dark:bg-[#111817] p-1 rounded-lg border border-gray-200 dark:border-border-dark">
<button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-border-dark text-slate-900 dark:text-white transition-colors">
<span className="material-symbols-outlined text-[20px]">view_module</span>
</button>
<button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-border-dark text-gray-400 transition-colors">
<span className="material-symbols-outlined text-[20px]">view_list</span>
</button>
</div>
</div>

<div className="mb-10">
<h2 className="text-lg font-bold mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-primary">local_fire_department</span>
                        Trending Now
                    </h2>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<div className="group bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg dark:hover:shadow-[0_0_20px_-10px_rgba(19,236,218,0.3)] flex flex-col">
<div className="relative aspect-video bg-gray-800 overflow-hidden">
<div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" data-alt="Cyberpunk neon digital grid" ></div>
<div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-primary border border-primary/30">
                                    THEME
                                </div>
</div>
<div className="p-4 flex flex-col flex-1">
<div className="flex justify-between items-start mb-2">
<div>
<h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Cyberpunk Graph</h3>
<p className="text-xs text-gray-500 dark:text-text-secondary">by <span className="text-slate-900 dark:text-white font-medium">NeonCoder</span></p>
</div>
<div className="flex items-center gap-1 text-yellow-400 text-xs font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded">
<span className="material-symbols-outlined text-[14px] fill-current">star</span> 4.8
                                    </div>
</div>
<p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">High contrast neon edges and glitch effects for node traversals.</p>
<div className="mt-auto pt-4 border-t border-gray-100 dark:border-border-dark flex items-center justify-between">
<div className="flex items-center gap-3 text-xs text-gray-500 dark:text-text-secondary">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">download</span> 1.2k</span>
<span className="bg-gray-100 dark:bg-border-dark px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">BFS / DFS</span>
</div>
<button className="text-sm font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded transition-all">
                                        Install
                                    </button>
</div>
</div>
</div>

<div className="group bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg dark:hover:shadow-[0_0_20px_-10px_rgba(19,236,218,0.3)] flex flex-col">
<div className="relative aspect-video bg-gray-800 overflow-hidden">
<div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" data-alt="3D abstract network connections" ></div>
<div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-blue-400 border border-blue-400/30">
                                    ENGINE
                                </div>
</div>
<div className="p-4 flex flex-col flex-1">
<div className="flex justify-between items-start mb-2">
<div>
<h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">3D Force-Directed</h3>
<p className="text-xs text-gray-500 dark:text-text-secondary">by <span className="text-slate-900 dark:text-white font-medium">AlgoWiz</span></p>
</div>
<div className="flex items-center gap-1 text-yellow-400 text-xs font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded">
<span className="material-symbols-outlined text-[14px] fill-current">star</span> 4.9
                                    </div>
</div>
<p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">WebGL powered physics engine for large complex graphs.</p>
<div className="mt-auto pt-4 border-t border-gray-100 dark:border-border-dark flex items-center justify-between">
<div className="flex items-center gap-3 text-xs text-gray-500 dark:text-text-secondary">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">download</span> 850</span>
<span className="bg-gray-100 dark:bg-border-dark px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">WebGL</span>
</div>
<button className="text-sm font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded transition-all">
                                        Install
                                    </button>
</div>
</div>
</div>

<div className="group bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg dark:hover:shadow-[0_0_20px_-10px_rgba(19,236,218,0.3)] flex flex-col">
<div className="relative aspect-video bg-gray-800 overflow-hidden">
<div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" data-alt="Retro computer terminal green screen" ></div>
<div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-green-400 border border-green-400/30">
                                    RETRO
                                </div>
</div>
<div className="p-4 flex flex-col flex-1">
<div className="flex justify-between items-start mb-2">
<div>
<h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Classic IBM Terminal</h3>
<p className="text-xs text-gray-500 dark:text-text-secondary">by <span className="text-slate-900 dark:text-white font-medium">RetroFan</span></p>
</div>
<div className="flex items-center gap-1 text-yellow-400 text-xs font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded">
<span className="material-symbols-outlined text-[14px] fill-current">star</span> 4.5
                                    </div>
</div>
<p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Bring back the 80s with this monochrome green phosphor aesthetic.</p>
<div className="mt-auto pt-4 border-t border-gray-100 dark:border-border-dark flex items-center justify-between">
<div className="flex items-center gap-3 text-xs text-gray-500 dark:text-text-secondary">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">download</span> 2.1k</span>
<span className="bg-gray-100 dark:bg-border-dark px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">Terminal</span>
</div>
<button className="text-sm font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded transition-all">
                                        Install
                                    </button>
</div>
</div>
</div>
</div>
</div>

<div>
<h2 className="text-lg font-bold mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-gray-400">new_releases</span>
                        New &amp; Noteworthy
                    </h2>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<div className="group bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg dark:hover:shadow-[0_0_20px_-10px_rgba(19,236,218,0.3)] flex flex-col">
<div className="relative aspect-video bg-gray-800 overflow-hidden">
<div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" data-alt="Computer chip and data flow" ></div>
<div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-purple-400 border border-purple-400/30">
                                    QUANTUM
                                </div>
</div>
<div className="p-4 flex flex-col flex-1">
<div className="flex justify-between items-start mb-2">
<div>
<h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Qubit Visualizer</h3>
<p className="text-xs text-gray-500 dark:text-text-secondary">by <span className="text-slate-900 dark:text-white font-medium">SchrodingersCat</span></p>
</div>
<div className="flex items-center gap-1 text-gray-400 text-xs font-bold bg-gray-200 dark:bg-white/5 px-1.5 py-0.5 rounded">
<span className="material-symbols-outlined text-[14px]">star</span> New
                                    </div>
</div>
<p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Visualize superposition states in quantum algorithms.</p>
<div className="mt-auto pt-4 border-t border-gray-100 dark:border-border-dark flex items-center justify-between">
<div className="flex items-center gap-3 text-xs text-gray-500 dark:text-text-secondary">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">download</span> 12</span>
<span className="bg-gray-100 dark:bg-border-dark px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">QASM</span>
</div>
<button className="text-sm font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded transition-all">
                                        Install
                                    </button>
</div>
</div>
</div>

<div className="group bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg dark:hover:shadow-[0_0_20px_-10px_rgba(19,236,218,0.3)] flex flex-col">
<div className="relative aspect-video bg-gray-800 overflow-hidden">
<div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" data-alt="Code syntax on a dark screen" ></div>
<div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-primary border border-primary/30">
                                    SYNTAX
                                </div>
</div>
<div className="p-4 flex flex-col flex-1">
<div className="flex justify-between items-start mb-2">
<div>
<h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Dracula Code</h3>
<p className="text-xs text-gray-500 dark:text-text-secondary">by <span className="text-slate-900 dark:text-white font-medium">DarkLord</span></p>
</div>
<div className="flex items-center gap-1 text-yellow-400 text-xs font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded">
<span className="material-symbols-outlined text-[14px] fill-current">star</span> 5.0
                                    </div>
</div>
<p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">The famous Dracula theme ported for algorithm pseudocode blocks.</p>
<div className="mt-auto pt-4 border-t border-gray-100 dark:border-border-dark flex items-center justify-between">
<div className="flex items-center gap-3 text-xs text-gray-500 dark:text-text-secondary">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">download</span> 5.4k</span>
<span className="bg-gray-100 dark:bg-border-dark px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">Editor</span>
</div>
<button className="text-sm font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded transition-all">
                                        Install
                                    </button>
</div>
</div>
</div>

<div className="group bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg dark:hover:shadow-[0_0_20px_-10px_rgba(19,236,218,0.3)] flex flex-col">
<div className="relative aspect-video bg-gray-800 overflow-hidden">
<div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" data-alt="Abstract colorful nodes connected" ></div>
<div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-orange-400 border border-orange-400/30">
                                    LAYOUT
                                </div>
</div>
<div className="p-4 flex flex-col flex-1">
<div className="flex justify-between items-start mb-2">
<div>
<h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Circular Layout</h3>
<p className="text-xs text-gray-500 dark:text-text-secondary">by <span className="text-slate-900 dark:text-white font-medium">MathGeek</span></p>
</div>
<div className="flex items-center gap-1 text-yellow-400 text-xs font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded">
<span className="material-symbols-outlined text-[14px] fill-current">star</span> 4.7
                                    </div>
</div>
<p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Perfect for visualizing network topologies and peer-to-peer rings.</p>
<div className="mt-auto pt-4 border-t border-gray-100 dark:border-border-dark flex items-center justify-between">
<div className="flex items-center gap-3 text-xs text-gray-500 dark:text-text-secondary">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">download</span> 340</span>
<span className="bg-gray-100 dark:bg-border-dark px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">P2P</span>
</div>
<button className="text-sm font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded transition-all">
                                        Install
                                    </button>
</div>
</div>
</div>
</div>
</div>
</div>
<footer className="mt-16 py-8 border-t border-gray-200 dark:border-border-dark text-center">
<p className="text-sm text-gray-500 dark:text-text-secondary">© 2023 DSAL Marketplace. Community driven algorithms.</p>
</footer>
</main>

<aside className="w-72 flex-none overflow-y-auto border-l border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-[#111817] p-6 hidden xl:block">

<div className="mb-8">
<div className="flex items-center justify-between mb-4">
<h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Editor's Choice</h3>
<span className="material-symbols-outlined text-primary text-sm">verified</span>
</div>
<div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-border-dark shadow-sm">
<div className="w-full h-32 rounded-lg bg-cover bg-center mb-3" data-alt="Blue data path visualization" ></div>
<h4 className="font-bold text-lg leading-tight mb-1 text-slate-900 dark:text-white">Dijkstra Pathfinder Pro</h4>
<p className="text-xs text-gray-500 dark:text-text-secondary mb-3">The ultimate debugging tool for shortest path algorithms.</p>
<button className="w-full py-2 bg-primary text-[#111817] rounded font-bold text-sm hover:bg-white transition-colors">Get it now</button>
</div>
</div>

<div>
<h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">Top Creators</h3>
<div className="flex flex-col gap-4">

<div className="flex items-center gap-3">
<div className="h-10 w-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-border-dark" data-alt="Portrait of a male developer" ></div>
<div className="flex-1">
<h4 className="text-sm font-bold text-slate-900 dark:text-white">NeonCoder</h4>
<p className="text-xs text-gray-500 dark:text-text-secondary">15 Plugins • 45k DLs</p>
</div>
<button className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-[18px]">person_add</span></button>
</div>

<div className="flex items-center gap-3">
<div className="h-10 w-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-border-dark" data-alt="Portrait of a female developer" ></div>
<div className="flex-1">
<h4 className="text-sm font-bold text-slate-900 dark:text-white">AlgoWiz</h4>
<p className="text-xs text-gray-500 dark:text-text-secondary">8 Plugins • 22k DLs</p>
</div>
<button className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-[18px]">person_add</span></button>
</div>

<div className="flex items-center gap-3">
<div className="h-10 w-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-border-dark" data-alt="Portrait of a male designer" ></div>
<div className="flex-1">
<h4 className="text-sm font-bold text-slate-900 dark:text-white">RetroFan</h4>
<p className="text-xs text-gray-500 dark:text-text-secondary">3 Plugins • 8k DLs</p>
</div>
<button className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-[18px]">person_add</span></button>
</div>

<div className="flex items-center gap-3">
<div className="h-10 w-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-border-dark" data-alt="Portrait of a developer" ></div>
<div className="flex-1">
<h4 className="text-sm font-bold text-slate-900 dark:text-white">DevSarah</h4>
<p className="text-xs text-gray-500 dark:text-text-secondary">2 Plugins • 5k DLs</p>
</div>
<button className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-[18px]">person_add</span></button>
</div>
</div>
<button className="w-full mt-6 py-2 border border-gray-300 dark:border-border-dark rounded-lg text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors">
                    View All Creators
                </button>
</div>
</aside>
</div>

    </>
  );
}
