'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext';
import { useSimulation } from '../context/SimulationContext';
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
  BookOpen,
  Puzzle,
  MessageCircle,
  Activity,
  Search,
  ClipboardCheck,
  Cpu,
  Layers3,
  GitBranch,
  Zap,
  TrendingUp,
  Shield
} from 'lucide-react';

interface CardItem {
  title: string;
  desc: string;
  href: string;
  icon: React.ComponentType<any>;
  gradient: string;
  glowColor: string;
  category: 'CORE PLAYGROUND' | 'RAG PIPELINE';
  badge?: string;
}

const modules: CardItem[] = [
  {
    title: 'Chat Playground',
    desc: 'Interact with Gemini and inspect live latency, word counts, and token stats in real-time.',
    href: '/chat',
    icon: MessageSquare,
    gradient: 'linear-gradient(135deg, #4f8ef7, #06b6d4)',
    glowColor: 'rgba(79, 142, 247, 0.3)',
    category: 'CORE PLAYGROUND',
    badge: 'Live'
  },
  {
    title: 'Prompt Engineering Lab',
    desc: 'Compare Zero-Shot, Few-Shot, Chain of Thought, and Self-Consistency prompting strategies side-by-side.',
    href: '/prompt-lab',
    icon: Brain,
    gradient: 'linear-gradient(135deg, #a855f7, #6c63ff)',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    category: 'CORE PLAYGROUND',
    badge: 'Pro'
  },
  {
    title: 'Tokenizer Explorer',
    desc: 'Analyze subword segmentations comparing BPE (GPT), WordPiece (BERT), and SentencePiece encodings.',
    href: '/tokenizer',
    icon: Fingerprint,
    gradient: 'linear-gradient(135deg, #00e5a0, #059669)',
    glowColor: 'rgba(0, 229, 160, 0.3)',
    category: 'CORE PLAYGROUND'
  },
  {
    title: 'Embedding Explorer',
    desc: 'Project high-dimensional vectors to 2D using PCA/t-SNE with interactive K-Means clustering.',
    href: '/embeddings',
    icon: Compass,
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    category: 'CORE PLAYGROUND'
  },
  {
    title: 'Search Explorer',
    desc: 'Run semantic and keyword searches over your indexed document collections with relevancy scores.',
    href: '/search',
    icon: Search,
    gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    glowColor: 'rgba(244, 63, 94, 0.3)',
    category: 'CORE PLAYGROUND'
  },
  {
    title: 'Model Comparison',
    desc: 'Benchmark Gemini, Claude, and GPT models side-by-side on latency, quality, and token costs.',
    href: '/compare',
    icon: Scale,
    gradient: 'linear-gradient(135deg, #ec4899, #a855f7)',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    category: 'CORE PLAYGROUND'
  },
  {
    title: 'Document Manager',
    desc: 'Upload PDF, DOCX, TXT, or MD documents. Parse pages and track corpus stats in the registry.',
    href: '/documents',
    icon: FileText,
    gradient: 'linear-gradient(135deg, #f43f5e, #f97316)',
    glowColor: 'rgba(244, 63, 94, 0.3)',
    category: 'RAG PIPELINE',
    badge: 'Upload'
  },
  {
    title: 'Chunking Explorer',
    desc: 'Compare Fixed-Size, Semantic, and Hierarchical chunking strategies with interactive chunk previews.',
    href: '/chunking',
    icon: Scissors,
    gradient: 'linear-gradient(135deg, #f97316, #eab308)',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    category: 'RAG PIPELINE'
  },
  {
    title: 'Embedding Pipeline',
    desc: 'Convert text chunks into 384-dim dense vectors locally and measure generation latency per batch.',
    href: '/embedding-pipeline',
    icon: Compass,
    gradient: 'linear-gradient(135deg, #eab308, #f59e0b)',
    glowColor: 'rgba(234, 179, 8, 0.3)',
    category: 'RAG PIPELINE'
  },
  {
    title: 'ChromaDB Indexing',
    desc: 'Manage vector database collections and run batch chunk ingestion into ChromaDB indexes.',
    href: '/indexing',
    icon: Database,
    gradient: 'linear-gradient(135deg, #22c55e, #00e5a0)',
    glowColor: 'rgba(34, 197, 94, 0.3)',
    category: 'RAG PIPELINE'
  },
  {
    title: 'Retrieval Explorer',
    desc: 'Query document indices semantically and inspect matched chunks with cosine similarity scores.',
    href: '/retrieval',
    icon: BookOpen,
    gradient: 'linear-gradient(135deg, #06b6d4, #4f8ef7)',
    glowColor: 'rgba(6, 182, 212, 0.3)',
    category: 'RAG PIPELINE'
  },
  {
    title: 'Prompt Builder',
    desc: 'Inject retrieved document context into grounded system instructions for LLM prompt preview.',
    href: '/prompt-builder',
    icon: Puzzle,
    gradient: 'linear-gradient(135deg, #6c63ff, #4f8ef7)',
    glowColor: 'rgba(108, 99, 255, 0.3)',
    category: 'RAG PIPELINE'
  },
  {
    title: 'RAG Playground',
    desc: 'Run end-to-end grounded generation with citation cards showing page numbers and similarity scores.',
    href: '/rag-playground',
    icon: MessageCircle,
    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    category: 'RAG PIPELINE',
    badge: 'Core'
  },
  {
    title: 'Retrieval Comparison',
    desc: 'Compare Naive vs Hybrid vs HyDE vs Multi-Query retrieval strategies side-by-side on your corpus.',
    href: '/compare-retrieval',
    icon: Activity,
    gradient: 'linear-gradient(135deg, #00e5a0, #06b6d4)',
    glowColor: 'rgba(0, 229, 160, 0.3)',
    category: 'RAG PIPELINE',
    badge: 'Advanced'
  },
  {
    title: 'Evaluation Dashboard',
    desc: 'Measure RAGAS scores: Faithfulness, Answer Relevancy, and Context Recall via LLM judges.',
    href: '/evaluation',
    icon: ClipboardCheck,
    gradient: 'linear-gradient(135deg, #a855f7, #6c63ff)',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    category: 'RAG PIPELINE',
    badge: 'RAGAS'
  }
];

const stats = [
  { label: 'Total Modules', value: '17', icon: Layers3, color: '#4f8ef7' },
  { label: 'Active Phase', value: 'Phase 2', icon: GitBranch, color: '#00e5a0' },
  { label: 'AI Models', value: '3 Providers', icon: Cpu, color: '#a855f7' },
  { label: 'Backend Status', value: 'FastAPI', icon: Zap, color: '#f59e0b' },
];

const sectionConfig = {
  'CORE PLAYGROUND': {
    label: 'Core Playground',
    desc: 'Explore LLMs, prompting, tokenizers, embeddings, and model comparisons.',
    badge: 'Phase 1 — 6 Modules',
    badgeColor: '#4f8ef7',
    accentColor: 'rgba(79, 142, 247, 0.5)',
  },
  'RAG PIPELINE': {
    label: 'RAG Pipeline',
    desc: 'Full RAG system from document ingestion to grounded generation and evaluation.',
    badge: 'Phase 2 — 9 Modules',
    badgeColor: '#00e5a0',
    accentColor: 'rgba(0, 229, 160, 0.5)',
  },
};

export default function Page() {
  const { theme } = useTheme();
  const { simulateApi } = useSimulation();
  const isDark = theme === 'dark';
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const cardBg = isDark ? 'rgba(13, 18, 38, 0.85)' : 'rgba(255, 255, 255, 0.9)';
  const cardBorder = isDark ? 'rgba(79, 142, 247, 0.12)' : 'rgba(79, 142, 247, 0.15)';
  const textPrimary = isDark ? '#e8eaf6' : '#1a1f3a';
  const textSecondary = isDark ? '#8b95b8' : '#4a5280';
  const textMuted = isDark ? '#4a5280' : '#8b95b8';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

      {/* ========================
          HERO BANNER
          ======================== */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 24,
          border: isDark ? '1px solid rgba(79,142,247,0.15)' : '1px solid rgba(79,142,247,0.2)',
          background: isDark
            ? 'linear-gradient(135deg, rgba(13,18,38,0.95) 0%, rgba(15,20,50,0.95) 100%)'
            : 'linear-gradient(135deg, rgba(248,250,255,0.98) 0%, rgba(240,244,255,0.98) 100%)',
          padding: '48px 52px',
          backdropFilter: 'blur(20px)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* Decorative orbs */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 320, height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,142,247,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -60,
          width: 280, height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '55%',
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,160,0.08) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }} />

        {/* Top highlight line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(79,142,247,0.6) 30%, rgba(108,99,255,0.6) 60%, rgba(0,229,160,0.4) 80%, transparent 100%)',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 700 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 99,
            background: 'rgba(79,142,247,0.1)',
            border: '1px solid rgba(79,142,247,0.25)',
            marginBottom: 20,
          }}>
            <Sparkles style={{ width: 12, height: 12, color: '#4f8ef7' }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#4f8ef7', textTransform: 'uppercase' }}>
              Production-Ready AI Studio
            </span>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: simulateApi ? '#00e5a0' : '#f43f5e',
              boxShadow: simulateApi ? '0 0 6px rgba(0,229,160,0.7)' : '0 0 6px rgba(244,63,94,0.7)',
              marginLeft: 2,
            }} />
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 16,
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #4f8ef7 0%, #6c63ff 50%, #00e5a0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% 200%',
            }}>
              LLM Playground
            </span>
            <br />
            <span style={{ color: textPrimary }}>Studio</span>
          </h1>

          {/* Description */}
          <p style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: textSecondary,
            marginBottom: 28,
            maxWidth: 580,
          }}>
            An advanced AI studio to construct, analyze, and inspect language models, tokenizers,
            custom embedding pipelines, vector databases, and end-to-end RAG loops — all in one place.
          </p>

          {/* CTA links */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              href="/chat"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #4f8ef7, #6c63ff)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.05em',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(79,142,247,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <MessageSquare style={{ width: 14, height: 14 }} />
              Start Chatting
            </Link>
            <Link
              href="/rag-playground"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 12,
                background: isDark ? 'rgba(79,142,247,0.08)' : 'rgba(79,142,247,0.06)',
                border: '1px solid rgba(79,142,247,0.25)',
                color: '#4f8ef7',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.05em',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <MessageCircle style={{ width: 14, height: 14 }} />
              RAG Playground
              <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================
          STATS BAR
          ======================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 16,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s',
      }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="stat-card"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: 16,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                position: 'relative',
                overflow: 'hidden',
                animationDelay: `${i * 80}ms`,
              }}
            >
              {/* Background glow */}
              <div style={{
                position: 'absolute',
                top: -20, right: -20,
                width: 80, height: 80,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${stat.color}18 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {stat.label}
                </span>
                <div style={{
                  padding: 7,
                  borderRadius: 9,
                  background: `${stat.color}15`,
                  border: `1px solid ${stat.color}25`,
                }}>
                  <Icon style={{ width: 13, height: 13, color: stat.color }} />
                </div>
              </div>

              <div style={{
                fontSize: 22,
                fontWeight: 800,
                color: textPrimary,
                letterSpacing: '-0.02em',
              }}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================
          MODULE SECTIONS
          ======================== */}
      {(['CORE PLAYGROUND', 'RAG PIPELINE'] as const).map((cat, sectionIdx) => {
        const catItems = modules.filter(m => m.category === cat);
        const config = sectionConfig[cat];

        return (
          <section
            key={cat}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity 0.6s ease ${0.25 + sectionIdx * 0.1}s, transform 0.6s ease ${0.25 + sectionIdx * 0.1}s`,
            }}
          >
            {/* Section header */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              paddingBottom: 16,
              borderBottom: `1px solid ${isDark ? 'rgba(79,142,247,0.08)' : 'rgba(79,142,247,0.1)'}`,
              gap: 12,
              flexWrap: 'wrap',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{
                    width: 3,
                    height: 18,
                    borderRadius: 99,
                    background: config.accentColor,
                    boxShadow: `0 0 8px ${config.accentColor}`,
                  }} />
                  <h2 style={{
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: textPrimary,
                    margin: 0,
                  }}>
                    {config.label}
                  </h2>
                </div>
                <p style={{ fontSize: 12, color: textSecondary, margin: 0, paddingLeft: 13 }}>
                  {config.desc}
                </p>
              </div>

              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: 99,
                background: `${config.badgeColor}12`,
                border: `1px solid ${config.badgeColor}30`,
                color: config.badgeColor,
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
              }}>
                {config.badge}
              </span>
            </div>

            {/* Cards grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}>
              {catItems.map((mod, idx) => {
                const Icon = mod.icon;

                return (
                  <div
                    key={mod.title}
                    className="card-shimmer"
                    style={{
                      background: cardBg,
                      border: `1px solid ${cardBorder}`,
                      borderRadius: 18,
                      padding: 22,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                      cursor: 'pointer',
                      animationDelay: `${idx * 60}ms`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 16px 40px ${mod.glowColor}, 0 4px 12px rgba(0,0,0,0.2)`;
                      e.currentTarget.style.borderColor = isDark ? 'rgba(79,142,247,0.3)' : 'rgba(79,142,247,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = cardBorder;
                    }}
                  >
                    {/* Subtle corner accent */}
                    <div style={{
                      position: 'absolute',
                      top: 0, right: 0,
                      width: 60, height: 60,
                      background: `radial-gradient(circle at top right, ${mod.glowColor} 0%, transparent 70%)`,
                      borderRadius: '0 18px 0 0',
                      pointerEvents: 'none',
                    }} />

                    {/* Icon + badge row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{
                        padding: 11,
                        borderRadius: 13,
                        background: mod.gradient,
                        display: 'flex',
                        boxShadow: `0 4px 16px ${mod.glowColor}`,
                        position: 'relative',
                      }}>
                        <Icon style={{ width: 18, height: 18, color: '#fff' }} />
                        {/* Icon inner glow */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: 13,
                          background: 'rgba(255,255,255,0.12)',
                        }} />
                      </div>

                      {mod.badge && (
                        <span style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 99,
                          background: 'rgba(79,142,247,0.1)',
                          border: '1px solid rgba(79,142,247,0.2)',
                          color: '#4f8ef7',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}>
                          {mod.badge}
                        </span>
                      )}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: textPrimary,
                        marginBottom: 6,
                        letterSpacing: '-0.01em',
                      }}>
                        {mod.title}
                      </h3>
                      <p style={{
                        fontSize: 12,
                        lineHeight: 1.6,
                        color: textSecondary,
                        margin: 0,
                      }}>
                        {mod.desc}
                      </p>
                    </div>

                    {/* Action link */}
                    <Link
                      href={mod.href}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        color: '#4f8ef7',
                        transition: 'gap 0.2s ease',
                        marginTop: 2,
                      }}
                      onMouseEnter={(e) => {
                        const arrow = e.currentTarget.querySelector('.arrow') as HTMLElement;
                        if (arrow) arrow.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        const arrow = e.currentTarget.querySelector('.arrow') as HTMLElement;
                        if (arrow) arrow.style.transform = 'translateX(0)';
                      }}
                    >
                      Open Explorer
                      <ArrowRight className="arrow" style={{ width: 12, height: 12, transition: 'transform 0.2s ease' }} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* ========================
          FOOTER BADGE
          ======================== */}
      <div style={{
        textAlign: 'center',
        paddingTop: 8,
        paddingBottom: 16,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.6s ease 0.5s',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 99,
          background: isDark ? 'rgba(79,142,247,0.05)' : 'rgba(79,142,247,0.06)',
          border: '1px solid rgba(79,142,247,0.12)',
        }}>
          <Shield style={{ width: 11, height: 11, color: '#4a5280' }} />
          <span style={{ fontSize: 10, color: textMuted, fontWeight: 600, letterSpacing: '0.07em' }}>
            LLM PLAYGROUND STUDIO · v1.1.0 · Built with Next.js + FastAPI
          </span>
        </div>
      </div>
    </div>
  );
}
