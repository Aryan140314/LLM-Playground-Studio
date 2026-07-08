import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSimulation } from '../context/SimulationContext';
import { useTheme } from '../context/ThemeContext';
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
  ZapOff,
  Search,
  FileText,
  Scissors,
  BookOpen,
  Settings,
  Database,
  Layers,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarItem {
  name: string;
  section: 'PLAYGROUND' | 'RAG PIPELINE' | 'ANALYTICS';
  href: string;
  icon: React.ComponentType<any>;
}

const navigation: SidebarItem[] = [
  { name: 'Dashboard', section: 'PLAYGROUND', href: '/', icon: Home },
  { name: 'Chat Playground', section: 'PLAYGROUND', href: '/chat', icon: MessageSquare },
  { name: 'Prompt Lab', section: 'PLAYGROUND', href: '/prompt-lab', icon: Brain },
  { name: 'Tokenizer Explorer', section: 'PLAYGROUND', href: '/tokenizer', icon: Fingerprint },
  { name: 'Embedding Explorer', section: 'PLAYGROUND', href: '/embeddings', icon: Compass },
  { name: 'Search Explorer', section: 'PLAYGROUND', href: '/search', icon: Search },
  { name: 'Model Comparison', section: 'PLAYGROUND', href: '/compare', icon: Scale },
  
  { name: 'Document Manager', section: 'RAG PIPELINE', href: '/documents', icon: FileText },
  { name: 'Chunking Explorer', section: 'RAG PIPELINE', href: '/chunking', icon: Scissors },
  { name: 'Embedding Pipeline', section: 'RAG PIPELINE', href: '/embedding-pipeline', icon: Compass },
  { name: 'ChromaDB Indexing', section: 'RAG PIPELINE', href: '/indexing', icon: Database },
  { name: 'Retrieval Explorer', section: 'RAG PIPELINE', href: '/retrieval', icon: BookOpen },
  
  { name: 'Analytics Dashboard', section: 'ANALYTICS', href: '/analytics', icon: BarChart3 },
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { simulateApi, setSimulateApi } = useSimulation();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar Container */}
      <aside className={`w-64 border-r flex flex-col justify-between shrink-0 transition-colors duration-200 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/25">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              LLM STUDIO
            </span>
          </Link>
          
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-all duration-200 ${
              isDark 
                ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600 text-amber-400' 
                : 'bg-slate-100 border-slate-200 hover:border-slate-350 text-indigo-600'
            }`}
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-4 overflow-y-auto">
          {['PLAYGROUND', 'RAG PIPELINE', 'ANALYTICS'].map((section) => {
            const items = navigation.filter(n => n.section === section);
            return (
              <div key={section} className="space-y-1">
                <h4 className={`px-4 text-[10px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {section}
                </h4>
                {items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-205 ${
                        isActive
                          ? isDark
                            ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400 shadow-inner'
                            : 'bg-blue-50 border border-blue-200 text-blue-600 shadow-sm'
                          : isDark
                            ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 border border-transparent'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${
                        isActive 
                          ? 'text-blue-500' 
                          : isDark ? 'text-slate-400' : 'text-slate-500'
                      }`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer (API Simulation Toggle) */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-850 bg-slate-950/40' : 'border-slate-205 bg-slate-50'} space-y-3`}>
          <div className={`flex flex-col gap-2 p-3 border rounded-2xl ${
            isDark ? 'bg-slate-900/55 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                SIMULATION MODE
              </span>
              <span className={`inline-block h-2 w-2 rounded-full ${simulateApi ? 'bg-emerald-450 shadow-lg shadow-emerald-500/50 animate-pulse' : 'bg-rose-500'}`} />
            </div>
            
            <button
              onClick={() => setSimulateApi(!simulateApi)}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                simulateApi
                  ? isDark
                    ? 'bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/25'
                    : 'bg-emerald-50 border border-emerald-205 text-emerald-600 hover:bg-emerald-100'
                  : isDark
                    ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 border border-slate-205 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {simulateApi ? (
                <>
                  <Zap className="h-4 w-4 text-emerald-400 animate-pulse" />
                  Simulation Active
                </>
              ) : (
                <>
                  <ZapOff className="h-4 w-4 text-slate-400" />
                  Live API Mode
                </>
              )}
            </button>
          </div>
          
          <div className="text-[9px] text-center text-slate-500 font-semibold uppercase tracking-wider">
            v1.1.0 (RAG Enabled)
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0 transition-colors duration-200">
        <div className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
