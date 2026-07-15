'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Database, 
  Settings, 
  HelpCircle, 
  BookOpen, 
  Eye, 
  Sparkles, 
  Loader2, 
  Play, 
  Clock, 
  FileText,
  ShieldCheck
} from 'lucide-react';
import { postData, getData } from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';
import { useSimulation } from '../../context/SimulationContext';

interface Collection {
  name: string;
  document_count: number;
}

interface ContextChunk {
  id: string;
  content: string;
  similarity: number;
  metadata: {
    doc_name?: string;
    chunk_index?: number;
    page_number?: number;
  };
}

export default function RagPlayground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { simulateApi } = useSimulation();

  // API Collections list
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCol, setSelectedCol] = useState<string>('');
  
  // Pipeline Settings
  const [question, setQuestion] = useState<string>('');
  const [topK, setTopK] = useState<number>(3);
  const [systemInstructions, setSystemInstructions] = useState<string>(
    "You are a helpful RAG assistant. Answer the user's question using the provided context chunks. " +
    "If the context does not contain the answer, state that you do not know. " +
    "Be concise, truthful, and reference your source documents when possible."
  );

  // Response Results
  const [answer, setAnswer] = useState<string>('');
  const [fullPrompt, setFullPrompt] = useState<string>('');
  const [retrievedContexts, setRetrievedContexts] = useState<ContextChunk[]>([]);
  
  // Stats
  const [responseTime, setResponseTime] = useState<number>(0);
  const [wordCount, setWordCount] = useState<number>(0);
  const [tokenCount, setTokenCount] = useState<number>(0);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await getData('/api/indexing/collections');
        if (data?.status === 'success') {
          setCollections(data.collections || []);
          if (data.collections?.length > 0) {
            setSelectedCol(data.collections[0].name);
          }
        }
      } catch (err: any) {
        console.error('Error fetching ChromaDB collections:', err);
      }
    };
    fetchCollections();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !selectedCol) {
      setError('Please enter a question and select a collection.');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');
    setFullPrompt('');
    setRetrievedContexts([]);

    try {
      const payload = {
        question: question,
        collection_name: selectedCol,
        top_k: topK,
        system_instructions: systemInstructions,
        simulate: simulateApi
      };

      const data = await postData('/api/rag/generation', payload);
      if (data?.status === 'success') {
        setAnswer(data.answer || '');
        setFullPrompt(data.full_prompt || '');
        setRetrievedContexts(data.retrieved_contexts || []);
        setResponseTime(data.response_time || 0);
        setWordCount(data.word_count || 0);
        setTokenCount(data.token_count || 0);
      } else {
        setError(data?.detail || data?.message || 'An error occurred during grounded generation.');
      }
    } catch (err: any) {
      setError(err.message || 'Network exception calling Generation API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-pink-500" />
            RAG Playground (Sprints 7 & 8)
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>
            Retrieve ground documents from ChromaDB collections and generate answers verified by sources
          </p>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
          simulateApi 
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${simulateApi ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          {simulateApi ? 'Simulation Active' : 'Live API Mode'}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-450 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Settings and Input (Left Panel) */}
        <div className="lg:col-span-5 space-y-6">
          
          <form onSubmit={handleGenerate} className={`p-6 border rounded-2xl space-y-5 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-205 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm text-pink-500 uppercase tracking-wider border-b border-slate-800/10 pb-2">
              <Settings className="h-4.5 w-4.5" />
              Configure RAG Parameters
            </div>

            {/* Target Collection */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex justify-between">
                <span>Vector Collection</span>
                <span className="text-[9px] font-mono lowercase">{collections.length} available</span>
              </label>
              <select
                value={selectedCol}
                onChange={(e) => setSelectedCol(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-xs font-mono focus:outline-none ${
                  isDark ? 'bg-slate-950 border-slate-850 text-slate-350' : 'bg-slate-50 border-slate-205 text-slate-700'
                }`}
              >
                <option value="">-- Select Collection --</option>
                {collections.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.name} ({col.document_count} chunks)
                  </option>
                ))}
              </select>
            </div>

            {/* Top-K Retrieval Chunks size */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                <span>Context Limit (Top K)</span>
                <span className="font-mono text-pink-500 text-xs">{topK} chunks</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-full accent-pink-600 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* System Directives */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Grounding Instructions</label>
              <textarea
                rows={3}
                value={systemInstructions}
                onChange={(e) => setSystemInstructions(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-xs focus:outline-none leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-205 text-slate-700'
                }`}
              />
            </div>

            {/* Prompt query input */}
            <div className="space-y-1 pt-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">User Question</label>
              <textarea
                rows={2}
                placeholder="Ask about something in your uploaded database..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-xs focus:outline-none leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-850 text-slate-100' : 'bg-slate-50 border-slate-205 text-slate-900'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !question.trim() || !selectedCol}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-pink-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Play className="h-4.5 w-4.5" />}
              Generate RAG Answer
            </button>
          </form>

        </div>

        {/* Telemetry and Generation Results (Right Panel) */}
        <div className="lg:col-span-7 space-y-6">
          
          {answer ? (
            <div className="space-y-6">
              
              {/* Grounded generation block */}
              <div className={`p-6 border rounded-2xl space-y-4 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-205 shadow-sm'
              }`}>
                <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-pink-500 uppercase tracking-wider">
                    <Sparkles className="h-4.5 w-4.5 text-pink-500" />
                    Grounded AI Answer
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded">
                    <ShieldCheck className="h-3.5 w-3.5" /> Checked against sources
                  </div>
                </div>

                <div className={`text-xs leading-relaxed font-normal whitespace-pre-wrap ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}>
                  {answer}
                </div>

                {/* Query Telemetry stats */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                  <div className={`p-2 border rounded-xl ${isDark ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-150'}`}>
                    <div className="text-[9px] text-slate-500 uppercase font-semibold">Latency</div>
                    <div className="text-xs font-bold text-pink-500 mt-0.5 flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {responseTime.toFixed(2)}s
                    </div>
                  </div>

                  <div className={`p-2 border rounded-xl ${isDark ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-150'}`}>
                    <div className="text-[9px] text-slate-500 uppercase font-semibold">Token Count</div>
                    <div className="text-xs font-bold text-pink-500 mt-0.5 font-mono">{tokenCount}</div>
                  </div>

                  <div className={`p-2 border rounded-xl ${isDark ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-150'}`}>
                    <div className="text-[9px] text-slate-500 uppercase font-semibold">Word Count</div>
                    <div className="text-xs font-bold text-pink-500 mt-0.5 font-mono">{wordCount}</div>
                  </div>

                  <div className={`p-2 border rounded-xl ${isDark ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-150'}`}>
                    <div className="text-[9px] text-slate-500 uppercase font-semibold">Citations</div>
                    <div className="text-xs font-bold text-pink-500 mt-0.5 font-mono">{retrievedContexts.length}</div>
                  </div>
                </div>
              </div>

              {/* Citations (Sprint 8) */}
              <div className={`p-6 border rounded-2xl space-y-4 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-205 shadow-sm'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm text-pink-500 uppercase tracking-wider">
                  <BookOpen className="h-4.5 w-4.5 text-pink-500" />
                  Source Citations (Grounded Context)
                </div>

                <div className="space-y-3">
                  {retrievedContexts.map((ctx, idx) => (
                    <div 
                      key={ctx.id} 
                      className={`p-3.5 border rounded-xl text-xs space-y-2 transition-all ${
                        isDark 
                          ? 'bg-slate-950/40 border-slate-850 hover:border-slate-800' 
                          : 'bg-slate-55 border-slate-150 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-pink-500" />
                          {ctx.metadata.doc_name} (Chunk {ctx.metadata.chunk_index})
                        </span>
                        <span className="text-emerald-400 font-mono">Similarity: {ctx.similarity.toFixed(4)}</span>
                      </div>
                      <p className={`leading-relaxed italic ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>
                        &quot;{ctx.content}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grounded Prompt (Sprint 6 reference) */}
              <div className={`border rounded-2xl overflow-hidden ${
                isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-205'
              }`}>
                <details className="group">
                  <summary className="flex justify-between items-center p-4 cursor-pointer text-xs font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-800/10">
                    <span className="flex items-center gap-2">
                      <Eye className="h-4.5 w-4.5 text-slate-400" />
                      View Grounded Prompt Sent to Gemini
                    </span>
                    <span className="transition group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <div className="p-4 border-t border-slate-850 bg-slate-950/40">
                    <pre className={`text-[10px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap ${
                      isDark ? 'text-slate-450' : 'text-slate-700'
                    }`}>
                      {fullPrompt}
                    </pre>
                  </div>
                </details>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-44 bg-slate-900/10 border border-slate-850 rounded-2xl text-slate-500 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-10 w-10 text-pink-500 animate-spin" />
                  <p className="text-sm font-semibold tracking-wide animate-pulse">Running vector search & query generation...</p>
                </div>
              ) : (
                <>
                  <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-full">
                    <MessageCircle className="h-10 w-10 text-pink-500/40" />
                  </div>
                  <p className="text-sm">RAG output console is clear</p>
                  <p className="text-xs text-slate-600 max-w-xs text-center">
                    Select a database index, type a question, and generate answers derived directly from your custom dataset.
                  </p>
                </>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
