'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export default function DashboardClient({ user, snippets, stats, modules }: any) {
  const overallProgress = stats.totalLectures > 0 
    ? Math.round((stats.completedLectures / stats.totalLectures) * 100) 
    : 0;

  return (
    <div className="flex h-screen w-full bg-background-dark text-white overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -64, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-64 bg-surface-darker border-r border-border-dark flex flex-col h-full shrink-0 z-20"
      >
        <div className="p-8 flex items-center gap-4">
          <Link href="/" className="group flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 180 }}
              className="bg-gradient-to-br from-primary to-secondary p-3 rounded-2xl shadow-xl cursor-pointer"
            >
              <img src="/dsal-logo.png" alt="DSAL Logo" className="w-6 h-6 object-contain" />
            </motion.div>
            <div className="flex flex-col">
              <h1 className="text-white text-2xl font-black leading-none tracking-tighter group-hover:text-primary transition-colors italic uppercase">DSAL</h1>
              <p className="text-text-secondary text-xs font-black uppercase tracking-[0.2em] mt-2 opacity-60">Dashboard</p>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2 scrollbar-hide">
          <div className="mb-6">
            <p className="px-4 text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-4 opacity-40">Main Terminal</p>
            <Link className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-primary/10 border-2 border-primary/30 text-white shadow-[0_0_30px_rgba(127,19,236,0.15)] transition-all group relative overflow-hidden mb-2" href="/dashboard">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="material-symbols-outlined text-[24px] text-primary relative z-10">dashboard</span>
              <span className="text-base font-black relative z-10 tracking-tight">Command Center</span>
            </Link>
            <Link className="flex items-center gap-4 px-5 py-4 rounded-2xl text-text-secondary hover:bg-surface-dark hover:text-white hover:translate-x-2 transition-all group border-2 border-transparent hover:border-white/5" href="/library">
              <span className="material-symbols-outlined text-[24px] group-hover:text-blue-400 transition-colors">database</span>
              <span className="text-base font-bold tracking-tight">Algorithm Registry</span>
            </Link>
            <Link className="flex items-center gap-4 px-5 py-4 rounded-2xl text-text-secondary hover:bg-surface-dark hover:text-white hover:translate-x-2 transition-all group border-2 border-transparent hover:border-white/5" href="/lecture">
              <span className="material-symbols-outlined text-[24px] group-hover:text-lecture-primary transition-colors">podium</span>
              <span className="text-base font-bold tracking-tight">Lecture Theatre</span>
            </Link>
            <Link className="flex items-center gap-4 px-5 py-4 rounded-2xl text-text-secondary hover:bg-surface-dark hover:text-white hover:translate-x-2 transition-all group border-2 border-transparent hover:border-white/5" href="/analysis">
              <span className="material-symbols-outlined text-[24px] group-hover:text-accent-mint transition-colors">query_stats</span>
              <span className="text-base font-bold tracking-tight">Complexity Lab</span>
            </Link>
            <Link className="flex items-center gap-4 px-5 py-4 rounded-2xl text-text-secondary hover:bg-surface-dark hover:text-white hover:translate-x-2 transition-all group border-2 border-transparent hover:border-white/5" href="/learning-path">
              <span className="material-symbols-outlined text-[24px] group-hover:text-pink-400 transition-colors">timeline</span>
              <span className="text-base font-bold tracking-tight">Evolution Path</span>
            </Link>
            {user.role === 'ADMIN' && (
              <Link className="flex items-center gap-4 px-5 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:translate-x-2 transition-all group border-2 border-transparent hover:border-red-500/30 mt-2" href="/admin">
                <span className="material-symbols-outlined text-[24px] group-hover:text-red-400 transition-colors">admin_panel_settings</span>
                <span className="text-base font-bold tracking-tight">Teacher Terminal</span>
              </Link>
            )}
          </div>

          <div className="mt-6">
            <p className="px-4 text-[11px] font-black text-secondary uppercase tracking-[0.3em] mb-4 opacity-40">Simulation Modules</p>
            <div className="space-y-2">
              {[
                { name: 'Stack Data Structure', href: '/ide/stack/1', icon: 'layers', color: 'text-blue-400' },
                { name: 'Binary Search Tree', href: '/ide/classic/bst-insertion', icon: 'account_tree', color: 'text-secondary' },
                { name: 'Red-Black Tree', href: '/ide/bst/2', icon: 'park', color: 'text-accent-mint' },
                { name: 'AVL Tree', href: '/ide/bst/3', icon: 'nature', color: 'text-indigo-400' },
                { name: 'Quantum Search', href: '/ide/quantum/grovers-search', icon: 'vibration', color: 'text-pink-400' },
              ].map((item) => (
                <Link key={item.href} className="flex items-center gap-4 px-5 py-3 rounded-2xl text-text-secondary hover:bg-surface-dark hover:text-white transition-all group border-2 border-transparent hover:border-white/10" href={item.href}>
                  <span className={`material-symbols-outlined text-[22px] ${item.color} opacity-70 group-hover:opacity-100 transition-opacity`}>{item.icon}</span>
                  <span className="text-sm font-black tracking-tight uppercase">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-border-dark bg-surface-dark/30 space-y-4">
          <div className="bg-black/40 rounded-xl p-3 border border-border-dark">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">System Load</span>
              <span className="text-[10px] font-mono text-accent-mint">Optimal</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '24%' }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                className="h-full bg-accent-mint animate-pulse"
              ></motion.div>
            </div>
          </div>
          <Link href="/">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/30 text-text-secondary hover:text-red-400"
            >
              <span className="material-symbols-outlined text-[20px]">power_settings_new</span>
              <span className="text-sm font-bold tracking-tight">Terminate Session</span>
            </motion.button>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-dark to-background-dark"
      >
        <header className="flex items-center justify-between px-8 py-6 bg-background-dark/80 backdrop-blur-xl border-b border-border-dark sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 40 }}
              className="w-1 bg-primary rounded-full hidden md:block"
            ></motion.div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Architect Terminal</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-accent-mint animate-pulse"></span>
                <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">Session Active: 02:45:12</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Search algorithms, modules, or code..." 
                className="bg-black/40 border border-border-dark rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all w-80 font-medium"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40">
                <span className="text-[10px] font-mono border border-border-dark px-1 rounded">⌘</span>
                <span className="text-[10px] font-mono border border-border-dark px-1 rounded">K</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-xl bg-surface-darker border border-border-dark flex items-center justify-center text-text-secondary hover:text-white hover:border-primary/30 transition-all relative group"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">notifications</span>
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full"></span>
              </motion.button>
              <div className="h-8 w-px bg-border-dark mx-1"></div>
              <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white leading-none">{user.name}</p>
                  <p className={`text-[10px] font-mono mt-1 uppercase tracking-tighter ${user.role === 'ADMIN' ? 'text-red-400' : 'text-text-secondary'}`}>
                    {user.role === 'ADMIN' ? 'Root Admin' : 'Student'}
                  </p>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className={`w-10 h-10 rounded-xl p-[1px] group-hover:shadow-[0_0_15px_rgba(127,19,236,0.3)] transition-all ${user.role === 'ADMIN' ? 'bg-red-500/50' : 'bg-gradient-to-br from-primary to-secondary'}`}
                >
                  <div className="w-full h-full bg-surface-darker rounded-xl flex items-center justify-center overflow-hidden">
                    {user.image ? (
                      <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-black tracking-tighter">{user.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-8 max-w-7xl mx-auto space-y-10"
        >
          {/* Stats Row - Brutalist Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Lectures Mastered', value: stats.completedLectures.toString(), trend: `${overallProgress}%`, icon: 'psychology', color: 'text-primary' },
              { label: 'Total Snippets', value: stats.totalSnippets.toString(), unit: '', trend: 'Saved', icon: 'terminal', color: 'text-secondary' },
              { label: 'Overall Progress', value: overallProgress.toString(), unit: '%', trend: 'Verified', icon: 'timeline', color: 'text-accent-mint' },
              { label: 'Global Rank', value: '128', unit: 'th', trend: 'Rising', icon: 'trophy', color: 'text-yellow-500' },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ y: -8, borderColor: 'rgba(127,19,236,0.5)', scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-surface-darker border-b-8 border-r-8 border-black/40 border border-border-dark rounded-3xl p-8 relative overflow-hidden group transition-all shadow-2xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl bg-surface-dark border border-border-dark ${stat.color} shadow-inner`}>
                    <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1">Trend</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${stat.color}`}>{stat.trend}</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-6xl font-black text-white tracking-tighter italic">{stat.value}</h3>
                  {stat.unit && <span className="text-2xl font-black text-text-secondary uppercase italic">{stat.unit}</span>}
                </div>
                <p className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] mt-4 leading-none">{stat.label}</p>
                <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12">
                  <span className="material-symbols-outlined text-[160px]">{stat.icon}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Dashboard Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Current Project Card */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-br from-primary/20 via-surface-darker to-surface-darker border-b-8 border-r-8 border-black/40 border border-primary/30 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] -mr-48 -mt-48 animate-pulse"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-primary text-[10px] font-black text-white uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-primary/20">Curriculum Progress</span>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-mint animate-ping"></span>
                        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">DSAL CORE</span>
                      </div>
                    </div>
                    <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-[0.9] uppercase italic">
                      Algorithm <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent-mint">Mastery</span>
                    </h3>
                    <p className="text-text-secondary max-w-lg text-base leading-relaxed font-medium opacity-80">
                      You have completed {stats.completedLectures} out of {stats.totalLectures} lectures. Keep up the great work and continue exploring complex data structures!
                    </p>
                    <div className="flex items-center gap-6 pt-4">
                      <Link href="/lecture">
                        <motion.button 
                          whileHover={{ scale: 1.05, x: 5 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-10 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-white transition-all shadow-2xl border-b-4 border-r-4 border-black/20"
                        >
                          Resume Lectures
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                  <div className="w-56 h-56 relative shrink-0 group-hover:scale-105 transition-transform duration-700">
                    <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_30px_rgba(127,19,236,0.3)]" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
                      <motion.circle 
                        cx="50" cy="50" r="45" fill="none" 
                        stroke="url(#grad)" strokeWidth="10" 
                        strokeDasharray="282.7" 
                        initial={{ strokeDashoffset: 282.7 }}
                        animate={{ strokeDashoffset: 282.7 * (1 - (overallProgress / 100)) }}
                        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                        strokeLinecap="round" 
                      />
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#7f13ec" />
                          <stop offset="100%" stopColor="#d913ec" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-white tracking-tighter italic">{overallProgress}%</span>
                      <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] mt-1">Status</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Launch - Grid Style */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    Quick Launch
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'Stack Data Structure', desc: 'LIFO logic', href: '/ide/stack/1', icon: 'layers', color: 'blue-400' },
                    { name: 'Red-Black Tree', desc: 'Self-balancing logic', href: '/ide/bst/2', icon: 'park', color: 'accent-mint' },
                    { name: 'Complexity Lab', desc: 'Big O & Metrics', href: '/analysis', icon: 'query_stats', color: 'secondary' },
                    { name: 'Evolution Path', desc: 'Classical to Quantum', href: '/learning-path', icon: 'timeline', color: 'pink-500' },
                  ].map((item, i) => (
                    <motion.div key={i} variants={itemVariants}>
                      <Link href={item.href} className="group flex items-center gap-4 p-4 bg-surface-darker border border-border-dark rounded-2xl hover:border-white/20 transition-all hover:bg-surface-dark">
                        <div className={`w-12 h-12 rounded-xl bg-${item.color}/10 flex items-center justify-center text-${item.color} group-hover:scale-110 transition-transform`}>
                          <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-white leading-none mb-1">{item.name}</h4>
                          <p className="text-[10px] text-text-secondary uppercase tracking-wider">{item.desc}</p>
                        </div>
                        <span className="material-symbols-outlined text-text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">chevron_right</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-8">
              {/* Lecture Mode Widget */}
              <motion.div 
                variants={itemVariants}
                className="bg-lecture-panel border border-lecture-border rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(236,19,19,0.1),transparent_70%)]"></div>
                <div className="w-16 h-16 rounded-2xl bg-lecture-primary/20 flex items-center justify-center text-lecture-primary mb-4 relative z-10 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">presentation_chart</span>
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 relative z-10">Lecture Theatre</h3>
                <p className="text-xs text-text-secondary mb-6 relative z-10 leading-relaxed">Present complex algorithms with live annotations and frame-by-step control.</p>
                <Link href="/lecture" className="w-full relative z-10">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl bg-lecture-primary text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-[0_10px_20px_rgba(236,19,19,0.2)]"
                  >
                    Go Live
                  </motion.button>
                </Link>
              </motion.div>

              {/* Recent Activity - Timeline Style */}
              <motion.div 
                variants={itemVariants}
                className="bg-surface-darker border border-border-dark rounded-3xl p-6"
              >
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-border-dark pb-4">Recent Snippets</h3>
                <div className="space-y-6 relative">
                  <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border-dark"></div>
                  {snippets.length === 0 ? (
                    <div className="text-text-secondary text-sm italic pl-14">No snippets saved yet.</div>
                  ) : snippets.map((snippet: any, i: number) => (
                    <div key={snippet.id} className="flex gap-4 relative z-10">
                      <div className={`w-10 h-10 rounded-full bg-surface-dark border border-border-dark flex items-center justify-center text-primary shrink-0 shadow-xl`}>
                        <span className="material-symbols-outlined text-[18px]">terminal</span>
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-xs font-bold text-white leading-tight">{snippet.title}</p>
                        <p className="text-[10px] text-text-secondary font-mono mt-1 uppercase">{formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })} • {snippet.language}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/library">
                  <button className="w-full mt-8 py-2 text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-white transition-colors border border-dashed border-border-dark rounded-xl">
                    View Library
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}
