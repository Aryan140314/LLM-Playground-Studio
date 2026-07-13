'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Scissors, Settings, Sliders, ChevronRight, FileText, Loader2, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { postData, getData } from '../../utils/api';

interface DocumentMeta {
  id: string;
  filename: string;
  page_count: number;
  word_count: number;
}

interface Chunk {
  chunk_index: number;
  text: string;
  char_count: number;
  word_count: number;
  token_count: number;
  metadata: {
    strategy: string;
    start_char?: number;
    end_char?: number;
    start_token?: number;
    end_token?: number;
    boundary_similarity?: number;
    parent_id?: string;
    child_id?: string;
    is_parent?: boolean;
    child_count?: number;
  };
}

export default function ChunkingExplorer() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [strategy, setStrategy] = useState<'fixed' | 'semantic' | 'hierarchical'>('fixed');
  
  // Chunker params
  const [chunkSize, setChunkSize] = useState<number>(500);
  const [chunkOverlap, setChunkOverlap] = useState<number>(50);
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(0.6);
  const [useTokens, setUseTokens] = useState<boolean>(false);

  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch document list on mount
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await getData('/api/documents');
        if (data?.status === 'success') {
          setDocuments(data.documents || []);
        }
      } catch (err: any) {
        console.error('Failed to load documents:', err);
      }
    };
    fetchDocs();
  }, []);

  // Handle document selection to load its text content
  const handleDocChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docId = e.target.value;
    setSelectedDocId(docId);
    if (!docId) {
      setRawText('');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await getData(`/api/documents/${docId}`);
      if (data?.status === 'success') {
        setRawText(data.content || '');
      }
    } catch (err: any) {
      setError('Failed to load document content: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunChunking = async () => {
    if (!rawText.trim()) {
      setError('Please provide text or select a document first.');
      return;
    }

    setLoading(true);
    setError('');
    setChunks([]);

    try {
      const payload = {
        text: rawText,
        strategy,
        chunk_size: chunkSize,
        chunk_overlap: chunkOverlap,
        similarity_threshold: similarityThreshold,
        use_tokens: useTokens
      };

      const data = await postData('/api/chunking/preview', payload);
      if (data?.status === 'success') {
        setChunks(data.chunks || []);
      } else {
        setError('Failed to perform chunking.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during chunking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-3">
          <Scissors className="h-8 w-8 text-orange-400" />
          Chunking Explorer
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore and benchmark split techniques: Fixed-size, Semantic, and Hierarchical (Parent-Child)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          
          <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-800 pb-3">
            <Settings className="h-4 w-4 text-orange-400" />
            Config Parameters
          </div>

          {/* Select Doc or Type */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Select Document Source</label>
            <select
              value={selectedDocId}
              onChange={handleDocChange}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-orange-500/50 text-sm"
            >
              <option value="">-- Or enter raw text below --</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename} ({doc.word_count.toLocaleString()} words)
                </option>
              ))}
            </select>
          </div>

          {/* Text Input area (if no doc selected) */}
          {!selectedDocId && (
            <div className="space-y-2">
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Raw Text Input</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste your document content here to run chunking explorer..."
                rows={6}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 text-sm"
              />
            </div>
          )}

          {/* Chunker Strategy Selection */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Chunking Strategy</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'fixed', label: 'Fixed Size' },
                { id: 'semantic', label: 'Semantic' },
                { id: 'hierarchical', label: 'Hierarchical' },
              ].map((strat) => (
                <button
                  key={strat.id}
                  onClick={() => setStrategy(strat.id as any)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    strategy === strat.id
                      ? 'bg-orange-500/10 border-orange-500/50 text-orange-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {strat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Strategy Specific Settings */}
          {strategy === 'fixed' && (
            <div className="space-y-4 pt-2 border-t border-slate-800/60">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Chunk Size ({useTokens ? 'Tokens' : 'Chars'})</span>
                  <span className="text-orange-400 font-semibold">{chunkSize}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="50"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Chunk Overlap</span>
                  <span className="text-orange-400 font-semibold">{chunkOverlap}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="10"
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">Use Tiktoken tokenizer</span>
                <input
                  type="checkbox"
                  checked={useTokens}
                  onChange={(e) => setUseTokens(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-orange-500 focus:ring-0 focus:ring-offset-0"
                />
              </div>
            </div>
          )}

          {strategy === 'semantic' && (
            <div className="space-y-4 pt-2 border-t border-slate-800/60">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Similarity Threshold</span>
                  <span className="text-orange-400 font-semibold">{similarityThreshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  Lower threshold = larger chunks, higher = more splits.
                </div>
              </div>
            </div>
          )}

          {strategy === 'hierarchical' && (
            <div className="space-y-4 pt-2 border-t border-slate-800/60">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Parent Size (Chars)</span>
                  <span className="text-orange-400 font-semibold">{chunkSize}</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="2000"
                  step="100"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Parent Overlap</span>
                  <span className="text-orange-400 font-semibold">{chunkOverlap}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="10"
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1 text-slate-400 text-[11px]">
                <div className="font-semibold text-slate-300">Auto Child Configuration:</div>
                <div>Child Size: <span className="text-orange-400 font-mono font-semibold">{Math.max(Math.floor(chunkSize / 4), 100)} chars</span></div>
                <div>Child Overlap: <span className="text-orange-400 font-mono font-semibold">{Math.max(Math.floor(chunkSize / 40), 10)} chars</span></div>
              </div>
            </div>
          )}

          <button
            onClick={handleRunChunking}
            disabled={loading || (!selectedDocId && !rawText.trim())}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl text-sm text-white font-bold tracking-wide transition-all duration-200 disabled:opacity-50 shadow-lg shadow-orange-500/10"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
            Preview Chunks
          </button>
        </div>

        {/* Results Explorer Display Panel */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Stats Bar */}
          {chunks.length > 0 && (
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-400">
              <div>Total Chunks: <span className="text-orange-400 font-bold font-mono text-sm">{chunks.length}</span></div>
              <div>Average Size: <span className="text-orange-400 font-bold font-mono text-sm">
                {Math.round(chunks.reduce((sum, c) => sum + c.char_count, 0) / chunks.length)} chars
              </span></div>
              <div className="text-slate-500 capitalize">Strategy: <span className="text-orange-400/80 font-semibold">{strategy}</span></div>
            </div>
          )}

          {/* Preview list */}
          {chunks.length > 0 ? (
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {chunks.map((chunk) => {
                const isParent = chunk.metadata.strategy === 'hierarchical_parent';
                const isChild = chunk.metadata.strategy === 'hierarchical_child';
                
                return (
                  <div
                    key={chunk.chunk_index}
                    className={`p-5 rounded-2xl border transition-all duration-200 relative ${
                      isParent
                        ? 'bg-slate-900/80 border-slate-700 shadow-md shadow-slate-900/50'
                        : isChild
                        ? 'bg-slate-950/40 border-slate-850/80 ml-6 border-l-2 border-l-orange-500/30'
                        : 'bg-slate-900/40 border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    {/* Badge headers */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          isParent 
                            ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400' 
                            : isChild 
                            ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' 
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {isParent ? 'Parent Chunk' : isChild ? 'Child Chunk' : `Chunk ${chunk.chunk_index}`}
                        </span>
                        
                        {chunk.metadata.boundary_similarity !== undefined && chunk.metadata.boundary_similarity !== null && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            Boundary Similarity: <span className="text-emerald-400 font-semibold">{chunk.metadata.boundary_similarity}</span>
                          </span>
                        )}
                        
                        {isChild && chunk.metadata.child_id && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            ID: <span className="text-cyan-400">{chunk.metadata.child_id}</span>
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-3 text-[11px] text-slate-500 font-mono">
                        <span>{chunk.token_count} tokens</span>
                        <span>{chunk.char_count} chars</span>
                        <span>{chunk.word_count} words</span>
                      </div>
                    </div>

                    {/* Chunk body text */}
                    <p className="text-sm text-slate-300 leading-relaxed font-sans select-all whitespace-pre-wrap">
                      {chunk.text}
                    </p>

                    {/* Hierarchical parent connections */}
                    {isParent && chunk.metadata.child_count && (
                      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Parent ID: <span className="text-orange-400/80 font-mono">{chunk.metadata.parent_id}</span></span>
                        <span className="flex items-center gap-1">
                          Contains {chunk.metadata.child_count} sub-chunks
                          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-900/20 border border-slate-850 rounded-2xl text-slate-500 space-y-4">
              <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-full">
                <Layers className="h-10 w-10 text-orange-400/40" />
              </div>
              <p className="text-sm">Ready to generate split preview</p>
              <p className="text-xs text-slate-600 max-w-sm text-center">
                Configure your split sizes or thresholds on the left panel, click &quot;Preview Chunks&quot; to inspect output.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
