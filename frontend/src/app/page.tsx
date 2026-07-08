'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext';
import { 
  MessageSquare, 
  Brain, 
  Fingerprint, 
  Compass, 
  Scale, 
  BarChart3,
  ArrowRight,
  Sparkles,
  FileText,
  Scissors,
  Database,
  Layers,
  BookOpen,
  Puzzle,
  MessageCircle,
  Activity,
  Settings,
  Lock
} from 'lucide-react';

interface CardItem {
  title: string;
  desc: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  shadow: string;
  category: 'CORE PLAYGROUND' | 'RAG PIPELINE' | 'UPCOMING';
  locked?: boolean;
}

const modules: CardItem[] = [
  // PLAYGROUND
  {
    title: 'Chat Playground',
    desc: 'Interact with Google Gemini and inspect latency, word counts, and token stats in real-time.',
    href: '/chat',
    icon: MessageSquare,
    color: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/5 hover:shadow-blue-500/15',
    category: 'CORE PLAYGROUND'
  },
  {
    title: 'Prompt Engineering Lab',
    desc: 'Compare prompting designs like Zero-Shot, Few-Shot, and Chain of Thought side-by-side.',
    href: '/prompt-lab',
    icon: Brain,
    color: 'from-purple-500 to-indigo-500',
    shadow: 'shadow-purple-500/5 hover:shadow-purple-500/15',
    category: 'CORE PLAYGROUND'
  },
  {
    title: 'Tokenizer Explorer',
    desc: 'Analyze subword segmentations comparing BPE (GPT), WordPiece (BERT), and SentencePiece.',
    href: '/tokenizer',
    icon: Fingerprint,
    color: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/5 hover:shadow-emerald-500/15',
    category: 'CORE PLAYGROUND'
  },
  {
    title: 'Embedding Explorer',
    desc: 'Project high-dimensional vectors to 2D using PCA/t-SNE and visualize similarities.',
    href: '/embeddings',
    icon: Compass,
    color: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/5 hover:shadow-amber-500/15',
    category: 'CORE PLAYGROUND'
  },
  {
    title: 'Model Comparison',
    desc: 'Compare leading foundation models (Gemini, Claude, GPT) side-by-side on metrics.',
    href: '/compare',
    icon: Scale,
    color: 'from-pink-500 to-rose-500',
    shadow: 'shadow-pink-500/5 hover:shadow-pink-500/15',
    category: 'CORE PLAYGROUND'
  },

  // RAG PIPELINE
  {
    title: 'Document Manager',
    desc: 'Upload PDF, DOCX, TXT, or MD documents, segment pages, and analyze corpus size.',
    href: '/documents',
    icon: FileText,
    color: 'from-rose-500 to-orange-500',
    shadow: 'shadow-rose-500/5 hover:shadow-rose-500/15',
    category: 'RAG PIPELINE'
  },
  {
    title: 'Chunking Explorer',
    desc: 'Partition texts using Fixed-Size (character/token), Semantic, and Hierarchical splits.',
    href: '/chunking',
    icon: Scissors,
    color: 'from-orange-500 to-amber-500',
    shadow: 'shadow-orange-500/5 hover:shadow-orange-500/15',
    category: 'RAG PIPELINE'
  },
  {
    title: 'Embedding Pipeline',
    desc: 'Convert text chunks into 384-dimensional dense vectors and calculate generation latency.',
    href: '/embedding-pipeline',
    icon: Compass,
    color: 'from-amber-500 to-yellow-500',
    shadow: 'shadow-amber-500/5 hover:shadow-amber-500/15',
    category: 'RAG PIPELINE'
  },
  {
    title: 'ChromaDB Indexing',
    desc: 'Manage vector database collections and execute batch chunk ingestion pipelines.',
    href: '/indexing',
    icon: Database,
    color: 'from-emerald-500 to-green-500',
    shadow: 'shadow-emerald-500/5 hover:shadow-emerald-500/15',
    category: 'RAG PIPELINE'
  },
  {
    title: 'Retrieval Explorer',
    desc: 'Search indices semantically and extract matched chunks with Cosine Similarity scores.',
    href: '/retrieval',
    icon: BookOpen,
    color: 'from-cyan-500 to-blue-500',
    shadow: 'shadow-cyan-500/5 hover:shadow-cyan-500/15',
    category: 'RAG PIPELINE'
  },

  // UPCOMING WORK
  {
    title: 'Prompt Builder (Sprint 6)',
    desc: 'Inject retrieved document fragments into system instructions for LLM grounding preview.',
    href: '#',
    icon: Puzzle,
    color: 'from-slate-650 to-slate-750',
    shadow: '',
    category: 'UPCOMING',
    locked: true
  },
  {
    title: 'RAG Playground (Sprints 7 & 8)',
    desc: 'Run a full end-to-end RAG chat pipeline with citations referencing page numbers and similarities.',
    href: '#',
    icon: MessageCircle,
    color: 'from-slate-650 to-slate-750',
    shadow: '',
    category: 'UPCOMING',
    locked: true
  },
  {
    title: 'Retrieval Comparison (Sprint 9)',
    desc: 'Compare advanced retrieval models (Naive vs Hybrid vs HyDE vs Multi-Query) side-by-side.',
    href: '#',
    icon: Activity,
    color: 'from-slate-650 to-slate-750',
    shadow: '',
    category: 'UPCOMING',
    locked: true
  },
  {
    title: 'Evaluation Dashboard (Sprint 10)',
    desc: 'Automate RAGAS metrics measuring Faithfulness, Answer Relevancy, and Context Recall.',
    href: '#',
    icon: BarChart3,
    color: 'from-slate-650 to-slate-750',
    shadow: '',
    category: 'UPCOMING',
    locked: true
  }
];

export default function Page() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-12">
      {/* Hero Banner Section */}
      <section className={`relative overflow-hidden rounded-3xl border p-8 md:p-12 transition-all duration-300 ${
        isDark 
          ? 'bg-slate-900 border-slate-800 shadow-2xl' 
          : 'bg-white border-slate-200 shadow-md'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5" /> Next-Gen AI Studio
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${
            isDark 
              ? 'bg-gradient-to-r from-slate-50 via-slate-100 to-slate-350 bg-clip-text text-transparent' 
              : 'text-slate-900'
          }`}>
            Welcome to LLM Playground Studio
          </h1>
          
          <p className={`text-lg leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            An advanced playground designed to help you construct, analyze, and inspect language models, tokenizers, custom embedding mappings, vector databases, and Retrieval-Augmented Generation (RAG) loops.
          </p>

          <div className="pt-2">
            <div className="text-xs text-slate-500 font-bold tracking-wider uppercase mb-3">
              Explore your modules from the dashboard cards or the sidebar
            </div>
          </div>
        </div>
      </section>

      {/* Modules Sections */}
      {['CORE PLAYGROUND', 'RAG PIPELINE', 'UPCOMING'].map((cat) => {
        const catItems = modules.filter(m => m.category === cat);
        return (
          <section key={cat} className="space-y-6">
            <div className="border-b pb-3 flex items-center justify-between border-slate-800/20">
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-650'}`}>
                {cat}
              </h2>
              <span className="text-[10px] bg-slate-800/10 border border-slate-850 px-2 py-0.5 rounded text-slate-500 font-mono">
                {catItems.length} modules
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catItems.map((mod) => {
                const Icon = mod.icon;
                
                return (
                  <div 
                    key={mod.title}
                    className={`group relative overflow-hidden border rounded-2xl p-6 transition-all duration-300 ${
                      mod.locked
                        ? isDark
                          ? 'bg-slate-950/40 border-slate-900 opacity-60'
                          : 'bg-slate-50 border-slate-150 opacity-60'
                        : isDark
                        ? `bg-slate-900 border-slate-800/80 hover:border-slate-700 hover:-translate-y-1 shadow-lg ${mod.shadow}`
                        : `bg-white border-slate-200 hover:border-slate-300 hover:-translate-y-1 shadow-sm ${mod.shadow}`
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Icon Block */}
                      <div className={`inline-block p-3 rounded-xl ${
                        mod.locked 
                          ? 'bg-slate-800 text-slate-500' 
                          : `bg-gradient-to-r ${mod.color} text-white shadow-md`
                      }`}>
                        {mod.locked ? <Lock className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      
                      {/* Text Block */}
                      <div className="space-y-2">
                        <h3 className={`text-base font-bold transition-colors duration-200 ${
                          isDark 
                            ? 'text-slate-100 group-hover:text-blue-400' 
                            : 'text-slate-850 group-hover:text-blue-600'
                        }`}>
                          {mod.title}
                        </h3>
                        <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {mod.desc}
                        </p>
                      </div>
                      
                      {/* Action Link */}
                      <div className="pt-2">
                        {mod.locked ? (
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            Locked (Phase 3 Work)
                          </span>
                        ) : (
                          <Link 
                            href={mod.href} 
                            className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
                              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                            }`}
                          >
                            Open Explorer <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-200" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
