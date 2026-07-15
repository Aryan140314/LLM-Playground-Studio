'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Settings, 
  HelpCircle, 
  Play, 
  Loader2, 
  Compass, 
  Hash, 
  Layers, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { postData, getData } from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';
import { useSimulation } from '../../context/SimulationContext';

interface Collection {
  name: string;
  document_count: number;
}

interface RetrievedChunk {
  id: string;
  content: string;
  similarity: number;
  metadata?: {
    doc_name?: string;
    chunk_index?: number;
  };
}

interface HydeResult {
  hypothetical_doc: string;
  chunks: RetrievedChunk[];
}

interface MultiQueryResult {
  queries_generated: string[];
  chunks: RetrievedChunk[];
}

export default function CompareRetrieval() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { simulateApi } = useSimulation();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCol, setSelectedCol] = useState<string>('');
  
  const [query, setQuery] = useState<string>('');
  const [topK, setTopK] = useState<number>(3);

  // Search strategy results
  const [naiveResults, setNaiveResults] = useState<RetrievedChunk[]>([]);
  const [hybridResults, setHybridResults] = useState<RetrievedChunk[]>([]);
  const [hydeResult, setHydeResult] = useState<HydeResult | null>(null);
  const [mqResult, setMqResult] = useState<MultiQueryResult | null>(null);

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
        console.error('Failed loading collections:', err);
      }
    };
    fetchCollections();
  }, []);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !selectedCol) return;

    setLoading(true);
    setError('');
    
    // Clear old results
    setNaiveResults([]);
    setHybridResults([]);
    setHydeResult(null);
    setMqResult(null);

    try {
      const data = await postData('/api/retrieval/compare', {
        query: query,
        collection_name: selectedCol,
        top_k: topK,
        simulate: simulateApi
      });
      if (data?.status === 'success') {
        setNaiveResults(data.naive || []);
        setHybridResults(data.hybrid || []);
        setHydeResult(data.hyde || null);
        setMqResult(data.multiquery || null);
      } else {
        setError('Comparison analysis failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred calling retrieval compare endpoint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
          <Activity className="h-8 w-8 text-teal-400" />
          Retrieval Comparison (Sprint 9)
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>
          Compare Naive vs Hybrid vs HyDE vs Multi-Query retrieval models side-by-side on your collections
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-450 text-xs">
          {error}
        </div>
      )}

      {/* Control Form panel */}
      <form onSubmit={handleCompare} className={`p-6 border rounded-2xl flex flex-wrap items-end gap-6 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-205 shadow-sm'
      }`}>
        <div className="flex-1 min-w-[240px] space-y-1">
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Search Query</label>
          <input
            type="text"
            placeholder="Type a research question (e.g. explain attention models)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl text-xs focus:outline-none ${
              isDark ? 'bg-slate-950 border-slate-850 text-slate-100' : 'bg-slate-50 border-slate-205 text-slate-900'
            }`}
          />
        </div>

        <div className="w-48 space-y-1">
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Target Index Collection</label>
          <select
            value={selectedCol}
            onChange={(e) => setSelectedCol(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl text-xs font-mono focus:outline-none ${
              isDark ? 'bg-slate-950 border-slate-850 text-slate-350' : 'bg-slate-50 border-slate-205 text-slate-700'
            }`}
          >
            <option value="">-- Collection --</option>
            {collections.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.document_count} chunks)
              </option>
            ))}
          </select>
        </div>

        <div className="w-44 space-y-1">
          <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
            <span>Top K results: {topK}</span>
          </div>
          <input
            type="range"
            min="1"
            max="6"
            step="1"
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value))}
            className="w-full accent-teal-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim() || !selectedCol}
          className="px-6 py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 shrink-0"
        >
          {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Play className="h-4.5 w-4.5" />}
          Run Comparison
        </button>
      </form>

      {/* Side-by-Side Comparison Workspace */}
      {naiveResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
          
          {/* Column 1: Naive (Vector only) */}
          <div className="space-y-4">
            <div className={`p-4 border-b pb-3 border-slate-800/10 flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              1. Naive (Vector)
            </div>
            
            <div className="space-y-3">
              {naiveResults.map((chunk) => (
                <div key={chunk.id} className={`p-4 border rounded-2xl text-xs space-y-2 ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-205 shadow-sm'
                }`}>
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                    <span>{chunk.metadata?.doc_name}</span>
                    <span className="text-blue-400 font-mono">Sim: {chunk.similarity.toFixed(4)}</span>
                  </div>
                  <p className={`leading-relaxed line-clamp-4 ${isDark ? 'text-slate-350' : 'text-slate-650'}`}>{chunk.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Hybrid (Semantic + Keyword) */}
          <div className="space-y-4">
            <div className={`p-4 border-b pb-3 border-slate-800/10 flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              2. Hybrid (RRF Fused)
            </div>
            
            <div className="space-y-3">
              {hybridResults.map((chunk) => (
                <div key={chunk.id} className={`p-4 border rounded-2xl text-xs space-y-2 ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-205 shadow-sm'
                }`}>
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                    <span>{chunk.metadata?.doc_name}</span>
                    <span className="text-amber-400 font-mono">Rank Score: {chunk.similarity.toFixed(4)}</span>
                  </div>
                  <p className={`leading-relaxed line-clamp-4 ${isDark ? 'text-slate-350' : 'text-slate-650'}`}>{chunk.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: HyDE */}
          <div className="space-y-4">
            <div className={`p-4 border-b pb-3 border-slate-800/10 flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              3. HyDE (Hypothetical Doc)
            </div>

            {hydeResult && (
              <div className="space-y-3">
                {/* Generated passage preview */}
                <div className={`p-3.5 border border-dashed rounded-2xl text-xs space-y-1.5 ${
                  isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-200'
                }`}>
                  <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    Hypothetical Answer (LLM)
                  </div>
                  <p className={`leading-relaxed italic ${isDark ? 'text-emerald-300/80' : 'text-emerald-800'}`}>
                    &quot;{hydeResult.hypothetical_doc}&quot;
                  </p>
                </div>

                {hydeResult.chunks.map((chunk) => (
                  <div key={chunk.id} className={`p-4 border rounded-2xl text-xs space-y-2 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-205 shadow-sm'
                  }`}>
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                      <span>{chunk.metadata?.doc_name}</span>
                      <span className="text-emerald-400 font-mono">Sim: {chunk.similarity.toFixed(4)}</span>
                    </div>
                    <p className={`leading-relaxed line-clamp-4 ${isDark ? 'text-slate-350' : 'text-slate-650'}`}>{chunk.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 4: Multi-Query */}
          <div className="space-y-4">
            <div className={`p-4 border-b pb-3 border-slate-800/10 flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>
              <span className="h-2 w-2 rounded-full bg-pink-500" />
              4. Multi-Query Expansion
            </div>

            {mqResult && (
              <div className="space-y-3">
                {/* Expanded variants list */}
                <div className={`p-3.5 border border-dashed rounded-2xl text-[10px] space-y-1.5 ${
                  isDark ? 'bg-pink-500/5 border-pink-500/20' : 'bg-pink-50/50 border-pink-200'
                }`}>
                  <div className="text-[9px] text-pink-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Query Expansion Variants
                  </div>
                  <ul className={`list-disc pl-3.5 space-y-1 ${isDark ? 'text-pink-300/80' : 'text-pink-800'}`}>
                    {mqResult.queries_generated.slice(1).map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>

                {mqResult.chunks.map((chunk) => (
                  <div key={chunk.id} className={`p-4 border rounded-2xl text-xs space-y-2 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-205 shadow-sm'
                  }`}>
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                      <span>{chunk.metadata?.doc_name}</span>
                      <span className="text-pink-400 font-mono">Max Sim: {chunk.similarity.toFixed(4)}</span>
                    </div>
                    <p className={`leading-relaxed line-clamp-4 ${isDark ? 'text-slate-350' : 'text-slate-650'}`}>{chunk.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 bg-slate-900/10 border border-slate-850 rounded-2xl text-slate-500 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
              <p className="text-sm font-semibold tracking-wide animate-pulse">Running advanced comparison algorithms...</p>
            </div>
          ) : (
            <>
              <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-full">
                <Activity className="h-10 w-10 text-teal-400/40" />
              </div>
              <p className="text-sm">No comparison search active</p>
              <p className="text-xs text-slate-600 max-w-xs text-center font-normal">
                Select your dataset index, enter your query, and compare all 4 strategies side-by-side in real-time.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
