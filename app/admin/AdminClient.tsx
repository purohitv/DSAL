'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
};

export default function AdminClient({ user, stats, initialModules }: any) {
  const [modules, setModules] = useState(initialModules);
  const [activeTab, setActiveTab] = useState('overview'); // overview, modules, lectures

  // Module Form State
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [moduleOrder, setModuleOrder] = useState('');
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);

  // Lecture Form State
  const [editingLectureId, setEditingLectureId] = useState<string | null>(null);
  const [lectureModuleId, setLectureModuleId] = useState('');
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureContent, setLectureContent] = useState('');
  const [lectureVideoUrl, setLectureVideoUrl] = useState('');
  const [lectureOrder, setLectureOrder] = useState('');
  const [lectureLessonId, setLectureLessonId] = useState('');
  const [isSubmittingLecture, setIsSubmittingLecture] = useState(false);

  // Quiz Form State
  const [editingLectureForQuizzes, setEditingLectureForQuizzes] = useState<any>(null);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState(['', '', '', '']);
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState('');
  const [quizOrder, setQuizOrder] = useState('');
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingModule(true);
    try {
      const url = editingModuleId ? `/api/admin/modules/${editingModuleId}` : '/api/admin/modules';
      const method = editingModuleId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: moduleTitle,
          description: moduleDesc,
          order: parseInt(moduleOrder),
        }),
      });
      if (res.ok) {
        const savedModule = await res.json();
        if (editingModuleId) {
          setModules(modules.map((m: any) => m.id === editingModuleId ? { ...savedModule, lectures: m.lectures } : m).sort((a: any, b: any) => a.order - b.order));
          alert('Module updated successfully!');
        } else {
          setModules([...modules, { ...savedModule, lectures: [] }].sort((a: any, b: any) => a.order - b.order));
          alert('Module created successfully!');
        }
        setEditingModuleId(null);
        setModuleTitle('');
        setModuleDesc('');
        setModuleOrder('');
        setActiveTab('overview');
      } else {
        alert(`Failed to ${editingModuleId ? 'update' : 'create'} module`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setIsSubmittingModule(false);
    }
  };

  const handleCreateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLecture(true);
    try {
      const url = editingLectureId ? `/api/admin/lectures/${editingLectureId}` : '/api/admin/lectures';
      const method = editingLectureId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: lectureModuleId,
          title: lectureTitle,
          content: lectureContent,
          videoUrl: lectureVideoUrl,
          order: parseInt(lectureOrder),
          lessonId: lectureLessonId,
        }),
      });
      if (res.ok) {
        const savedLecture = await res.json();
        
        if (editingLectureId) {
          // Remove from old module if changed, add to new module
          setModules(modules.map((m: any) => {
            let newLectures = m.lectures.filter((l: any) => l.id !== editingLectureId);
            if (m.id === lectureModuleId) {
              newLectures = [...newLectures, savedLecture].sort((a: any, b: any) => a.order - b.order);
            }
            return { ...m, lectures: newLectures };
          }));
          alert('Lecture updated successfully!');
        } else {
          setModules(modules.map((m: any) => {
            if (m.id === lectureModuleId) {
              return {
                ...m,
                lectures: [...m.lectures, savedLecture].sort((a: any, b: any) => a.order - b.order)
              };
            }
            return m;
          }));
          alert('Lecture created successfully!');
        }
        
        setEditingLectureId(null);
        setLectureTitle('');
        setLectureContent('');
        setLectureVideoUrl('');
        setLectureOrder('');
        setLectureLessonId('');
        setActiveTab('overview');
      } else {
        alert(`Failed to ${editingLectureId ? 'update' : 'create'} lecture`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setIsSubmittingLecture(false);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this module? All associated lectures will also be deleted.')) return;
    try {
      const res = await fetch(`/api/admin/modules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setModules(modules.filter((m: any) => m.id !== id));
      } else {
        alert('Failed to delete module');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteLecture = async (id: string, moduleId: string) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;
    try {
      const res = await fetch(`/api/admin/lectures/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setModules(modules.map((m: any) => {
          if (m.id === moduleId) {
            return { ...m, lectures: m.lectures.filter((l: any) => l.id !== id) };
          }
          return m;
        }));
      } else {
        alert('Failed to delete lecture');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLectureForQuizzes) return;
    
    setIsSubmittingQuiz(true);
    try {
      const url = editingQuizId ? `/api/admin/quizzes/${editingQuizId}` : '/api/admin/quizzes';
      const method = editingQuizId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lectureId: editingLectureForQuizzes.id,
          question: quizQuestion,
          options: quizOptions,
          correctAnswer: quizCorrectAnswer,
          explanation: quizExplanation,
          order: parseInt(quizOrder) || 0,
        }),
      });

      if (res.ok) {
        const savedQuiz = await res.json();
        
        setModules(modules.map((m: any) => ({
          ...m,
          lectures: m.lectures.map((l: any) => {
            if (l.id === editingLectureForQuizzes.id) {
              let newQuizzes = l.quiz || [];
              if (editingQuizId) {
                newQuizzes = newQuizzes.map((q: any) => q.id === editingQuizId ? savedQuiz : q);
              } else {
                newQuizzes = [...newQuizzes, savedQuiz];
              }
              newQuizzes.sort((a: any, b: any) => a.order - b.order);
              return { ...l, quiz: newQuizzes };
            }
            return l;
          })
        })));

        // Update local state for the currently viewed lecture
        setEditingLectureForQuizzes((prev: any) => {
          let newQuizzes = prev.quiz || [];
          if (editingQuizId) {
            newQuizzes = newQuizzes.map((q: any) => q.id === editingQuizId ? savedQuiz : q);
          } else {
            newQuizzes = [...newQuizzes, savedQuiz];
          }
          newQuizzes.sort((a: any, b: any) => a.order - b.order);
          return { ...prev, quiz: newQuizzes };
        });

        alert(`Quiz ${editingQuizId ? 'updated' : 'created'} successfully!`);
        resetQuizForm();
      } else {
        alert(`Failed to ${editingQuizId ? 'update' : 'create'} quiz`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz question?')) return;
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`, { method: 'DELETE' });
      if (res.ok) {
        setModules(modules.map((m: any) => ({
          ...m,
          lectures: m.lectures.map((l: any) => {
            if (l.id === editingLectureForQuizzes.id) {
              return { ...l, quiz: l.quiz.filter((q: any) => q.id !== quizId) };
            }
            return l;
          })
        })));
        
        setEditingLectureForQuizzes((prev: any) => ({
          ...prev,
          quiz: prev.quiz.filter((q: any) => q.id !== quizId)
        }));
      } else {
        alert('Failed to delete quiz');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetQuizForm = () => {
    setEditingQuizId(null);
    setQuizQuestion('');
    setQuizOptions(['', '', '', '']);
    setQuizCorrectAnswer(0);
    setQuizExplanation('');
    setQuizOrder('');
  };

  const startEditQuiz = (quiz: any) => {
    setEditingQuizId(quiz.id);
    setQuizQuestion(quiz.question);
    setQuizOptions(JSON.parse(quiz.options));
    setQuizCorrectAnswer(quiz.correctAnswer);
    setQuizExplanation(quiz.explanation);
    setQuizOrder(quiz.order.toString());
  };

  const startManageQuizzes = (lec: any) => {
    setEditingLectureForQuizzes(lec);
    resetQuizForm();
    setActiveTab('quizzes');
  };

  const startEditModule = (mod: any) => {
    setEditingModuleId(mod.id);
    setModuleTitle(mod.title);
    setModuleDesc(mod.description);
    setModuleOrder(mod.order.toString());
    setActiveTab('modules');
  };

  const startEditLecture = (lec: any, moduleId: string) => {
    setEditingLectureId(lec.id);
    setLectureModuleId(moduleId);
    setLectureTitle(lec.title);
    setLectureContent(lec.content);
    setLectureVideoUrl(lec.videoUrl || '');
    setLectureOrder(lec.order.toString());
    setLectureLessonId(lec.lessonId);
    setActiveTab('lectures');
  };

  return (
    <div className="flex h-screen w-full bg-background-dark text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -64, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-64 bg-surface-darker border-r border-border-dark flex flex-col h-full shrink-0 z-20"
      >
        <div className="p-8 flex items-center gap-4">
          <div className="bg-red-500/20 p-3 rounded-2xl shadow-xl border border-red-500/30">
            <span className="material-symbols-outlined text-red-500 text-2xl font-black">admin_panel_settings</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-2xl font-black leading-none tracking-tighter">DSAL</h1>
            <p className="text-red-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Teacher Terminal</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2 scrollbar-hide">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group border-2 ${activeTab === 'overview' ? 'bg-red-500/10 border-red-500/30 text-white shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-transparent text-text-secondary hover:bg-surface-dark hover:text-white'}`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === 'overview' ? 'text-red-500' : 'group-hover:text-red-400'}`}>monitoring</span>
            <span className="text-base font-black tracking-tight">Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group border-2 ${activeTab === 'modules' ? 'bg-red-500/10 border-red-500/30 text-white shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-transparent text-text-secondary hover:bg-surface-dark hover:text-white'}`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === 'modules' ? 'text-red-500' : 'group-hover:text-red-400'}`}>view_module</span>
            <span className="text-base font-black tracking-tight">Manage Modules</span>
          </button>
          <button 
            onClick={() => setActiveTab('lectures')}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group border-2 ${activeTab === 'lectures' ? 'bg-red-500/10 border-red-500/30 text-white shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-transparent text-text-secondary hover:bg-surface-dark hover:text-white'}`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === 'lectures' ? 'text-red-500' : 'group-hover:text-red-400'}`}>play_lesson</span>
            <span className="text-base font-black tracking-tight">Manage Lectures</span>
          </button>
          <button 
            onClick={() => {
              if (modules.length > 0 && modules[0].lectures.length > 0) {
                startManageQuizzes(modules[0].lectures[0]);
              } else {
                setActiveTab('quizzes');
              }
            }}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group border-2 ${activeTab === 'quizzes' ? 'bg-red-500/10 border-red-500/30 text-white shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-transparent text-text-secondary hover:bg-surface-dark hover:text-white'}`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === 'quizzes' ? 'text-red-500' : 'group-hover:text-red-400'}`}>quiz</span>
            <span className="text-base font-black tracking-tight">Manage Quizzes</span>
          </button>
          
          <div className="mt-auto pt-6 border-t border-border-dark">
            <Link href="/dashboard" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-text-secondary hover:bg-surface-dark hover:text-white transition-all group border-2 border-transparent">
              <span className="material-symbols-outlined text-[24px] group-hover:text-primary">arrow_back</span>
              <span className="text-base font-black tracking-tight">Exit Admin</span>
            </Link>
          </div>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-dark to-background-dark">
        <header className="flex items-center justify-between px-8 py-6 bg-background-dark/80 backdrop-blur-xl border-b border-border-dark sticky top-0 z-30">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">System Administration</h2>
            <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1">Elevated Privileges Active</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-white leading-none">{user.name}</p>
              <p className="text-[10px] text-red-400 font-mono mt-1 uppercase tracking-tighter">Root Admin</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center overflow-hidden">
              {user.image ? (
                <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-black tracking-tighter text-red-500">{user.name?.charAt(0) || 'A'}</span>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Students', value: stats.totalUsers, icon: 'group', color: 'text-blue-400' },
                    { label: 'Total Lectures', value: stats.totalLectures, icon: 'library_books', color: 'text-primary' },
                    { label: 'Snippets Saved', value: stats.totalSnippets, icon: 'code', color: 'text-accent-mint' },
                    { label: 'Completions', value: stats.totalCompletions, icon: 'task_alt', color: 'text-green-400' },
                  ].map((stat, i) => (
                    <motion.div 
                      key={i} 
                      variants={itemVariants}
                      className="bg-surface-darker border-b-4 border-r-4 border-black/40 border border-border-dark rounded-3xl p-6 relative overflow-hidden"
                    >
                      <div className={`p-3 rounded-2xl bg-surface-dark border border-border-dark ${stat.color} shadow-inner w-max mb-4`}>
                        <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
                      </div>
                      <h3 className="text-5xl font-black text-white tracking-tighter italic">{stat.value}</h3>
                      <p className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] mt-2 leading-none">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-surface-darker border border-border-dark rounded-3xl p-8">
                  <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 border-b border-border-dark pb-4">Curriculum Structure</h3>
                  <div className="space-y-6">
                    {modules.map((mod: any) => (
                      <div key={mod.id} className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Module {mod.order}</span>
                            <h4 className="text-xl font-black text-white">{mod.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-mono text-text-secondary">{mod.lectures.length} Lectures</span>
                            <button onClick={() => startEditModule(mod)} className="p-2 text-text-secondary hover:text-blue-400 transition-colors bg-white/5 rounded-lg">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button onClick={() => handleDeleteModule(mod.id)} className="p-2 text-text-secondary hover:text-red-400 transition-colors bg-white/5 rounded-lg">
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary mb-4">{mod.description}</p>
                        <div className="space-y-2">
                          {mod.lectures.map((lec: any) => (
                            <div key={lec.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 group">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-text-secondary opacity-50">{lec.order}.</span>
                                <span className="text-sm font-bold text-slate-300">{lec.title}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-text-secondary bg-white/5 px-2 py-1 rounded">{lec.lessonId}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startManageQuizzes(lec)} className="p-1 text-text-secondary hover:text-green-400 transition-colors" title="Manage Quizzes">
                                    <span className="material-symbols-outlined text-[16px]">quiz</span>
                                  </button>
                                  <button onClick={() => startEditLecture(lec, mod.id)} className="p-1 text-text-secondary hover:text-blue-400 transition-colors" title="Edit Lecture">
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                  </button>
                                  <button onClick={() => handleDeleteLecture(lec.id, mod.id)} className="p-1 text-text-secondary hover:text-red-400 transition-colors" title="Delete Lecture">
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {mod.lectures.length === 0 && (
                            <div className="p-3 text-sm text-text-secondary italic">No lectures in this module yet.</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'modules' && (
              <motion.div 
                key="modules"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="max-w-2xl"
              >
                <div className="bg-surface-darker border border-border-dark rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">
                        {editingModuleId ? 'Edit Module' : 'Create New Module'}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {editingModuleId ? 'Update the details of this curriculum module.' : 'Add a new top-level category to the curriculum.'}
                      </p>
                    </div>
                    {editingModuleId && (
                      <button 
                        onClick={() => {
                          setEditingModuleId(null);
                          setModuleTitle('');
                          setModuleDesc('');
                          setModuleOrder('');
                        }}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                  
                  <form onSubmit={handleCreateModule} className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Module Title</label>
                      <input 
                        type="text" 
                        required
                        value={moduleTitle}
                        onChange={(e) => setModuleTitle(e.target.value)}
                        className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all font-medium"
                        placeholder="e.g., Advanced Graph Algorithms"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Description</label>
                      <textarea 
                        required
                        value={moduleDesc}
                        onChange={(e) => setModuleDesc(e.target.value)}
                        className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all font-medium min-h-[100px]"
                        placeholder="Brief description of the module contents..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Display Order</label>
                      <input 
                        type="number" 
                        required
                        value={moduleOrder}
                        onChange={(e) => setModuleOrder(e.target.value)}
                        className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all font-medium"
                        placeholder="e.g., 4"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSubmittingModule}
                      className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    >
                      {isSubmittingModule ? (editingModuleId ? 'Updating...' : 'Creating...') : (editingModuleId ? 'Update Module' : 'Create Module')}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'lectures' && (
              <motion.div 
                key="lectures"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="max-w-3xl"
              >
                <div className="bg-surface-darker border border-border-dark rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">
                        {editingLectureId ? 'Edit Lecture' : 'Create New Lecture'}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {editingLectureId ? 'Update the details of this lecture.' : 'Add a new lesson to an existing module.'}
                      </p>
                    </div>
                    {editingLectureId && (
                      <button 
                        onClick={() => {
                          setEditingLectureId(null);
                          setLectureTitle('');
                          setLectureContent('');
                          setLectureVideoUrl('');
                          setLectureOrder('');
                          setLectureLessonId('');
                        }}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                  
                  <form onSubmit={handleCreateLecture} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Parent Module</label>
                        <select 
                          required
                          value={lectureModuleId}
                          onChange={(e) => setLectureModuleId(e.target.value)}
                          className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all font-medium appearance-none"
                        >
                          <option value="">Select a module...</option>
                          {modules.map((mod: any) => (
                            <option key={mod.id} value={mod.id}>{mod.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Lesson ID (URL Slug)</label>
                        <input 
                          type="text" 
                          required
                          value={lectureLessonId}
                          onChange={(e) => setLectureLessonId(e.target.value)}
                          className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all font-medium"
                          placeholder="e.g., dijkstras-algorithm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Lecture Title</label>
                      <input 
                        type="text" 
                        required
                        value={lectureTitle}
                        onChange={(e) => setLectureTitle(e.target.value)}
                        className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all font-medium"
                        placeholder="e.g., Understanding Dijkstra's Algorithm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Content (Markdown)</label>
                      <textarea 
                        required
                        value={lectureContent}
                        onChange={(e) => setLectureContent(e.target.value)}
                        className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all font-mono text-sm min-h-[200px]"
                        placeholder="# Heading&#10;&#10;Write your lecture content here in Markdown..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Video URL (Optional)</label>
                        <input 
                          type="url" 
                          value={lectureVideoUrl}
                          onChange={(e) => setLectureVideoUrl(e.target.value)}
                          className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all font-medium"
                          placeholder="https://youtube.com/embed/..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Display Order</label>
                        <input 
                          type="number" 
                          required
                          value={lectureOrder}
                          onChange={(e) => setLectureOrder(e.target.value)}
                          className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all font-medium"
                          placeholder="e.g., 1"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmittingLecture}
                      className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    >
                      {isSubmittingLecture ? (editingLectureId ? 'Updating...' : 'Creating...') : (editingLectureId ? 'Update Lecture' : 'Create Lecture')}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'quizzes' && (
              <motion.div 
                key="quizzes"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="max-w-4xl"
              >
                {!editingLectureForQuizzes ? (
                  <div className="bg-surface-darker border border-border-dark rounded-3xl p-8 text-center">
                    <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">quiz</span>
                    <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">No Lecture Selected</h3>
                    <p className="text-text-secondary">Please select a lecture from the Overview tab to manage its quizzes.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="bg-surface-darker border border-border-dark rounded-3xl p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Managing Quizzes For</span>
                          <h3 className="text-2xl font-black text-white">{editingLectureForQuizzes.title}</h3>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {editingLectureForQuizzes.quiz && editingLectureForQuizzes.quiz.length > 0 ? (
                          editingLectureForQuizzes.quiz.map((q: any, idx: number) => {
                            const options = JSON.parse(q.options);
                            return (
                              <div key={q.id} className="bg-surface-dark border border-border-dark rounded-2xl p-6 relative group">
                                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEditQuiz(q)} className="p-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-blue-400 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                  </button>
                                  <button onClick={() => handleDeleteQuiz(q.id)} className="p-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-red-400 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                </div>
                                <div className="flex items-start gap-4">
                                  <span className="text-xl font-black text-accent-mint">Q{idx + 1}</span>
                                  <div className="flex-1">
                                    <p className="text-white font-medium mb-4">{q.question}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                      {options.map((opt: string, optIdx: number) => (
                                        <div key={optIdx} className={`p-3 rounded-xl border text-sm ${optIdx === q.correctAnswer ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-black/20 border-white/5 text-text-secondary'}`}>
                                          <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                                        </div>
                                      ))}
                                    </div>
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Explanation</span>
                                      <p className="text-sm text-slate-300">{q.explanation}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center p-8 bg-surface-dark rounded-2xl border border-border-dark border-dashed">
                            <p className="text-text-secondary italic">No quizzes added to this lecture yet.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-surface-darker border border-border-dark rounded-3xl p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">
                            {editingQuizId ? 'Edit Quiz Question' : 'Add New Quiz Question'}
                          </h3>
                        </div>
                        {editingQuizId && (
                          <button 
                            onClick={resetQuizForm}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>

                      <form onSubmit={handleCreateQuiz} className="space-y-6">
                        <div>
                          <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Question</label>
                          <textarea 
                            required
                            value={quizQuestion}
                            onChange={(e) => setQuizQuestion(e.target.value)}
                            className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all font-medium min-h-[80px]"
                            placeholder="What is the time complexity of..."
                          />
                        </div>

                        <div className="space-y-4">
                          <label className="block text-xs font-black text-text-secondary uppercase tracking-widest">Options & Correct Answer</label>
                          {quizOptions.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <button
                                type="button"
                                onClick={() => setQuizCorrectAnswer(idx)}
                                className={`shrink-0 size-8 rounded-full flex items-center justify-center transition-all ${quizCorrectAnswer === idx ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-surface-dark border border-border-dark text-text-secondary hover:bg-white/5'}`}
                              >
                                <span className="material-symbols-outlined text-[16px]">{quizCorrectAnswer === idx ? 'check' : ''}</span>
                              </button>
                              <input 
                                type="text" 
                                required
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...quizOptions];
                                  newOpts[idx] = e.target.value;
                                  setQuizOptions(newOpts);
                                }}
                                className={`flex-1 bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all font-medium ${quizCorrectAnswer === idx ? 'border-green-500/50 focus:ring-1 focus:ring-green-500/20' : 'border-border-dark focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20'}`}
                                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                              />
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Explanation (Shown after answering)</label>
                          <textarea 
                            required
                            value={quizExplanation}
                            onChange={(e) => setQuizExplanation(e.target.value)}
                            className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all font-medium min-h-[80px]"
                            placeholder="This is correct because..."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Display Order</label>
                          <input 
                            type="number" 
                            required
                            value={quizOrder}
                            onChange={(e) => setQuizOrder(e.target.value)}
                            className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all font-medium"
                            placeholder="e.g., 1"
                          />
                        </div>

                        <button 
                          type="submit" 
                          disabled={isSubmittingQuiz}
                          className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                        >
                          {isSubmittingQuiz ? (editingQuizId ? 'Updating...' : 'Creating...') : (editingQuizId ? 'Update Quiz Question' : 'Add Quiz Question')}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
