export default function DsalCollaborativeReviewInterface() {
  return (
    <>
      {/* 
        Warning: This is an auto-generated JSX file from HTML. 
      */}
      

<header className="flex items-center justify-between border-b border-border-dark bg-surface-dark px-6 py-3 h-16 z-20 shadow-sm">
<div className="flex items-center gap-4">
<div className="size-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
<span className="material-symbols-outlined">hub</span>
</div>
<div>
<h1 className="text-white text-lg font-bold leading-tight tracking-tight">DSAL Review: Dijkstra's Algorithm</h1>
<p className="text-slate-400 text-xs">Version 4.2 • Last edited 2m ago</p>
</div>
</div>
<div className="flex items-center gap-6">

<div className="flex items-center -space-x-3">
<div className="relative group cursor-pointer">
<div className="size-9 rounded-full border-2 border-surface-dark bg-cover bg-center" data-alt="Female collaborator portrait" ></div>
<div className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-surface-dark rounded-full"></div>
</div>
<div className="relative group cursor-pointer">
<div className="size-9 rounded-full border-2 border-surface-dark bg-cover bg-center" data-alt="Male collaborator portrait" ></div>
<div className="absolute bottom-0 right-0 size-2.5 bg-amber-500 border-2 border-surface-dark rounded-full"></div>
</div>
<div className="relative group cursor-pointer flex items-center justify-center bg-slate-700 size-9 rounded-full border-2 border-surface-dark text-xs font-bold text-white">
                    +3
                </div>
</div>
<div className="h-6 w-px bg-border-dark"></div>

<div className="flex items-center gap-3">
<span className="text-sm font-medium text-slate-300">Sync View</span>
<button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900">
<span className="sr-only">Enable sync view</span>
<span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
</button>
</div>

<button className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
<span className="material-symbols-outlined text-[18px]">share</span>
<span>Share</span>
</button>
</div>
</header>

<main className="flex flex-1 overflow-hidden">

<aside className="w-80 flex flex-col border-r border-border-dark bg-surface-darker z-10 hidden lg:flex">
<div className="flex items-center justify-between px-4 py-3 border-b border-border-dark bg-surface-dark">
<span className="text-sm font-bold text-slate-300 flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">code</span>
                    Source: Graph.js
                </span>
<button className="text-slate-500 hover:text-white"><span className="material-symbols-outlined text-[18px]">open_in_full</span></button>
</div>

<div className="flex-1 overflow-y-auto font-mono text-xs leading-6 p-4 text-slate-400 bg-surface-darker">
<div className="flex gap-4 opacity-50">
<span className="w-6 text-right select-none text-slate-600">38</span>
<span>class PriorityQueue &#123;</span>
</div>
<div className="flex gap-4 opacity-50">
<span className="w-6 text-right select-none text-slate-600">39</span>
<span className="pl-4">constructor() &#123;</span>
</div>
<div className="flex gap-4 opacity-50">
<span className="w-6 text-right select-none text-slate-600">40</span>
<span className="pl-8">this.values = [];</span>
</div>
<div className="flex gap-4 opacity-50">
<span className="w-6 text-right select-none text-slate-600">41</span>
<span className="pl-4">&#125;</span>
</div>

<div className="flex gap-4 bg-primary/20 -mx-4 px-4 border-l-2 border-primary text-white">
<span className="w-6 text-right select-none text-primary">42</span>
<span className="pl-4">enqueue(val, priority) &#123;</span>
</div>
<div className="flex gap-4 text-white">
<span className="w-6 text-right select-none text-slate-600">43</span>
<span className="pl-8">this.values.push(&#123;val, priority&#125;);</span>
</div>
<div className="flex gap-4 text-white">
<span className="w-6 text-right select-none text-slate-600">44</span>
<span className="pl-8">this.sort();</span>
</div>
<div className="flex gap-4 opacity-50">
<span className="w-6 text-right select-none text-slate-600">45</span>
<span className="pl-4">&#125;</span>
</div>
<div className="flex gap-4 opacity-50">
<span className="w-6 text-right select-none text-slate-600">46</span>
<span className="pl-4">dequeue() &#123;</span>
</div>
<div className="flex gap-4 opacity-50">
<span className="w-6 text-right select-none text-slate-600">47</span>
<span className="pl-8">return this.values.shift();</span>
</div>
</div>

<div className="h-1/3 border-t border-border-dark flex flex-col">
<div className="px-4 py-2 bg-surface-dark border-b border-border-dark text-xs font-bold text-slate-300">
                    Memory Watch
                </div>
<div className="p-4 font-mono text-xs space-y-2 overflow-y-auto">
<div className="flex justify-between">
<span className="text-purple-400">queue_size</span>
<span className="text-white">4</span>
</div>
<div className="flex justify-between">
<span className="text-purple-400">current_node</span>
<span className="text-yellow-400">'C'</span>
</div>
<div className="flex justify-between">
<span className="text-purple-400">visited</span>
<span className="text-slate-400">['A', 'B']</span>
</div>
</div>
</div>
</aside>

<section className="flex-1 flex flex-col relative bg-background-dark overflow-hidden">

<div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-surface-dark/90 backdrop-blur-sm border border-border-dark rounded-full px-4 py-2 shadow-xl z-20">
<button className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"><span className="material-symbols-outlined text-[20px]">play_arrow</span></button>
<button className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"><span className="material-symbols-outlined text-[20px]">pause</span></button>
<button className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"><span className="material-symbols-outlined text-[20px]">skip_next</span></button>
<div className="w-px h-4 bg-border-dark mx-1"></div>
<div className="text-xs font-mono text-primary font-bold">T = 14.5s</div>
</div>

<div className="flex-1 relative cursor-crosshair" >

<div className="absolute inset-0 flex items-center justify-center">
<svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
<defs>
<marker id="arrowhead" markerHeight="7" markerWidth="10" orient="auto" refX="28" refY="3.5">
<polygon fill="#475569" points="0 0, 10 3.5, 0 7" />
</marker>
</defs>

<line markerEnd="url(#arrowhead)" stroke="#475569" strokeWidth="2" x1="40%" x2="30%" y1="30%" y2="50%" />
<line className="edge-path" markerEnd="url(#arrowhead)" stroke="#3b82f6" strokeWidth="3" x1="40%" x2="60%" y1="30%" y2="40%" /> 
<line markerEnd="url(#arrowhead)" stroke="#475569" strokeWidth="2" x1="30%" x2="50%" y1="50%" y2="70%" />
<line markerEnd="url(#arrowhead)" stroke="#475569" strokeWidth="2" x1="60%" x2="50%" y1="40%" y2="70%" />
</svg>

<div className="absolute top-[30%] left-[40%] -translate-x-1/2 -translate-y-1/2 group">
<div className="size-14 rounded-full bg-slate-800 border-4 border-slate-600 flex items-center justify-center shadow-lg relative z-10 transition-transform group-hover:scale-105">
<span className="text-white font-bold text-lg">A</span>
</div>
<div className="absolute -top-3 -right-3 z-20 cursor-pointer hover:scale-110 transition-transform">
<div className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center shadow-sm gap-1 border border-surface-dark">
<span className="material-symbols-outlined text-[10px]">chat_bubble</span> 2
                             </div>
</div>
</div>

<div className="absolute top-[50%] left-[30%] -translate-x-1/2 -translate-y-1/2 group">
<div className="size-14 rounded-full bg-slate-800 border-4 border-slate-600 flex items-center justify-center shadow-lg relative z-10 transition-transform group-hover:scale-105">
<span className="text-white font-bold text-lg">B</span>
</div>
</div>

<div className="absolute top-[40%] left-[60%] -translate-x-1/2 -translate-y-1/2 group">
<div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
<div className="size-16 rounded-full bg-surface-dark border-4 border-primary flex items-center justify-center shadow-[0_0_20px_rgba(19,55,236,0.4)] relative z-10 transition-transform group-hover:scale-105">
<span className="text-primary font-bold text-xl">C</span>
</div>

<div className="absolute -top-4 -right-4 z-20 cursor-pointer hover:scale-110 transition-transform">
<div className="bg-rose-500 text-white p-1.5 rounded-full shadow-lg border-2 border-surface-dark">
<span className="material-symbols-outlined text-[16px] block">priority_high</span>
</div>
</div>
</div>

<div className="absolute top-[70%] left-[50%] -translate-x-1/2 -translate-y-1/2 group">
<div className="size-14 rounded-full bg-slate-800 border-4 border-slate-600 flex items-center justify-center shadow-lg relative z-10 transition-transform group-hover:scale-105">
<span className="text-white font-bold text-lg">D</span>
</div>
</div>
</div>

<div className="absolute top-[42%] left-[63%] pointer-events-none z-30 transition-all duration-300 ease-out">
<svg className="text-purple-500 drop-shadow-md" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
<path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19177L17.9164 12.3673H5.65376Z" fill="currentColor" stroke="white" />
</svg>
<div className="ml-4 -mt-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
                        Sarah is selecting...
                    </div>
</div>

<div className="absolute top-[28%] left-[42%] pointer-events-none z-30 transition-all duration-300 ease-out opacity-60">
<svg className="text-amber-500 drop-shadow-md" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
<path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19177L17.9164 12.3673H5.65376Z" fill="currentColor" stroke="white" />
</svg>
<div className="ml-4 -mt-2 bg-amber-500 text-surface-darker text-[10px] font-bold px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
                        Mike
                    </div>
</div>
</div>

<div className="h-40 border-t border-border-dark bg-surface-darker flex flex-col z-20">
<div className="flex items-center justify-between px-4 py-2 border-b border-border-dark">
<div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
<span className="material-symbols-outlined text-[16px]">alt_route</span>
                        Version Control
                    </div>
<div className="flex gap-2">
<button className="text-xs bg-surface-dark hover:bg-white/5 border border-border-dark text-slate-300 px-2 py-1 rounded transition-colors">+ New Branch</button>
</div>
</div>

<div className="flex-1 relative overflow-x-auto p-4 flex items-center">

<div className="absolute h-1 bg-slate-700 w-[800px] top-1/2 -translate-y-1/2 rounded-full"></div>

<div className="relative flex w-[800px] justify-between px-4 items-center">
<div className="relative group cursor-pointer">
<div className="size-3 bg-slate-500 rounded-full hover:bg-white transition-colors"></div>
<div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 whitespace-nowrap">Start</div>
</div>
<div className="relative group cursor-pointer">
<div className="size-3 bg-slate-500 rounded-full hover:bg-white transition-colors"></div>
</div>
<div className="relative group cursor-pointer">
<div className="size-4 bg-primary rounded-full ring-4 ring-primary/20 z-10 hover:scale-125 transition-transform"></div>
<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark border border-primary text-primary text-[10px] px-2 py-1 rounded whitespace-nowrap">Current State</div>
</div>
<div className="relative group cursor-pointer">
<div className="size-3 bg-slate-500 rounded-full hover:bg-white transition-colors"></div>
</div>
<div className="relative group cursor-pointer">
<div className="size-3 bg-slate-500 rounded-full hover:bg-white transition-colors"></div>
</div>
</div>

<svg className="absolute top-1/2 left-0 w-full h-full overflow-visible pointer-events-none" >

<path d="M 340 0 C 380 0, 380 40, 420 40 L 600 40" fill="none" stroke="#e11d48" strokeDasharray="4 2" strokeWidth="2" />
</svg>

<div className="absolute top-[calc(50%+40px)] left-[420px] flex gap-20">
<div className="relative group cursor-pointer">
<div className="size-3 bg-rose-500 rounded-full hover:bg-white ring-4 ring-rose-500/20 transition-colors"></div>
<div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] text-rose-500 font-bold whitespace-nowrap">Edge Case: Null Ptr</div>
</div>
<div className="relative group cursor-pointer">
<div className="size-3 bg-rose-900 rounded-full border border-rose-500 hover:bg-white transition-colors"></div>
</div>
</div>
</div>
</div>
</section>

<aside className="w-96 flex flex-col border-l border-border-dark bg-surface-dark z-20">
<div className="px-4 py-3 border-b border-border-dark flex items-center justify-between">
<h2 className="font-bold text-white text-sm">Review Chat</h2>
<button className="text-slate-400 hover:text-white"><span className="material-symbols-outlined text-[20px]">more_horiz</span></button>
</div>

<div className="flex-1 overflow-y-auto p-4 space-y-6">

<div className="flex gap-3">
<div className="size-8 rounded-full bg-cover bg-center shrink-0" data-alt="Mike Avatar" ></div>
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2">
<span className="text-sm font-bold text-white">Mike</span>
<span className="text-[10px] text-slate-500">10:42 AM</span>
</div>
<p className="text-sm text-slate-300 bg-surface-darker p-3 rounded-lg rounded-tl-none border border-border-dark">
                            Why is the priority queue behaving like a FIFO here? Check line 42.
                        </p>
</div>
</div>

<div className="flex gap-3">
<div className="size-8 rounded-full bg-cover bg-center shrink-0" data-alt="Sarah Avatar" ></div>
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2">
<span className="text-sm font-bold text-white">Sarah</span>
<span className="text-[10px] text-slate-500">10:45 AM</span>
</div>
<p className="text-sm text-slate-300 bg-surface-darker p-3 rounded-lg rounded-tl-none border border-border-dark mb-2">
                            I think the comparator is inverted. Look at this state snapshot, the weights are negative.
                        </p>

<div className="cursor-pointer group hover:border-primary/50 transition-colors bg-[#0f111a] border border-border-dark rounded-lg p-3 flex items-start gap-3">
<div className="size-10 bg-primary/10 rounded flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
<span className="material-symbols-outlined text-[20px]">data_object</span>
</div>
<div className="flex-1 overflow-hidden">
<h4 className="text-xs font-bold text-white truncate">Snapshot: Queue State</h4>
<p className="text-[10px] text-slate-500">Captured at T=14.2s</p>
<div className="mt-1 flex items-center gap-1 text-[10px] text-primary">
<span className="material-symbols-outlined text-[10px]">restore</span>
                                    Click to revert view
                                </div>
</div>
</div>
</div>
</div>

<div className="flex gap-3">
<div className="size-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        YOU
                    </div>
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2">
<span className="text-sm font-bold text-white">You</span>
<span className="text-[10px] text-slate-500">Just now</span>
</div>
<p className="text-sm text-slate-300 bg-primary/10 p-3 rounded-lg rounded-tl-none border border-primary/20">
                            Good catch. I'm creating a branch to test the fix.
                        </p>
</div>
</div>
</div>

<div className="p-4 border-t border-border-dark bg-surface-dark">
<div className="relative">
<input className="w-full bg-surface-darker border border-border-dark rounded-lg pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Type a message..." type="text"/>
<button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors">
<span className="material-symbols-outlined text-[20px]">send</span>
</button>
</div>
<div className="flex items-center gap-4 mt-2 px-1">
<button className="text-slate-500 hover:text-white transition-colors" title="Attach Snapshot"><span className="material-symbols-outlined text-[18px]">add_a_photo</span></button>
<button className="text-slate-500 hover:text-white transition-colors" title="Code Snippet"><span className="material-symbols-outlined text-[18px]">code</span></button>
<button className="text-slate-500 hover:text-white transition-colors" title="Emoji"><span className="material-symbols-outlined text-[18px]">sentiment_satisfied</span></button>
</div>
</div>
</aside>
</main>

    </>
  );
}
