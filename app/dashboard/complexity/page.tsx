export default function DsalComplexityAnalysisDashboard() {
  return (
    <div className="flex flex-col min-h-[1080px] bg-surface-darker-matte text-slate-300 font-display overflow-hidden">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-800 bg-surface-darker-matte px-6 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="size-8 flex items-center justify-center text-neon-cyan">
            <span className="material-symbols-outlined text-3xl neon-text-primary">hub</span>
          </div>
          <h2 className="text-white text-xl font-bold leading-tight tracking-tight">
            DSAL <span className="text-xs font-normal text-slate-500 ml-2">Ultimate Unified</span>
          </h2>
        </div>
        <div className="flex flex-1 justify-end gap-8 items-center">
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-slate-400 hover:text-neon-cyan transition-colors text-sm font-medium leading-normal" href="#">Editor</a>
            <a className="text-slate-400 hover:text-neon-cyan transition-colors text-sm font-medium leading-normal" href="#">Visualizer</a>
            <a className="text-neon-cyan text-sm font-medium leading-normal relative after:content-[''] after:absolute after:-bottom-5 after:left-0 after:w-full after:h-0.5 after:bg-neon-cyan after:shadow-[0_0_10px_#00f2ff]" href="#">Analysis</a>
            <a className="text-slate-400 hover:text-neon-cyan transition-colors text-sm font-medium leading-normal" href="#">Settings</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="size-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 hover:text-neon-cyan transition-colors">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border border-slate-700" 
              style={{ backgroundImage: 'url("https://picsum.photos/seed/user/100/100")' }}
              data-alt="User profile picture" 
            ></div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 scrollbar-hide">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <a className="text-slate-500 hover:text-white transition-colors text-sm font-medium" href="#">Analysis</a>
              <span className="material-symbols-outlined text-slate-600 text-sm">chevron_right</span>
              <a className="text-slate-500 hover:text-white transition-colors text-sm font-medium" href="#">Unified Complexity</a>
              <span className="material-symbols-outlined text-slate-600 text-sm">chevron_right</span>
              <span className="text-neon-cyan text-sm font-bold bg-neon-cyan/10 px-2 py-0.5 rounded border border-neon-cyan/20 neon-text-primary">Urgency Protocol</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-surface-dark-matte hover:bg-slate-700 transition-colors text-xs font-medium text-slate-300">
                <span className="material-symbols-outlined text-sm">memory</span>
                Simulate Rebalance
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-surface-dark-matte hover:bg-slate-700 transition-colors text-xs font-medium text-slate-300">
                <span className="material-symbols-outlined text-sm">psychology</span>
                Apply Memoization
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-cyan text-black hover:bg-cyan-300 transition-colors text-xs font-bold shadow-[0_0_15px_rgba(0,242,255,0.4)]">
                <span className="material-symbols-outlined text-sm">bolt</span>
                Run Stress Test
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-800 bg-surface-dark-matte p-5 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-neon-red">speed</span>
              </div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-slate-100 text-lg font-bold flex items-center gap-2">
                    Comparative Time Complexity
                    <span className="flex size-2 rounded-full bg-neon-red animate-pulse"></span>
                  </h3>
                  <p className="text-slate-400 text-xs">Standard vs. Urgency Curves</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-xs text-cyber-purple font-bold">
                    <span className="w-3 h-0.5 bg-cyber-purple shadow-[0_0_8px_#b026ff]"></span> O(N) Std
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neon-red font-bold">
                    <span className="w-3 h-0.5 bg-neon-red shadow-[0_0_8px_#ff2a4d]"></span> O(2^n) Urgent
                  </div>
                </div>
              </div>
              <div className="h-[200px] w-full relative z-10">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 200">
                  <line x1="0" y1="199" x2="400" y2="199" stroke="#1e293b" strokeWidth="1" />
                  <line x1="0" y1="0" x2="0" y2="200" stroke="#1e293b" strokeWidth="1" />
                  <line x1="0" y1="150" x2="400" y2="150" stroke="#334155" strokeWidth="1" strokeDasharray="2 4" opacity="0.2" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="#334155" strokeWidth="1" strokeDasharray="2 4" opacity="0.2" />
                  <defs>
                    <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff2a4d" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#ff2a4d" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,200 C100,180 200,140 400,20" fill="none" stroke="#b026ff" strokeWidth="2" className="drop-shadow-[0_0_6px_rgba(176,38,255,0.8)]" />
                  <path d="M0,200 Q150,200 280,100 T400,0 V200 H0 Z" fill="url(#redGradient)" />
                  <path d="M0,200 Q150,200 280,100 T400,0" fill="none" stroke="#ff2a4d" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(255,42,77,0.8)]" />
                  <circle cx="280" cy="100" r="4" fill="#ff2a4d" className="animate-pulse" />
                  <circle cx="200" cy="140" r="3" fill="#b026ff" />
                </svg>
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono">
                <span>1</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>N=40</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-surface-dark-matte p-5 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-neon-cyan">storage</span>
              </div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-slate-100 text-lg font-bold">Space Complexity</h3>
                  <p className="text-slate-400 text-xs">Heap vs Memory Urgency</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] text-neon-cyan font-bold">
                    <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_5px_#00f2ff]"></span> Mem Urgency
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-cyber-purple font-bold">
                    <span className="w-2 h-2 rounded-full bg-cyber-purple shadow-[0_0_5px_#b026ff]"></span> Heap Std
                  </div>
                </div>
              </div>
              <div className="h-[200px] w-full relative z-10">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 200">
                  <line x1="0" y1="199" x2="400" y2="199" stroke="#1e293b" strokeWidth="1" />
                  <line x1="0" y1="0" x2="0" y2="200" stroke="#1e293b" strokeWidth="1" />
                  <defs>
                    <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b026ff" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#b026ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,200 L400,120 V200 H0 Z" fill="url(#purpleGradient)" />
                  <line x1="0" y1="200" x2="400" y2="120" stroke="#b026ff" strokeWidth="2" className="drop-shadow-[0_0_6px_rgba(176,38,255,0.6)]" />
                  <path d="M0,200 L400,50 V200 H0 Z" fill="url(#primaryGradient)" />
                  <line x1="0" y1="200" x2="400" y2="50" stroke="#00f2ff" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(0,242,255,0.6)]" />
                  <circle cx="200" cy="125" r="3" fill="#00f2ff" opacity="0.5" className="animate-ping origin-center" />
                  <circle cx="200" cy="125" r="3" fill="#00f2ff" />
                </svg>
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono">
                <span>10</span>
                <span>100</span>
                <span>1k</span>
                <span>10k</span>
                <span>100k</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="rounded-xl bg-surface-dark-matte border neon-border-red p-4 flex flex-col items-center justify-center gap-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-red/10 to-transparent opacity-50"></div>
              <p className="text-neon-red text-xs font-bold uppercase tracking-wider z-10">Worst Case</p>
              <p className="text-2xl font-bold text-white neon-text-red z-10">O(2^n)</p>
              <span className="text-[10px] uppercase text-red-300 bg-red-900/40 px-2 py-0.5 rounded border border-red-500/30 z-10">Critical</span>
            </div>
            <div className="rounded-xl bg-surface-dark-matte border neon-border-orange p-4 flex flex-col items-center justify-center gap-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-orange/10 to-transparent opacity-50"></div>
              <p className="text-neon-orange text-xs font-bold uppercase tracking-wider z-10">Average</p>
              <p className="text-2xl font-bold text-white neon-text-orange z-10">O(N)</p>
              <span className="text-[10px] uppercase text-orange-300 bg-orange-900/40 px-2 py-0.5 rounded border border-orange-500/30 z-10">Standard</span>
            </div>
            <div className="rounded-xl bg-surface-dark-matte border neon-border-purple p-4 flex flex-col items-center justify-center gap-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/10 to-transparent opacity-50"></div>
              <p className="text-cyber-purple text-xs font-bold uppercase tracking-wider z-10">Best Case</p>
              <p className="text-2xl font-bold text-white neon-text-purple z-10">O(log n)</p>
              <span className="text-[10px] uppercase text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/30 z-10">Optimal</span>
            </div>
            <div className="rounded-xl bg-surface-dark-matte border neon-border-primary p-4 flex flex-col items-center justify-center gap-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 to-transparent opacity-50"></div>
              <p className="text-neon-cyan text-xs font-bold uppercase tracking-wider z-10">Space</p>
              <p className="text-2xl font-bold text-white neon-text-primary z-10">O(N)</p>
              <span className="text-[10px] uppercase text-cyan-200 bg-cyan-900/40 px-2 py-0.5 rounded border border-cyan-500/30 z-10">Allocated</span>
            </div>
            <div className="rounded-xl bg-surface-dark-matte border border-slate-700 p-4 flex flex-col items-center justify-center gap-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-transparent opacity-50"></div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider z-10">Auxiliary</p>
              <p className="text-2xl font-bold text-slate-200 z-10">O(1)</p>
              <span className="text-[10px] uppercase text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-600/30 z-10">Constant</span>
            </div>
            <div className="rounded-xl bg-surface-dark-matte border border-slate-700 p-4 flex flex-col items-center justify-center gap-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-transparent opacity-50"></div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider z-10">Amortized</p>
              <p className="text-2xl font-bold text-slate-200 z-10">O(1)*</p>
              <span className="text-[10px] uppercase text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-600/30 z-10">Variable</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-surface-dark-matte overflow-hidden flex-1 min-h-[300px]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-surface-darker-matte">
              <h3 className="text-white font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-neon-orange">table_chart</span>
                Unified Execution Log
              </h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded text-xs text-slate-400 border border-slate-700">
                  <span className="size-2 rounded-full bg-cyber-purple"></span> Standard
                  <span className="size-2 rounded-full bg-neon-orange ml-2"></span> Vivid
                </div>
                <select className="bg-slate-800 text-slate-300 text-xs border border-slate-700 rounded px-2 py-1 outline-none focus:border-neon-orange">
                  <option>Unified View</option>
                  <option>Split View</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase border-b border-slate-800 bg-surface-darker-matte">
                    <th className="p-4 font-medium w-32">Input (Nodes)</th>
                    <th className="p-4 font-medium w-24">Depth</th>
                    <th className="p-4 font-medium w-32">Insert / Search</th>
                    <th className="p-4 font-medium w-32">Process Time</th>
                    <th className="p-4 font-medium w-32">Stack Overhead</th>
                    <th className="p-4 font-medium">Visual vs Complexity Load</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-800">
                  {[
                    { nodes: '10', depth: '10', time: '0.02ms / 0.01ms', process: '0.5ms', stack: '2KB', load: 'OK', color: 'neon-orange' },
                    { nodes: '1,000', depth: '20', time: '12ms / 4ms', process: '45ms', stack: '128KB', load: '45%', color: 'neon-orange' },
                    { nodes: '100,000', depth: '30', time: '4.2s / 1.1s', process: '12.5s', stack: '14MB', load: 'HIGH', color: 'neon-red' },
                    { nodes: '1,000,000+', depth: '40', time: 'TIMEOUT', process: '~Hours', stack: 'Overflow', load: 'FAIL', color: 'neon-red' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4 text-white font-medium">{row.nodes}</td>
                      <td className="p-4 text-slate-400 font-mono">{row.depth}</td>
                      <td className="p-4 text-slate-400 font-mono">{row.time}</td>
                      <td className={`p-4 font-mono font-bold ${row.color === 'neon-red' ? 'text-neon-red neon-text-red' : 'text-neon-orange'}`}>{row.process}</td>
                      <td className="p-4 text-slate-400 font-mono">{row.stack}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 w-full max-w-md">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden">
                              <div className="h-full bg-cyber-purple shadow-[0_0_5px_#b026ff]" style={{ width: '30%' }}></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                              <div className={`h-full rounded-full shadow-[0_0_8px] ${row.color === 'neon-red' ? 'bg-neon-red shadow-[#ff2a4d]' : 'bg-neon-orange shadow-[#ff9f0a]'}`} style={{ width: row.load === 'OK' ? '10%' : row.load === '45%' ? '45%' : '90%' }}></div>
                            </div>
                            <span className={`text-[10px] w-8 text-right ${row.color === 'neon-red' ? 'text-neon-red font-bold' : 'text-neon-orange'}`}>{row.load}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <aside className="w-80 border-l border-slate-800 bg-surface-darker-matte hidden xl:flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-neon-cyan">psychology</span>
              AI Observer
            </h3>
            <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_#00f2ff] animate-pulse"></div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-hide">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Live Insights</div>
            <div className="bg-surface-dark-matte rounded-lg p-4 border border-cyber-purple/30 shadow-[0_0_10px_rgba(176,38,255,0.1)]">
              <div className="flex items-start gap-3 mb-2">
                <span className="material-symbols-outlined text-cyber-purple text-sm mt-0.5">balance</span>
                <h4 className="text-cyber-purple text-sm font-bold uppercase tracking-wide">Skew Detection</h4>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Data distribution is heavily left-skewed. Tree height is suboptimal at <span className="text-cyber-purple font-mono">H = 40</span>. Rebalancing suggested.
              </p>
            </div>
            <div className="bg-slate-900/80 rounded-lg p-4 border-l-4 border-neon-red shadow-[0_0_15px_rgba(255,42,77,0.1)]">
              <div className="flex items-start gap-3 mb-2">
                <span className="material-symbols-outlined text-neon-red text-sm mt-0.5">report</span>
                <h4 className="text-neon-red text-sm font-bold uppercase tracking-wide">Exponential Growth</h4>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Algorithm has degraded to <span className="text-neon-red font-mono neon-text-red">O(2^n)</span>. Processing N=35 will cause a timeout.
              </p>
            </div>
            <div className="bg-slate-900/80 rounded-lg p-4 border-l-4 border-neon-orange">
              <div className="flex items-start gap-3 mb-2">
                <span className="material-symbols-outlined text-neon-orange text-sm mt-0.5">warning</span>
                <h4 className="text-neon-orange text-sm font-bold uppercase tracking-wide">Stack Usage</h4>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Recursion depth increasing linearly <span className="text-neon-orange font-mono">O(N)</span>. Risk of stack overflow for N &gt; 5000.
              </p>
              <button className="mt-3 text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3 py-1.5 rounded transition-colors w-full">Optimize Stack</button>
            </div>
            <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-800 mt-2">
              <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-3">Live Trace</h4>
              <div className="space-y-2 font-mono text-[10px]">
                <div className="flex justify-between text-slate-300">
                  <span>&gt; recurse(30)</span>
                  <span className="text-neon-red animate-pulse">Processing...</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>&gt; insert(node_29)</span>
                  <span className="text-cyber-purple">Allocated</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>&gt; recurse(29)</span>
                  <span>Done</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-800">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-neon-cyan/5"></div>
              <p className="text-neon-cyan text-xs font-medium mb-2 relative z-10">Optimization Available</p>
              <button className="w-full bg-neon-cyan text-black font-bold text-xs py-2 rounded hover:bg-cyan-300 transition-colors shadow-[0_0_10px_rgba(0,242,255,0.5)] relative z-10">
                Auto-Optimize Code
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

