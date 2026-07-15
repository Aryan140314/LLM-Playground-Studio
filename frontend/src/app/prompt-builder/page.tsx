'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Database, Compass, ChevronRight, Play, Loader2, ArrowRight, Check, HelpCircle, Puzzle, Eye, HelpCircle as HelpIcon, Sparkles } from 'lucide-react';
import { postData, getData } from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

interface Collection {
  name: string;
  document_count: number;
}

interface RetrievedChunk {
  id: string;
  content: string;
  similarity: number;
  metadata: {
    doc_name?: string;
    chunk_index?: number;
  };
}

export default function PromptBuilder() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedColName, setSelectedColName] = useState<string>('');
  
  // Retrieval search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [topK, setTopK] = useState<number>(3);
  const [retrievedChunks, setRetrievedChunks] = useState<RetrievedChunk[]>([]);
  const [selectedChunkIds, setSelectedChunkIds] = useState<Set<string>>(new Set());
  const [retrievalLoading, setRetrievalLoading] = useState<boolean>(false);

  // Prompt building
  const [systemInstructions, setSystemInstructions] = useState<string>(
    "You are a helpful RAG assistant. Answer the user's question using the provided context chunks. " +
    "If the context does not contain the answer, state that you do not know. " +
    "Be concise, truthful, and reference your source documents when possible."
  );
  const [userQuestion, setUserQuestion] = useState<string>('');
  
  // Output
  const [fullPrompt, setFullPrompt] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);
  const [wordCount, setWordCount] = useState<number>(0);
  const [tokenCount, setTokenCount] = useState<number>(0);
  const [buildLoading, setBuildLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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

  const handleFetchContext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !selectedColName) return;

    setRetrievalLoading(true);
    setError('');
    setRetrievedChunks([]);
    setSelectedChunkIds(new Set());
    setFullPrompt('');

    try {
      const data = await postData('/api/retrieval/query', {
        query: searchQuery,
        collection_name: selectedColName,
        top_k: topK
      });
      if (data?.status === 'success') {
        const chunks = data.results || [];
        setRetrievedChunks(chunks);
        // Default select all retrieved chunks
        setSelectedChunkIds(new Set(chunks.map((c: any) => c.id)));
      } else {
        setError('Failed to fetch context chunks.');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing retrieval context search.');
    } finally {
      setRetrievalLoading(false);
    }
  };

  const handleToggleChunk = (id: string) => {
    const next = new Set(selectedChunkIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedChunkIds(next);
  };

  const handleConstructPrompt = async () => {
    if (!userQuestion.trim()) {
      setError('Please provide a final question for the prompt.');
      return;
    }

    setBuildLoading(true);
    setError('');

    try {
      // Filter only selected chunks
      const activeContexts = retrievedChunks.filter(c => selectedChunkIds.has(c.id));
      
      const payload = {
        question: userQuestion,
        contexts: activeContexts,
        system_instructions: systemInstructions
      };

      const data = await postData('/api/prompt-builder/build', payload);
      if (data?.status === 'success') {
        setFullPrompt(data.full_prompt || '');
        setCharCount(data.char_count || 0);
        setWordCount(data.word_count || 0);
        setTokenCount(data.token_count || 0);
      } else {
        setError('Failed to construct prompt.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during prompt construction.');
    } finally {
      setBuildLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-3">
          <Puzzle className="h-8 w-8 text-orange-400" />
          Prompt Builder
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>
          Sprint 6: Ground prompts with retrieved knowledge context and custom system directives
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-450 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Grounding & Context (Left Panel) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 1: Context Retriever */}
          <div className={`p-6 border rounded-2xl space-y-4 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm text-orange-400 uppercase tracking-wider">
              <Database className="h-4.5 w-4.5" />
              1. Retrieve Context Grounding
            </div>

            <form onSubmit={handleFetchContext} className="flex gap-3">
              <input
                type="text"
                placeholder="Enter context search query (e.g. LLM training)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 px-4 py-3 border rounded-xl text-xs focus:outline-none ${
                  isDark ? 'bg-slate-950 border-slate-850 text-slate-100' : 'bg-slate-50 border-slate-205 text-slate-900'
                }`}
              />
              
              <select
                value={selectedColName}
                onChange={(e) => setSelectedColName(e.target.value)}
                className={`w-36 px-3 py-3 border rounded-xl text-xs font-mono focus:outline-none ${
                  isDark ? 'bg-slate-950 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-205 text-slate-700'
                }`}
              >
                <option value="">-- DB Col --</option>
                {collections.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={retrievalLoading || !searchQuery.trim() || !selectedColName}
                className="px-5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 shrink-0"
              >
                {retrievalLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                Retrieve
              </button>
            </form>

            {/* List Retrieved Chunks with check box selectors */}
            {retrievedChunks.length > 0 && (
              <div className="space-y-2 pt-2 max-h-[30vh] overflow-y-auto pr-1">
                {retrievedChunks.map((chunk) => {
                  const isChecked = selectedChunkIds.has(chunk.id);
                  return (
                    <div
                      key={chunk.id}
                      onClick={() => handleToggleChunk(chunk.id)}
                      className={`p-3.5 border rounded-xl flex gap-3 items-start cursor-pointer transition-all duration-200 ${
                        isChecked
                          ? isDark 
                            ? 'bg-orange-500/10 border-orange-500/30' 
                            : 'bg-orange-50 border-orange-200'
                          : isDark
                          ? 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                          : 'bg-slate-50 border-slate-150 hover:border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by onClick of container
                        className="mt-1 h-3.5 w-3.5 rounded text-orange-500 focus:ring-0 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                          <span>{chunk.metadata.doc_name} (Chunk {chunk.metadata.chunk_index})</span>
                          <span className="text-emerald-400 font-mono">Sim: {chunk.similarity.toFixed(4)}</span>
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${isDark ? 'text-slate-350' : 'text-slate-650'}`}>
                          {chunk.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: System Instructions & Question */}
          <div className={`p-6 border rounded-2xl space-y-4 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm text-orange-400 uppercase tracking-wider">
              <Compass className="h-4.5 w-4.5" />
              2. Custom Directives & Prompt Input
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">System Instructions</label>
              <textarea
                rows={3}
                value={systemInstructions}
                onChange={(e) => setSystemInstructions(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-xs focus:outline-none leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-205 text-slate-700'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">User Question</label>
              <input
                type="text"
                placeholder="What would you like to ask the RAG pipeline? (e.g. Tell me about BPE tokenizer...)"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                className={`w-full px-4 py-3.5 border rounded-xl text-xs focus:outline-none ${
                  isDark ? 'bg-slate-950 border-slate-850 text-slate-100' : 'bg-slate-50 border-slate-205 text-slate-900'
                }`}
              />
            </div>

            <button
              onClick={handleConstructPrompt}
              disabled={buildLoading || !userQuestion.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {buildLoading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Puzzle className="h-4.5 w-4.5" />}
              Construct Grounded Prompt
            </button>
          </div>

        </div>

        {/* Prompt Output Workspace (Right Panel) */}
        <div className="lg:col-span-5 space-y-6">
          
          {fullPrompt ? (
            <div className={`p-6 border rounded-2xl space-y-4 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              
              <div className="flex items-center justify-between border-b border-slate-800/20 pb-3">
                <span className="flex items-center gap-2 font-bold text-sm text-orange-400 uppercase tracking-wider">
                  <Eye className="h-4.5 w-4.5" />
                  Constructed Prompt
                </span>
              </div>

              {/* Statistics telemetry */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className={`p-2.5 border rounded-xl ${isDark ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-150'}`}>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Tokens</div>
                  <div className="text-sm font-extrabold text-orange-400 font-mono mt-0.5">{tokenCount}</div>
                </div>

                <div className={`p-2.5 border rounded-xl ${isDark ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-150'}`}>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Characters</div>
                  <div className="text-sm font-extrabold text-orange-400 font-mono mt-0.5">{charCount}</div>
                </div>

                <div className={`p-2.5 border rounded-xl ${isDark ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-150'}`}>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Words</div>
                  <div className="text-sm font-extrabold text-orange-400 font-mono mt-0.5">{wordCount}</div>
                </div>
              </div>

              {/* Textarea containing constructed output */}
              <div className="relative">
                <textarea
                  readOnly
                  value={fullPrompt}
                  rows={14}
                  className={`w-full px-4 py-3 border rounded-xl text-xs font-mono focus:outline-none leading-relaxed select-all ${
                    isDark ? 'bg-slate-950 border-slate-850 text-slate-350' : 'bg-slate-50 border-slate-205 text-slate-750'
                  }`}
                />
              </div>

              <div className={`p-3 border rounded-xl flex items-start gap-2.5 text-[11px] ${
                isDark ? 'bg-slate-950/40 border-slate-850 text-slate-500' : 'bg-slate-50 border-slate-150 text-slate-600'
              }`}>
                <HelpIcon className="h-4.5 w-4.5 text-orange-400 shrink-0 mt-0.5" />
                This prompt block contains both system directives, retrieved context, and the query. Copy this prompt to prompt engineering labs, or proceed to next sprint to hook up LLM generation!
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 bg-slate-900/10 border border-slate-850 rounded-2xl text-slate-500 space-y-4">
              <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-full">
                <Puzzle className="h-10 w-10 text-orange-400/40" />
              </div>
              <p className="text-sm">Grounding workspace empty</p>
              <p className="text-xs text-slate-600 max-w-xs text-center">
                Configure your system directives, select context sources, and click &quot;Construct Grounded Prompt&quot; to review results!
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
