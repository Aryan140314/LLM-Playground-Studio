'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSimulation } from '../context/SimulationContext';
import { 
  Home, 
  MessageSquare, 
  Brain, 
  Fingerprint, 
  Compass, 
  Scale, 
  BarChart3, 
  Sparkles,
  Zap,
  ZapOff
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const navigation: SidebarItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Chat Playground', href: '/chat', icon: MessageSquare },
  { name: 'Prompt Lab', href: '/prompt-lab', icon: Brain },
  { name: 'Tokenizer Explorer', href: '/tokenizer', icon: Fingerprint },
  { name: 'Embedding Explorer', href: '/embeddings', icon: Compass },
  { name: 'Model Comparison', href: '/compare', icon: Scale },
  { name: 'Analytics Dashboard', href: '/analytics', icon: BarChart3 },
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { simulateApi, setSimulateApi } = useSimulation();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar Container */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col justify-between shrink-0">
        
        {/* Header */}
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/25">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              LLM STUDIO
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400 font-semibold shadow-inner'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (API Simulation Toggle) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex flex-col gap-2 p-3 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">
                SIMULATION MODE
              </span>
              <span className={`inline-block h-2 w-2 rounded-full ${simulateApi ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50 animate-pulse' : 'bg-rose-500'}`} />
            </div>
            
            <button
              onClick={() => setSimulateApi(!simulateApi)}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                simulateApi
                  ? 'bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/25 shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {simulateApi ? (
                <>
                  <Zap className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                  Simulation Active
                </>
              ) : (
                <>
                  <ZapOff className="h-4.5 w-4.5 text-slate-400" />
                  Live API Mode
                </>
              )}
            </button>
          </div>
          
          <div className="text-[10px] text-center text-slate-500 font-medium">
            LLM Playground Studio v1.0.0
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <div className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
