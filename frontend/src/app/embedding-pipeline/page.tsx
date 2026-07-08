'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Compass, Cpu, Clock, Table, Loader2, BookOpen, AlertCircle, Copy, Check } from 'lucide-react';
import { postData, getData } from '../../utils/api';

interface DocumentMeta {
  id: string;
  filename: string;
  word_count: number;
}

interface ChunkResult {
  chunk_index: number;
  text: string;
  char_count: number;
  word_count: number;
}

export default function EmbeddingPipeline() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  
  // Chunking params
  const [chunkSize, setChunkSize] = useState<number>(500);
  const [chunkOverlap, setChunkOverlap] = useState<number>(50);
  const [chunks, setChunks] = useState<ChunkResult[]>([]);
  
  // Pipeline output
  const [modelName, setModelName] = useState<string>('');
  const [dimension, setDimension] = useState<number>(0);
  const [generationTime, setGenerationTime] = useState<number>(0);
  const [embeddings, setEmbeddings] = useState<number[][]>([]);
  
  const [loading, setLoading] = useState(false);
  const [embeddingLoading, setEmbeddingLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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
    setEmbeddings([]);

    try {
      const payload = {
        text: rawText,
        strategy: 'fixed',
        chunk_size: chunkSize,
        chunk_overlap: chunkOverlap,
      };

      const data = await postData('/api/chunking/preview', payload);
      if (data?.status === 'success') {
        setChunks(data.chunks || []);
      } else {
        setError('Failed to divide document into chunks.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during chunking');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEmbeddings = async () => {
    if (chunks.length === 0) return;

    setEmbeddingLoading(true);
    setError('');

    try {
      const chunkTexts = chunks.map((c) => c.text);
      const data = await postData('/api/embedding-pipeline/process', { chunks: chunkTexts });
      
      if (data?.status === 'success') {
        setModelName(data.model_name);
        setDimension(data.dimension);
        setGenerationTime(data.generation_time_sec);
        setEmbeddings(data.embeddings || []);
      } else {
        setError('Failed to run embedding pipeline.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during embedding generation');
    } finally {
      setEmbeddingLoading(false);
    }
  };

  const handleCopyVector = (vector: number[], idx: number) => {
    navigator.clipboard.writeText(JSON.stringify(vector));
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-3">
          <Compass className="h-8 w-8 text-orange-400" />
          Embedding Pipeline
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Sprint 3: Convert text chunks into high-dimensional vector representations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Input & Chunk Settings */}
        <div className="lg:col-span-1 space-y-6 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-800 pb-3">
            <Layers className="h-4 w-4 text-orange-400" />
            1. Document & Chunking
          </div>

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
                  {doc.filename}
                </option>
              ))}
            </select>
          </div>

          {!selectedDocId && (
            <div className="space-y-2">
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Raw Text Input</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste text chunks here to process..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 text-sm"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Chunk Size</label>
              <input
                type="number"
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Overlap</label>
              <input
                type="number"
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs"
              />
            </div>
          </div>

          <button
            onClick={handleRunChunking}
            disabled={loading || (!selectedDocId && !rawText.trim())}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Layers className="h-4.5 w-4.5" />}
            Generate Chunks ({chunks.length} total)
          </button>

          {chunks.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Cpu className="h-4 w-4 text-orange-400" />
                2. Embedding Generator
              </div>

              <button
                onClick={handleGenerateEmbeddings}
                disabled={embeddingLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl text-xs font-bold text-white transition-all duration-200 disabled:opacity-50 shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
              >
                {embeddingLoading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Compass className="h-4.5 w-4.5" />}
                Process Embeddings Pipeline
              </button>
            </div>
          )}
        </div>

        {/* Right Output & Visualization */}
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Pipeline stats */}
          {embeddings.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  <Cpu className="h-3.5 w-3.5 text-amber-400" /> Model Name
                </div>
                <div className="text-sm font-bold text-slate-200 mt-1 truncate">{modelName}</div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  <Table className="h-3.5 w-3.5 text-cyan-400" /> Dimensions
                </div>
                <div className="text-xl font-bold text-slate-200 mt-1 font-mono">{dimension} dims</div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  <Clock className="h-3.5 w-3.5 text-rose-400" /> Latency
                </div>
                <div className="text-xl font-bold text-slate-200 mt-1 font-mono text-rose-400">{generationTime}s</div>
              </div>
            </div>
          )}

          {/* Vectors Table */}
          {embeddings.length > 0 ? (
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Chunk Reference & Text Fragment</span>
                <span>Embedding Vector Preview (First 5 dimensions)</span>
              </div>
              <div className="divide-y divide-slate-800 max-h-[60vh] overflow-y-auto">
                {chunks.map((chunk, idx) => {
                  const vector = embeddings[idx] || [];
                  const vectorPreview = vector.slice(0, 5).map((v) => v.toFixed(5)).join(', ') + '...';
                  const isCopied = copiedIndex === idx;

                  return (
                    <div key={chunk.chunk_index} className="p-5 flex items-start gap-6 hover:bg-slate-900/20 transition-all duration-200">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chunk {chunk.chunk_index}</div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{chunk.text}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2 text-right shrink-0">
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-lg flex items-center gap-2">
                          [{vectorPreview}]
                          <button
                            onClick={() => handleCopyVector(vector, idx)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
                            title="Copy Vector JSON"
                          >
                            {isCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-900/20 border border-slate-850 rounded-2xl text-slate-500 space-y-4">
              <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-full">
                <Compass className="h-10 w-10 text-orange-400/40" />
              </div>
              <p className="text-sm">Generate chunks first, then run embedding pipeline</p>
              <p className="text-xs text-slate-600 max-w-sm text-center">
                Your chunks will be vectorized using sentence-transformers, generating dense semantic matrices.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
