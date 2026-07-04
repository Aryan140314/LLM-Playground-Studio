'use client';

import React, { useState } from 'react';
import { Search, Database, Layers, Hash, UploadCloud, RefreshCw } from 'lucide-react';
import { postData } from '../../utils/api';

export default function SearchExplorer() {
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState<'hybrid' | 'chroma' | 'search'>('hybrid');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      // Endpoints: /api/hybrid, /api/chroma, /api/search
      const data = await postData(`/api/${engine}`, {
        query,
        top_k: 5
      });
      
      if (data && data.status === 'success') {
        setResults(data.results || []);
      } else {
        setError('Failed to fetch results');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  const handleInsertDemoData = async () => {
    setIsInserting(true);
    setError('');
    try {
      const demoDocuments = [
        { id: "doc1", title: "Grocery Shopping", content: "I bought a juicy red apple at the farmers market today.", metadata: { source: "diary" } },
        { id: "doc2", title: "Tech News", content: "The Cupertino-based tech giant released its latest smartphone with a titanium body.", metadata: { source: "news" } },
        { id: "doc3", title: "Financial Report", content: "Apple announced record profits from iPhone sales this quarter.", metadata: { source: "finance" } },
        { id: "doc4", title: "Space X", content: "A rocket launched into the starry night sky for space exploration.", metadata: { source: "science" } },
        { id: "doc5", title: "Pets", content: "The feline rested comfortably on the mat.", metadata: { source: "blog" } }
      ];

      const data = await postData('/api/insert', { documents: demoDocuments });
      if (data && data.status === 'success') {
        alert(`Successfully inserted ${data.inserted} demo documents into ChromaDB & BM25!`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to insert demo data');
    } finally {
      setIsInserting(false);
    }
  };

  const getScoreBadge = (result: any) => {
    if (result.hybrid_score !== undefined) {
      return { label: 'RRF', value: result.hybrid_score.toFixed(4), color: 'text-fuchsia-400 border-fuchsia-400/30 bg-fuchsia-500/10' };
    }
    if (result.cosine_similarity !== undefined) {
      return { label: 'Cosine', value: result.cosine_similarity.toFixed(4), color: 'text-indigo-400 border-indigo-400/30 bg-indigo-500/10' };
    }
    if (result.similarity_score !== undefined) {
      return { label: 'BM25', value: result.similarity_score.toFixed(4), color: 'text-emerald-400 border-emerald-400/30 bg-emerald-500/10' };
    }
    return { label: 'Score', value: '0.0000', color: 'text-slate-400 border-slate-700 bg-slate-800' };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Database className="h-8 w-8 text-fuchsia-500" />
            Search Explorer
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            Compare Lexical (Keyword), Semantic (Vector), and Hybrid (RRF) search algorithms side-by-side.
          </p>
        </div>
        
        <button
          onClick={handleInsertDemoData}
          disabled={isInserting}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all"
        >
          {isInserting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          Load Demo Data
        </button>
      </div>

      {/* Main Search Interface */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        
        {/* Engine Selectors */}
        <div className="flex gap-4">
          <button
            onClick={() => { setEngine('hybrid'); setResults([]); }}
            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
              engine === 'hybrid' 
                ? 'bg-fuchsia-500/10 border-fuchsia-500/50 text-fuchsia-400 shadow-lg shadow-fuchsia-500/10' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Layers className="h-6 w-6" />
            <span className="font-bold text-sm">Hybrid Search</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">Semantic + Keyword</span>
          </button>
          
          <button
            onClick={() => { setEngine('chroma'); setResults([]); }}
            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
              engine === 'chroma' 
                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Database className="h-6 w-6" />
            <span className="font-bold text-sm">ChromaDB</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">Pure Vector Semantic</span>
          </button>
          
          <button
            onClick={() => { setEngine('search'); setResults([]); }}
            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
              engine === 'search' 
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Hash className="h-6 w-6" />
            <span className="font-bold text-sm">BM25 Search</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">Lexical Keyword Rank</span>
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try searching for 'Apple technology company' or 'sleeping cat'..."
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl py-4 pl-12 pr-32 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200">Results</h3>
          <div className="grid gap-4">
            {results.map((result, index) => {
              const badge = getScoreBadge(result);
              return (
                <div key={result.id || index} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition-colors flex gap-4">
                  
                  {/* Rank Badge */}
                  <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xl">
                    #{index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="text-white font-medium truncate">
                        {result.title || result.id}
                      </h4>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                        {badge.label}: {badge.value}
                      </div>
                    </div>
                    
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {result.content}
                    </p>
                    
                    {result.metadata && Object.keys(result.metadata).length > 0 && (
                      <div className="mt-4 flex gap-2">
                        {Object.entries(result.metadata).map(([k, v]) => (
                          <span key={k} className="px-2 py-1 bg-slate-800 text-slate-400 rounded-md text-[10px] uppercase font-semibold tracking-wider">
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {results.length === 0 && !loading && query && !error && (
        <div className="text-center py-12 text-slate-500">
          No results found for this query in the current engine.
        </div>
      )}

    </div>
  );
}
