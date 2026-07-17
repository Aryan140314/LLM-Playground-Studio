'use client';

import React, { useState, useEffect } from 'react';
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
  Database,
  Sun,
  Moon,
  Puzzle,
  MessageCircle,
  Activity,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Shield,
  ClipboardCheck
} from 'lucide-react';

interface SidebarItem {
  name: string;
  section: 'PLAYGROUND' | 'RAG PIPELINE' | 'ANALYTICS';
  href: string;
  icon: React.ComponentType<any>;
  color: string;
}

const navigation: SidebarItem[] = [
  { name: 'Dashboard', section: 'PLAYGROUND', href: '/', icon: Home, color: '#4f8ef7' },
  { name: 'Chat Playground', section: 'PLAYGROUND', href: '/chat', icon: MessageSquare, color: '#06b6d4' },
  { name: 'Prompt Lab', section: 'PLAYGROUND', href: '/prompt-lab', icon: Brain, color: '#a855f7' },
  { name: 'Tokenizer Explorer', section: 'PLAYGROUND', href: '/tokenizer', icon: Fingerprint, color: '#00e5a0' },
  { name: 'Embedding Explorer', section: 'PLAYGROUND', href: '/embeddings', icon: Compass, color: '#f59e0b' },
  { name: 'Search Explorer', section: 'PLAYGROUND', href: '/search', icon: Search, color: '#f43f5e' },
  { name: 'Model Comparison', section: 'PLAYGROUND', href: '/compare', icon: Scale, color: '#ec4899' },

  { name: 'Document Manager', section: 'RAG PIPELINE', href: '/documents', icon: FileText, color: '#f43f5e' },
  { name: 'Chunking Explorer', section: 'RAG PIPELINE', href: '/chunking', icon: Scissors, color: '#f97316' },
  { name: 'Embedding Pipeline', section: 'RAG PIPELINE', href: '/embedding-pipeline', icon: Compass, color: '#eab308' },
  { name: 'ChromaDB Indexing', section: 'RAG PIPELINE', href: '/indexing', icon: Database, color: '#22c55e' },
  { name: 'Retrieval Explorer', section: 'RAG PIPELINE', href: '/retrieval', icon: BookOpen, color: '#06b6d4' },
  { name: 'Prompt Builder', section: 'RAG PIPELINE', href: '/prompt-builder', icon: Puzzle, color: '#6c63ff' },
  { name: 'RAG Playground', section: 'RAG PIPELINE', href: '/rag-playground', icon: MessageCircle, color: '#ec4899' },
  { name: 'Retrieval Compare', section: 'RAG PIPELINE', href: '/compare-retrieval', icon: Activity, color: '#00e5a0' },

  { name: 'Analytics Dashboard', section: 'ANALYTICS', href: '/analytics', icon: BarChart3, color: '#4f8ef7' },
  { name: 'Evaluation Dashboard', section: 'ANALYTICS', href: '/evaluation', icon: ClipboardCheck, color: '#a855f7' },
];

const sectionMeta = {
  'PLAYGROUND': { label: 'Playground', barClass: 'section-bar-blue', badge: 'Phase 1' },
  'RAG PIPELINE': { label: 'RAG Pipeline', barClass: 'section-bar-indigo', badge: 'Phase 2' },
  'ANALYTICS': { label: 'Analytics', barClass: 'section-bar-emerald', badge: 'Live' },
};

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { simulateApi, setSimulateApi } = useSimulation();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const isDark = theme === 'dark';

  // Persist sidebar state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: isDark ? 'var(--bg-primary)' : '#f0f4ff' }}
    >
      {/* Animated background orbs */}
      {isDark && (
        <div className="gradient-mesh pointer-events-none" aria-hidden="true" />
      )}

      {/* ========================
          SIDEBAR
          ======================== */}
      <aside
        style={{
          width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          background: isDark ? 'rgba(10, 14, 30, 0.96)' : 'rgba(248, 250, 255, 0.98)',
          borderRight: isDark ? '1px solid rgba(79, 142, 247, 0.1)' : '1px solid rgba(79, 142, 247, 0.12)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 20,
        }}
      >
        {/* Sidebar top highlight line */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(79,142,247,0.5), rgba(108,99,255,0.5), transparent)',
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: collapsed ? '20px 14px' : '20px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: 10,
            borderBottom: isDark ? '1px solid rgba(79,142,247,0.08)' : '1px solid rgba(79,142,247,0.1)',
          }}
        >
          {!collapsed && (
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #4f8ef7, #6c63ff)',
                  padding: 9,
                  borderRadius: 12,
                  display: 'flex',
                  boxShadow: '0 0 20px rgba(79,142,247,0.4)',
                }}
              >
                <Sparkles style={{ width: 18, height: 18, color: '#fff' }} />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 13,
                    letterSpacing: '0.08em',
                    background: 'linear-gradient(135deg, #4f8ef7 0%, #6c63ff 60%, #00e5a0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  LLM STUDIO
                </div>
                <div style={{ fontSize: 9, color: '#4a5280', letterSpacing: '0.1em', fontWeight: 600 }}>
                  AI PLAYGROUND
                </div>
              </div>
            </Link>
          )}

          {collapsed && (
            <div
              style={{
                background: 'linear-gradient(135deg, #4f8ef7, #6c63ff)',
                padding: 9,
                borderRadius: 12,
                display: 'flex',
                boxShadow: '0 0 20px rgba(79,142,247,0.4)',
              }}
            >
              <Sparkles style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
          )}

          {!collapsed && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={toggleTheme}
                title="Toggle theme"
                style={{
                  padding: 7,
                  borderRadius: 9,
                  border: isDark ? '1px solid rgba(79,142,247,0.15)' : '1px solid rgba(79,142,247,0.2)',
                  background: isDark ? 'rgba(79,142,247,0.06)' : 'rgba(79,142,247,0.08)',
                  cursor: 'pointer',
                  display: 'flex',
                  color: isDark ? '#f59e0b' : '#6c63ff',
                  transition: 'all 0.2s',
                }}
              >
                {isDark
                  ? <Sun style={{ width: 14, height: 14 }} />
                  : <Moon style={{ width: 14, height: 14 }} />
                }
              </button>

              <button
                onClick={toggleCollapse}
                title="Collapse sidebar"
                style={{
                  padding: 7,
                  borderRadius: 9,
                  border: isDark ? '1px solid rgba(79,142,247,0.15)' : '1px solid rgba(79,142,247,0.2)',
                  background: isDark ? 'rgba(79,142,247,0.06)' : 'rgba(79,142,247,0.08)',
                  cursor: 'pointer',
                  display: 'flex',
                  color: isDark ? '#8b95b8' : '#4a5280',
                  transition: 'all 0.2s',
                }}
              >
                <ChevronLeft style={{ width: 14, height: 14 }} />
              </button>
            </div>
          )}
        </div>

        {/* Expand button (when collapsed) */}
        {collapsed && (
          <div style={{ padding: '10px 14px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              style={{
                padding: 8,
                borderRadius: 9,
                border: isDark ? '1px solid rgba(79,142,247,0.15)' : '1px solid rgba(79,142,247,0.2)',
                background: isDark ? 'rgba(79,142,247,0.06)' : 'rgba(79,142,247,0.08)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                color: isDark ? '#f59e0b' : '#6c63ff',
              }}
            >
              {isDark ? <Sun style={{ width: 14, height: 14 }} /> : <Moon style={{ width: 14, height: 14 }} />}
            </button>
            <button
              onClick={toggleCollapse}
              title="Expand sidebar"
              style={{
                padding: 8,
                borderRadius: 9,
                border: isDark ? '1px solid rgba(79,142,247,0.15)' : '1px solid rgba(79,142,247,0.2)',
                background: isDark ? 'rgba(79,142,247,0.06)' : 'rgba(79,142,247,0.08)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                color: isDark ? '#8b95b8' : '#4a5280',
              }}
            >
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: collapsed ? '12px 10px' : '12px 12px', overflowY: 'auto', overflowX: 'hidden' }}>
          {(['PLAYGROUND', 'RAG PIPELINE', 'ANALYTICS'] as const).map((section) => {
            const meta = sectionMeta[section];
            const items = navigation.filter(n => n.section === section);

            return (
              <div key={section} style={{ marginBottom: collapsed ? 16 : 20 }}>
                {/* Section header */}
                {!collapsed && (
                  <div
                    className={`section-bar ${meta.barClass}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                      paddingBottom: 4,
                    }}
                  >
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: isDark ? '#4a5280' : '#8b95b8',
                    }}>
                      {meta.label}
                    </span>
                    <span style={{
                      fontSize: 8,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 99,
                      background: isDark ? 'rgba(79,142,247,0.1)' : 'rgba(79,142,247,0.12)',
                      border: '1px solid rgba(79,142,247,0.2)',
                      color: '#4f8ef7',
                      letterSpacing: '0.06em',
                    }}>
                      {meta.badge}
                    </span>
                  </div>
                )}

                {/* Nav items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        title={collapsed ? item.name : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: collapsed ? 0 : 10,
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          padding: collapsed ? '9px' : '8px 10px',
                          borderRadius: 10,
                          textDecoration: 'none',
                          fontSize: 12,
                          fontWeight: 500,
                          letterSpacing: '0.01em',
                          transition: 'all 0.2s ease',
                          border: isActive
                            ? '1px solid rgba(79,142,247,0.3)'
                            : '1px solid transparent',
                          background: isActive
                            ? 'linear-gradient(135deg, rgba(79,142,247,0.1), rgba(108,99,255,0.07))'
                            : 'transparent',
                          color: isActive
                            ? '#4f8ef7'
                            : isDark ? '#8b95b8' : '#4a5280',
                          boxShadow: isActive
                            ? '0 0 12px rgba(79,142,247,0.08), inset 0 1px 0 rgba(255,255,255,0.03)'
                            : 'none',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = isDark
                              ? 'rgba(79,142,247,0.06)'
                              : 'rgba(79,142,247,0.06)';
                            e.currentTarget.style.color = isDark ? '#e8eaf6' : '#1a1f3a';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = isDark ? '#8b95b8' : '#4a5280';
                          }
                        }}
                      >
                        {/* Icon with color dot */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <Icon style={{
                            width: 15,
                            height: 15,
                            color: isActive ? item.color : 'currentColor',
                            transition: 'color 0.2s',
                          }} />
                          {isActive && (
                            <div style={{
                              position: 'absolute',
                              inset: -3,
                              borderRadius: 6,
                              background: item.color,
                              opacity: 0.12,
                              filter: 'blur(4px)',
                            }} />
                          )}
                        </div>

                        {!collapsed && (
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </span>
                        )}

                        {/* Active bar */}
                        {isActive && !collapsed && (
                          <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 3,
                            height: 16,
                            borderRadius: 99,
                            background: item.color,
                            boxShadow: `0 0 8px ${item.color}`,
                          }} />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{
          padding: collapsed ? '12px 10px' : '12px 14px',
          borderTop: isDark ? '1px solid rgba(79,142,247,0.08)' : '1px solid rgba(79,142,247,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {/* Simulation Toggle */}
          <button
            onClick={() => setSimulateApi(!simulateApi)}
            title={simulateApi ? 'Simulation Mode Active' : 'Live API Mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              gap: 8,
              padding: collapsed ? '9px' : '9px 12px',
              borderRadius: 10,
              border: simulateApi
                ? '1px solid rgba(0,229,160,0.25)'
                : isDark ? '1px solid rgba(79,142,247,0.15)' : '1px solid rgba(79,142,247,0.2)',
              background: simulateApi
                ? 'rgba(0,229,160,0.07)'
                : isDark ? 'rgba(79,142,247,0.05)' : 'rgba(79,142,247,0.06)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {simulateApi
                ? <Zap style={{ width: 13, height: 13, color: '#00e5a0', flexShrink: 0 }} />
                : <ZapOff style={{ width: 13, height: 13, color: '#4f8ef7', flexShrink: 0 }} />
              }
              {!collapsed && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: simulateApi ? '#00e5a0' : isDark ? '#8b95b8' : '#4a5280',
                }}>
                  {simulateApi ? 'Simulation On' : 'Live API'}
                </span>
              )}
            </div>
            {!collapsed && (
              <div style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: simulateApi ? '#00e5a0' : '#f43f5e',
                boxShadow: simulateApi ? '0 0 6px 2px rgba(0,229,160,0.5)' : '0 0 6px 2px rgba(244,63,94,0.4)',
                flexShrink: 0,
              }} className={simulateApi ? 'animate-pulse-glow' : ''} />
            )}
          </button>

          {/* System status + version */}
          {!collapsed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 2px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#00e5a0',
                  boxShadow: '0 0 6px rgba(0,229,160,0.6)',
                }} className="animate-pulse-glow" />
                <span style={{ fontSize: 9, color: isDark ? '#4a5280' : '#8b95b8', fontWeight: 600, letterSpacing: '0.06em' }}>
                  SYSTEM ONLINE
                </span>
              </div>
              <span style={{ fontSize: 9, color: isDark ? '#2d3470' : '#bcc4e0', fontWeight: 600, fontFamily: 'monospace' }}>
                v1.1.0
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          position: 'relative',
        }}
      >
        <div style={{ flex: 1, padding: '32px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
