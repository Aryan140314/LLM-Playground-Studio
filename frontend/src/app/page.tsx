'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Brain, 
  Fingerprint, 
  Compass, 
  Scale, 
  BarChart3,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface CardItem {
  title: string;
  desc: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  shadow: string;
}

const modules: CardItem[] = [
  {
    title: 'Chat Playground',
    desc: 'Interact with Google Gemini and inspect performance logs (latency, word counts, character sizes) on each request.',
    href: '/chat',
    icon: MessageSquare,
    color: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/10 hover:shadow-blue-500/20'
  },
  {
    title: 'Prompt Engineering Lab',
    desc: 'Test prompting strategies like Zero-Shot, Few-Shot, and Chain of Thought. Compare prompt construction effects.',
    href: '/prompt-lab',
    icon: Brain,
    color: 'from-purple-500 to-indigo-500',
    shadow: 'shadow-purple-500/10 hover:shadow-purple-500/20'
  },
  {
    title: 'Tokenizer Explorer',
    desc: 'Analyze subword segmentations. Compare GPT (BPE), BERT (WordPiece), and SentencePiece (Unigram) algorithms.',
    href: '/tokenizer',
    icon: Fingerprint,
    color: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/10 hover:shadow-emerald-500/20'
  },
  {
    title: 'Embedding Explorer',
    desc: 'Visualize sentence similarity matrices as heatmaps. Project high-dimensional vectors to 2D using PCA/t-SNE and run K-Means.',
    href: '/embeddings',
    icon: Compass,
    color: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/10 hover:shadow-amber-500/20'
  },
  {
    title: 'Model Comparison',
    desc: 'Prompt Gemini 2.5 Flash, GPT-4o-mini, and Claude 3.5 Sonnet side-by-side. Compare latency and output length.',
    href: '/compare',
    icon: Scale,
    color: 'from-pink-500 to-rose-500',
    shadow: 'shadow-pink-500/10 hover:shadow-pink-500/20'
  },
  {
    title: 'Analytics Dashboard',
    desc: 'Track performance telemetry across all client runs. Analyze average latencies, token counts, and strategy distributions.',
    href: '/analytics',
    icon: BarChart3,
    color: 'from-violet-500 to-purple-500',
    shadow: 'shadow-violet-500/10 hover:shadow-violet-500/20'
  }
];

export default function Page() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5" /> Next-Gen AI Studio
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-50 to-slate-300 bg-clip-text text-transparent">
            Welcome to LLM Playground Studio
          </h1>
          
          <p className="text-slate-400 text-lg leading-relaxed">
            A professional development playground designed to help you interact with, analyze, and learn today's core LLM APIs, prompt methodologies, tokenizers, and vector embeddings.
          </p>

          <div className="pt-2">
            <div className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-3">
              Get Started by Selecting a Module Below or in the Sidebar
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-200 tracking-wide px-1">
          Explore Learning Modules
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            
            return (
              <div 
                key={mod.title}
                className={`group relative overflow-hidden bg-slate-900 border border-slate-800/80 rounded-2xl p-6 transition-all duration-300 hover:border-slate-700 hover:-translate-y-1 shadow-lg ${mod.shadow}`}
              >
                <div className="space-y-4">
                  {/* Icon Block */}
                  <div className={`inline-block p-3 rounded-xl bg-gradient-to-r ${mod.color} text-white shadow-md`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  {/* Text Block */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors duration-200">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                  
                  {/* Action Link */}
                  <div className="pt-2">
                    <Link 
                      href={mod.href} 
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider transition-colors duration-200"
                    >
                      Open Module <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
