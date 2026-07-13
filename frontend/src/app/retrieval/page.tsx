'use client';

import React, { useState, useEffect } from 'react';
import { Search, Database, Layers, ArrowRight, Compass, HelpCircle, Loader2 } from 'lucide-react';
import { postData, getData } from '../../utils/api';

interface Collection {
  name: string;
  document_count: number;
}

interface RetrievalResult {
  id: string;
  content: string;
  similarity: number;
  metadata: {
    doc_id?: string;
    doc_name?: string;
    chunk_index?: number;
  };
}

export default function RetrievalExplorer() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedColName, setSelectedColName] = useState<string>('');
  
  // Search parameters
  const [query, setQuery] = useState<string>('');
  const [topK, setTopK] = useState<number>(3);
  
  // Results
  const [results, setResults] = useState<RetrievalResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await getData('/api/indexing/collections');
        if (data?.status === 'success') {
          setCollections(data.collections || []);
          if (data.collections?.length > 0) {
            setSelectedColName(data.collections[0].name);
          }
        }
      } catch (err: any) {
        console.error('Failed to load collections:', err);
      }
    };
    fetchCollections();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (!selectedColName) {
      setError('Please select a collection to query.');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setHasSearched(true);

    try {
      const payload = {
        query: query,
        collection_name: selectedColName,
        top_k: topK
      };

      const data = await postData('/api/retrieval/query', payload);
      if (data?.status === 'success') {
        setResults(data.results || []);
      } else {
        setError('Failed to retrieve matching document chunks.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during retrieval execution.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-3">
          <Layers className="h-8 w-8 text-orange-400" />
          Retrieval Explorer
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Sprint 5: Test vector database lookup directly. Query ➔ Embeddings ➔ Retrieval without LLM.
        </p>
      </div>

      {/* Main Search Panel */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
        
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search query or question..."
              className="w-full px-5 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 text-sm"
            />
          </div>

          <div className="flex gap-4">
            
            <div className="w-44">
              <select
                value={selectedColName}
                onChange={(e) => setSelectedColName(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs font-mono focus:outline-none"
              >
                <option value="">-- Collection --</option>
                {collections.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.name} ({col.document_count})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-24 flex items-center gap-2 px-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Top K</span>
              <input
                type="number"
                min="1"
                max="10"
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="w-full bg-transparent border-none text-slate-200 text-xs font-bold text-center focus:ring-0 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim() || !selectedColName}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl text-white text-xs font-bold tracking-wider uppercase transition-all duration-200 disabled:opacity-50 shadow-lg shadow-orange-500/10 flex items-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </button>

          </div>

        </form>

      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading Stepper */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-orange-500/20 rounded-full animate-spin border-t-orange-500"></div>
            <Compass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-orange-400 animate-pulse" />
          </div>
          <p className="text-slate-400 text-xs">Computing query embedding and searching vector index...</p>
        </div>
      )}

      {/* Results Display */}
      {!loading && results.length > 0 && (
        <div className="space-y-4">
          
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Semantic Vector Matches ({results.length}):
          </div>

          <div className="space-y-4">
            {results.map((item, index) => (
              <div
                key={item.id}
                className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-all duration-200"
              >
                {/* Result header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-slate-950 text-orange-400 rounded-lg flex items-center justify-center font-bold text-xs border border-slate-800">
                      {index + 1}
                    </span>
                    <span className="text-xs text-slate-200 font-semibold truncate max-w-xs md:max-w-md">
                      {item.metadata.doc_name || 'Anonymous Document'}
                    </span>
                    {item.metadata.chunk_index !== undefined && (
                      <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850 font-mono">
                        Chunk {item.metadata.chunk_index}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                    <span>Similarity:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                      {item.similarity.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Match text content */}
                <p className="text-sm text-slate-300 leading-relaxed font-sans pl-8 select-all whitespace-pre-wrap">
                  {item.content}
                </p>

                {/* Footer metadata details */}
                <div className="pl-8 pt-2 text-[10px] text-slate-500 font-mono flex gap-4">
                  <span>Chunk ID: {item.id}</span>
                  {item.metadata.doc_id && <span>Doc ID: {item.metadata.doc_id}</span>}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && hasSearched && !error && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/10 border border-slate-850 rounded-2xl text-slate-500 space-y-2">
          <HelpCircle className="h-8 w-8 text-slate-650" />
          <p className="text-sm">No semantically similar chunks found.</p>
          <p className="text-xs text-slate-650">Try lowering similarity barriers or index new files.</p>
        </div>
      )}

      {!loading && !hasSearched && (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-900/10 border border-slate-850 rounded-2xl text-slate-500 space-y-4">
          <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-full">
            <Layers className="h-10 w-10 text-orange-400/40 animate-pulse" />
          </div>
          <p className="text-sm">Ready to execute vector retrieval explorer</p>
          <p className="text-xs text-slate-600 max-w-sm text-center">
            Ask a question, select a ChromaDB collection, and query vectors to retrieve the Top-K chunks with similarity grades.
          </p>
        </div>
      )}
    </div>
  );
}
