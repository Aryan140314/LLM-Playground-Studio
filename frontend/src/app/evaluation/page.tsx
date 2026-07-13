'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Play, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Compass, 
  FolderGit
} from 'lucide-react';
import { postData, getData } from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';
import { useSimulation } from '../../context/SimulationContext';

interface EvaluationResult {
  faithfulness: number;
  relevancy: number;
  recall: number;
  overall_rag_score: number;
  details: string;
}

export default function EvaluationDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { simulateApi } = useSimulation();

  // Input states for evaluation calculator
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [contextInput, setContextInput] = useState<string>('');

  // Results
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Historical evaluations (pre-populated with mock data for demonstration)
  const [history, setHistory] = useState<any[]>([
    { question: "What is BPE tokenizer?", overall: 0.92, faithfulness: 0.95, relevancy: 0.90, recall: 0.92, timestamp: "2026-07-08 10:15" },
    { question: "Explain HNSW graph in ChromaDB", overall: 0.86, faithfulness: 0.88, relevancy: 0.82, recall: 0.88, timestamp: "2026-07-08 10:30" },
    { question: "RAG vs fine-tuning trade-offs", overall: 0.78, faithfulness: 0.80, relevancy: 0.75, recall: 0.80, timestamp: "2026-07-08 11:05" }
  ]);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || !contextInput.trim()) {
      setError('Please fill in the question, answer, and grounding context fields.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const payload = {
        question: question,
        answer: answer,
        contexts: [{ content: contextInput }], // Wraps context text as a chunk
        simulate: simulateApi
      };

      const data = await postData('/api/rag/evaluate', payload);
      if (data?.status === 'success') {
        const evalResult = {
          faithfulness: data.faithfulness,
          relevancy: data.relevancy,
          recall: data.recall,
          overall_rag_score: data.overall_rag_score,
          details: data.details
        };
        setResult(evalResult);

        // Add to history
        setHistory(prev => [
          {
            question: question.length > 35 ? question.slice(0, 35) + '...' : question,
            overall: data.overall_rag_score,
            faithfulness: data.faithfulness,
            relevancy: data.relevancy,
            recall: data.recall,
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
          },
          ...prev
        ]);
      } else {
        setError('Failed to compute evaluation scores.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred calling Evaluation API.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.85) return 'text-emerald-450';
    if (score >= 0.70) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 0.85) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 0.70) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-emerald-400" />
          Evaluation Dashboard (Sprint 10)
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>
          Measure RAG pipeline performance using Faithfulness, Answer Relevancy, and Context Recall metrics
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-450 text-xs">
          {error}
        </div>
      )}

      {/* Aggregate Score Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Overall RAG Score', 'Faithfulness (Groundedness)', 'Answer Relevancy', 'Context Recall'].map((metric, idx) => {
          const vals = history.map(h => {
            if (idx === 0) return h.overall;
            if (idx === 1) return h.faithfulness;
            if (idx === 2) return h.relevancy;
            return h.recall;
          });
          const avg = vals.length > 0 ? round(vals.reduce((a, b) => a + b, 0) / vals.length, 2) : 0.85;
          
          return (
            <div 
              key={metric}
              className={`p-5 border rounded-2xl flex justify-between items-center ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-205 shadow-sm'
              }`}
            >
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{metric}</p>
                <p className={`text-2xl font-extrabold mt-1 font-mono ${getScoreColor(avg)}`}>
                  {avg.toFixed(2)}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl border ${getScoreBg(avg)}`}>
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Metric Calculator (Left Column) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleEvaluate} className={`p-6 border rounded-2xl space-y-4 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-205 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400 uppercase tracking-wider border-b border-slate-850 pb-2">
              <Settings className="h-4.5 w-4.5" />
              RAG Metric Calculator
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Grounding Context Chunks</label>
              <textarea
                rows={3}
                placeholder="Paste the reference document context used to generate the answer..."
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-xs focus:outline-none leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-850 text-slate-350' : 'bg-slate-50 border-slate-205 text-slate-700'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">User Question</label>
              <input
                type="text"
                placeholder="What was the user's question?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={`w-full px-4 py-3.5 border rounded-xl text-xs focus:outline-none ${
                  isDark ? 'bg-slate-950 border-slate-850 text-slate-100' : 'bg-slate-50 border-slate-205 text-slate-900'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Generated LLM Answer</label>
              <textarea
                rows={3}
                placeholder="Paste the answer generated by the LLM..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-xs focus:outline-none leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-205 text-slate-750'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !question.trim() || !answer.trim() || !contextInput.trim()}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Play className="h-4.5 w-4.5" />}
              Execute Metric Evaluation
            </button>
          </form>
        </div>

        {/* Results Workspace (Right Column) */}
        <div className="lg:col-span-5 space-y-6">
          
          {result ? (
            <div className={`p-6 border rounded-2xl space-y-5 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-205 shadow-sm'
            }`}>
              <div className="font-bold text-sm text-emerald-400 uppercase tracking-wider">
                Evaluation Scores
              </div>

              <div className="space-y-4">
                {/* Metric list */}
                {[
                  { name: 'Faithfulness', val: result.faithfulness, desc: 'Are claims in answer fully supported by context?' },
                  { name: 'Answer Relevancy', val: result.relevancy, desc: 'Does the answer directly address the user question?' },
                  { name: 'Context Recall', val: result.recall, desc: 'Did the context contains the facts required to answer?' }
                ].map((m) => (
                  <div key={m.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wide">
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{m.name}</span>
                      <span className={getScoreColor(m.val)}>{(m.val * 100).toFixed(0)}%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800/20 border border-slate-850 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          m.val >= 0.85 ? 'bg-emerald-500' : m.val >= 0.70 ? 'bg-amber-500' : 'bg-rose-500'
                        }`} 
                        style={{ width: `${m.val * 100}%` }} 
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">{m.desc}</p>
                  </div>
                ))}
              </div>

              <div className={`p-3.5 border rounded-xl flex gap-2 text-[11px] ${getScoreBg(result.overall_rag_score)}`}>
                {result.overall_rag_score >= 0.80 ? (
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold uppercase text-[9px] tracking-wider mb-0.5">
                    RAG Validation Verdict
                  </div>
                  <p className={isDark ? 'text-slate-350' : 'text-slate-750'}>
                    {result.details} RAG output quality is rated as **{result.overall_rag_score >= 0.80 ? 'HIGH' : 'MODERATE'}** quality.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Historical Evaluations Log */
            <div className={`p-6 border rounded-2xl space-y-4 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-205 shadow-sm'
            }`}>
              <div className="font-bold text-sm text-emerald-400 uppercase tracking-wider">
                Evaluation History Log
              </div>

              <div className="divide-y divide-slate-800/10">
                {history.map((h, idx) => (
                  <div key={idx} className="py-3.5 flex justify-between items-center text-xs first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-750'}`}>{h.question}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{h.timestamp}</p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg border font-bold font-mono text-xs ${getScoreBg(h.overall)}`}>
                      {h.overall.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

// Utility rounding
function round(value: number, decimals: number) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
