'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';

interface QuizQuestion {
  id: string;
  question: string;
  options: string; // JSON string
  correctAnswer: number;
  explanation: string;
}

interface Lecture {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  lessonId?: string;
  quiz?: QuizQuestion[];
}

interface Module {
  id: string;
  title: string;
  description?: string;
  lectures: Lecture[];
}

export default function LectureClient() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [completedLectureIds, setCompletedLectureIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Reset quiz state when lecture changes
  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  }, [selectedLecture?.id]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [lecturesRes, progressRes] = await Promise.all([
          fetch('/api/lectures'),
          fetch('/api/lectures/progress')
        ]);
        
        const lecturesData = await lecturesRes.json();
        const progressData = await progressRes.json();
        
        if (Array.isArray(lecturesData)) {
          setModules(lecturesData);
          
          const lessonIdParam = searchParams.get('id');
          
          if (lecturesData.length > 0) {
            let foundLecture = null;
            if (lessonIdParam) {
              for (const mod of lecturesData) {
                const lec = mod.lectures.find((l: Lecture) => l.lessonId === lessonIdParam || l.id === lessonIdParam);
                if (lec) {
                  foundLecture = lec;
                  break;
                }
              }
            }
            
            if (foundLecture) {
              setSelectedLecture(foundLecture);
            } else if (lecturesData[0].lectures && lecturesData[0].lectures.length > 0) {
              setSelectedLecture(lecturesData[0].lectures[0]);
            }
          }
        } else {
          console.error("Lectures data is not an array:", lecturesData);
          setModules([]);
        }
        
        setCompletedLectureIds(progressData.completedLectureIds || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [searchParams]);

  const handleSelectLecture = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    router.push(`/lecture?id=${lecture.lessonId || lecture.id}`);
  };

  const toggleComplete = async (lectureId: string) => {
    if (!session) return;
    
    const isCompleted = completedLectureIds.includes(lectureId);
    setIsUpdatingProgress(true);
    
    try {
      const res = await fetch('/api/lectures/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectureId, completed: !isCompleted })
      });
      
      if (res.ok) {
        setCompletedLectureIds(prev => 
          isCompleted 
            ? prev.filter(id => id !== lectureId)
            : [...prev, lectureId]
        );
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary font-black uppercase tracking-widest animate-pulse">Initializing Lecture Mode...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark text-white flex overflow-hidden font-display">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-border-dark bg-surface-darker/50 backdrop-blur-xl flex flex-col h-screen z-20"
          >
            <div className="p-6 border-b border-border-dark flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="size-8 bg-primary rounded flex items-center justify-center shadow-neon-sm group-hover:rotate-12 transition-transform">
                  <span className="material-symbols-outlined text-white text-lg">hub</span>
                </div>
                <span className="text-xl font-black tracking-tighter">DSAL <span className="text-primary">LECTURES</span></span>
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {Array.isArray(modules) && modules.map((module) => {
                const completedCount = module.lectures.filter(l => completedLectureIds.includes(l.id)).length;
                const totalCount = module.lectures.length;
                const allDone = completedCount === totalCount && totalCount > 0;
                return (
                <div key={module.id} className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{module.title}</h3>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      allDone ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-text-secondary'
                    }`}>
                      {completedCount}/{totalCount}
                    </span>
                  </div>
                  {totalCount > 0 && (
                    <div className="mx-2 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${(completedCount / totalCount) * 100}%` }}
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    {module.lectures.map((lecture) => (
                      <button
                        key={lecture.id}
                        onClick={() => handleSelectLecture(lecture)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group ${
                          selectedLecture?.id === lecture.id
                            ? 'bg-primary/20 border border-primary/30 text-white'
                            : 'hover:bg-white/5 border border-transparent text-text-secondary hover:text-white'
                        }`}
                      >
                        <div className={`size-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          completedLectureIds.includes(lecture.id)
                            ? 'bg-green-500/20 text-green-400'
                            : selectedLecture?.id === lecture.id
                              ? 'bg-primary text-white'
                              : 'bg-surface-dark text-text-secondary group-hover:bg-white/10'
                        }`}>
                          {completedLectureIds.includes(lecture.id) ? (
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          ) : (
                            lecture.order
                          )}
                        </div>
                        <span className="text-xs font-bold truncate">{lecture.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )})}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-border-dark bg-background-dark/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="size-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-secondary hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">{sidebarOpen ? 'menu_open' : 'menu'}</span>
            </button>
            <div className="h-4 w-px bg-border-dark"></div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white truncate max-w-md">
              {selectedLecture?.title || 'Select a Lecture'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {selectedLecture?.lessonId && (
              <Link href={`/ide/classic/${selectedLecture.lessonId}`}>
                <button className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">terminal</span>
                  Open in IDE
                </button>
              </Link>
            )}
            <Link href="/library">
              <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                Library
              </button>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background-dark">
          {selectedLecture ? (
            <div className="max-w-4xl mx-auto px-8 py-12 space-y-12">
              {/* Video Player */}
              {selectedLecture.videoUrl && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="aspect-video w-full rounded-3xl overflow-hidden border-2 border-border-dark shadow-2xl bg-black relative group"
                >
                  <iframe
                    src={getEmbedUrl(selectedLecture.videoUrl) || ''}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </motion.div>
              )}

              {/* Markdown Content */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="prose prose-invert prose-primary max-w-none"
              >
                <div className="markdown-body">
                  <ReactMarkdown>{selectedLecture.content}</ReactMarkdown>
                </div>
              </motion.div>

              {/* Lecture Notes Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 border border-border-dark flex items-center justify-between bg-surface-darker/50 p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/30 text-primary flex items-center justify-center shadow-inner">
                     <span className="material-symbols-outlined font-light text-[28px]">description</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1 shadow-sm">Lecture Overview & Notes</h4>
                    <p className="text-xs text-text-secondary font-medium">Download the complete supplementary PDF guide for this topic.</p>
                  </div>
                </div>
                <a
                  href={`/notes/${selectedLecture.lessonId?.includes('stack') ? 'stack' : selectedLecture.lessonId?.includes('bst') ? 'bst' : 'dsal'}-notes.pdf`}
                  download
                  className="bg-primary hover:bg-primary-dark text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 group shadow-neon-sm"
                >
                  <span className="material-symbols-outlined group-hover:scale-110 transition-transform">download</span>
                  Download PDF
                </a>
              </motion.div>

              {/* Quiz Section */}
              {selectedLecture.quiz && selectedLecture.quiz.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-16 pt-12 border-t border-border-dark"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                      <span className="material-symbols-outlined">quiz</span>
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-widest text-white">Knowledge Check</h3>
                  </div>

                  <div className="space-y-8">
                    {selectedLecture.quiz.map((q, qIndex) => {
                      const options = JSON.parse(q.options);
                      const selected = quizAnswers[q.id];
                      const isCorrect = selected === q.correctAnswer;
                      
                      return (
                        <div key={q.id} className="bg-surface-darker/50 border border-border-dark rounded-2xl p-8">
                          <p className="text-lg font-bold text-white mb-6">
                            <span className="text-accent mr-2">Q{qIndex + 1}.</span>
                            {q.question}
                          </p>
                          
                          <div className="space-y-3">
                            {options.map((opt: string, optIndex: number) => {
                              const isSelected = selected === optIndex;
                              let btnClass = "w-full text-left px-6 py-4 rounded-xl border transition-all flex items-center justify-between group ";
                              
                              if (quizSubmitted) {
                                if (optIndex === q.correctAnswer) {
                                  btnClass += "bg-green-500/20 border-green-500/50 text-green-400";
                                } else if (isSelected) {
                                  btnClass += "bg-red-500/20 border-red-500/50 text-red-400";
                                } else {
                                  btnClass += "bg-surface-dark border-transparent text-text-secondary opacity-50";
                                }
                              } else {
                                if (isSelected) {
                                  btnClass += "bg-accent/20 border-accent/50 text-white";
                                } else {
                                  btnClass += "bg-surface-dark border-transparent text-text-secondary hover:bg-white/5 hover:text-white";
                                }
                              }

                              return (
                                <button
                                  key={optIndex}
                                  disabled={quizSubmitted}
                                  onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIndex }))}
                                  className={btnClass}
                                >
                                  <span className="font-medium">{opt}</span>
                                  {quizSubmitted && optIndex === q.correctAnswer && (
                                    <span className="material-symbols-outlined text-green-400">check_circle</span>
                                  )}
                                  {quizSubmitted && isSelected && optIndex !== q.correctAnswer && (
                                    <span className="material-symbols-outlined text-red-400">cancel</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className={`mt-6 p-4 rounded-xl border ${isCorrect ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}
                            >
                              <p className="text-sm text-slate-300">
                                <span className={`font-bold mr-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                  {isCorrect ? 'Correct!' : 'Incorrect.'}
                                </span>
                                {q.explanation}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!quizSubmitted && (
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        disabled={Object.keys(quizAnswers).length !== selectedLecture.quiz.length}
                        className="bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-neon-sm"
                      >
                        Check Answers
                      </button>
                    </div>
                  )}

                  {/* Go to Experiment CTA — shown after quiz submit */}
                  {quizSubmitted && selectedLecture.lessonId && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-10 p-8 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 flex flex-col sm:flex-row items-center gap-6"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-base font-black text-white uppercase tracking-widest mb-1">Ready to Code It?</h4>
                        <p className="text-sm text-text-secondary">Apply what you learned in the interactive IDE — step through real code and watch the visualizer come alive.</p>
                      </div>
                      <Link href={`/ide/classic/${selectedLecture.lessonId}`}>
                        <button className="bg-primary hover:bg-primary/90 text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-neon-sm whitespace-nowrap">
                          <span className="material-symbols-outlined">play_arrow</span>
                          Open Experiment
                        </button>
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Mark as Complete Button */}
              {session && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={() => toggleComplete(selectedLecture.id)}
                    disabled={isUpdatingProgress}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                      completedLectureIds.includes(selectedLecture.id)
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                        : 'bg-primary hover:bg-primary/90 text-white shadow-neon-sm hover:shadow-neon-md'
                    } ${isUpdatingProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUpdatingProgress ? (
                      <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="material-symbols-outlined">
                        {completedLectureIds.includes(selectedLecture.id) ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    )}
                    {completedLectureIds.includes(selectedLecture.id) ? 'Completed ✓' : 'Mark as Complete'}
                  </button>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="pt-12 border-t border-border-dark flex items-center justify-between">
                {(() => {
                  const allLectures = modules.flatMap(m => m.lectures);
                  const currentIndex = allLectures.findIndex(l => l.id === selectedLecture.id);
                  const prevLecture = allLectures[currentIndex - 1];
                  const nextLecture = allLectures[currentIndex + 1];

                  return (
                    <>
                      {prevLecture ? (
                        <button 
                          onClick={() => handleSelectLecture(prevLecture)}
                          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors group"
                        >
                          <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                          <div className="flex flex-col items-start">
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Previous</span>
                            <span className="text-xs font-bold truncate max-w-[150px]">{prevLecture.title}</span>
                          </div>
                        </button>
                      ) : <div />}

                      {nextLecture ? (
                        <button 
                          onClick={() => handleSelectLecture(nextLecture)}
                          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors group text-right"
                        >
                          <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Next</span>
                            <span className="text-xs font-bold truncate max-w-[150px]">{nextLecture.title}</span>
                          </div>
                          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                      ) : <div />}
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-text-secondary font-black uppercase tracking-widest opacity-20 text-4xl">Select a Lecture</p>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .markdown-body {
          color: #cbd5e1;
          font-size: 1rem;
          line-height: 1.75;
        }
        .markdown-body h1 {
          font-size: 2.25rem;
          font-weight: 900;
          color: white;
          margin-top: 2rem;
          margin-bottom: 1rem;
          letter-spacing: -0.025em;
          text-transform: uppercase;
        }
        .markdown-body h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #7f13ec;
          margin-top: 2rem;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .markdown-body h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .markdown-body p {
          margin-bottom: 1.25rem;
        }
        .markdown-body ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .markdown-body li {
          margin-bottom: 0.5rem;
        }
        .markdown-body code {
          background: rgba(127, 19, 236, 0.1);
          color: #7f13ec;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: var(--font-mono);
          font-size: 0.875em;
        }
      `}</style>
    </div>
  );
}
