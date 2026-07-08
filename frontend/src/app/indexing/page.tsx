'use client';

import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Layers, Cpu, Compass, Play, Loader2, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { postData, getData } from '../../utils/api';

interface Collection {
  name: string;
  document_count: number;
  metadata: Record<string, any>;
}

interface DocumentMeta {
  id: string;
  filename: string;
  word_count: number;
}

export default function IndexingExplorer() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  
  // Form states
  const [newColName, setNewColName] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedColName, setSelectedColName] = useState('');
  
  // Pipeline details
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [indexingStatus, setIndexingStatus] = useState<'idle' | 'chunking' | 'embedding' | 'storing' | 'done'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  const fetchCollections = async () => {
    try {
      const data = await getData('/api/indexing/collections');
      if (data?.status === 'success') {
        setCollections(data.collections || []);
        if (data.collections?.length > 0 && !selectedColName) {
          setSelectedColName(data.collections[0].name);
        }
      }
    } catch (err: any) {
      console.error('Failed to load collections:', err);
    }
  };

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

  useEffect(() => {
    fetchCollections();
    fetchDocs();
  }, []);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    setError('');
    try {
      const data = await postData('/api/indexing/collections/create', { name: newColName });
      if (data?.status === 'success') {
        setNewColName('');
        await fetchCollections();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create collection');
    }
  };

  const handleDeleteCollection = async (name: string) => {
    if (!confirm(`Are you sure you want to delete collection "${name}"? All vectors will be permanently lost.`)) {
      return;
    }

    setError('');
    try {
      const res = await fetch(`http://localhost:8000/api/indexing/collections/${name}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchCollections();
        if (selectedColName === name) setSelectedColName('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete collection');
    }
  };

  const handleIndexPipeline = async () => {
    if (!selectedDocId || !selectedColName) {
      setError('Please select both a source document and a target collection.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // 1. Load document content
      setIndexingStatus('chunking');
      setStatusMessage('Fetching content and generating text chunks...');
      const docData = await getData(`/api/documents/${selectedDocId}`);
      const rawText = docData.content || '';
      const docMeta = docData.document;

      // 2. Perform chunking split (fixed size character split)
      const chunkData = await postData('/api/chunking/preview', {
        text: rawText,
        strategy: 'fixed',
        chunk_size: chunkSize,
        chunk_overlap: chunkOverlap
      });
      const chunks = chunkData.chunks || [];
      const chunkTexts = chunks.map((c: any) => c.text);

      if (chunks.length === 0) {
        throw new Error('Document resulted in 0 text chunks. Check content size.');
      }

      // 3. Generate Embeddings for chunks
      setIndexingStatus('embedding');
      setStatusMessage(`Vectorizing ${chunks.length} chunks via sentence-transformers (384 dims)...`);
      const embedData = await postData('/api/embedding-pipeline/process', { chunks: chunkTexts });
      const embeddings = embedData.embeddings || [];

      // 4. Index into ChromaDB
      setIndexingStatus('storing');
      setStatusMessage(`Writing chunks and embeddings into ChromaDB collection "${selectedColName}"...`);
      await postData('/api/indexing/index', {
        collection_name: selectedColName,
        chunks: chunkTexts,
        embeddings: embeddings,
        doc_id: docMeta.id,
        doc_name: docMeta.filename
      });

      // 5. Complete
      setIndexingStatus('done');
      setStatusMessage(`Successfully indexed "${docMeta.filename}"! Created ${chunks.length} embeddings.`);
      await fetchCollections();
    } catch (err: any) {
      setError(err.message || 'Error occurred during the indexing pipeline.');
      setIndexingStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-3">
          <Database className="h-8 w-8 text-orange-400" />
          ChromaDB Indexing
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Sprint 4: Create collections and feed embedding vectors directly into your database
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Collections Panel */}
        <div className="lg:col-span-1 space-y-6 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-slate-300 font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-orange-400" />
              Database Collections
            </span>
          </div>

          {/* Create form */}
          <form onSubmit={handleCreateCollection} className="flex gap-2">
            <input
              type="text"
              placeholder="New collection name..."
              value={newColName}
              onChange={(e) => setNewColName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 placeholder-slate-650 text-xs focus:outline-none focus:border-orange-500/50"
            />
            <button
              type="submit"
              className="p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
              title="Create Collection"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>

          {/* Collection lists */}
          <div className="space-y-2">
            {collections.map((col) => (
              <div
                key={col.name}
                className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200 font-mono">{col.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{col.document_count} items (chunks) stored</div>
                </div>
                <button
                  onClick={() => handleDeleteCollection(col.name)}
                  className="p-1.5 hover:bg-rose-500/20 text-rose-400/80 hover:text-rose-450 rounded-lg transition-all border border-transparent hover:border-rose-500/10"
                  title="Delete Collection"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Ingestion Pipeline Panel */}
        <div className="lg:col-span-2 space-y-6 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-800 pb-3">
            <Play className="h-4 w-4 text-orange-400 animate-pulse" />
            Ingestion Pipeline (Chunks → Embeddings → database)
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Pipeline Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Source Document</label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none"
              >
                <option value="">-- Choose uploaded document --</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.filename}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500">Target Collection</label>
              <select
                value={selectedColName}
                onChange={(e) => setSelectedColName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none font-mono"
              >
                <option value="">-- Choose collection --</option>
                {collections.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500">Chunk Size (Chars)</label>
              <input
                type="number"
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500">Overlap Size (Chars)</label>
              <input
                type="number"
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs"
              />
            </div>

          </div>

          {/* Action Trigger */}
          <button
            onClick={handleIndexPipeline}
            disabled={loading || !selectedDocId || !selectedColName}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl text-xs font-bold text-white transition-all duration-200 disabled:opacity-50 shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Play className="h-4.5 w-4.5" />}
            Execute Indexing Pipeline
          </button>

          {/* Interactive Progress Tracking */}
          {indexingStatus !== 'idle' && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {loading ? (
                    <div className="w-8 h-8 border-2 border-orange-500/20 rounded-full animate-spin border-t-orange-500"></div>
                  ) : (
                    <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 capitalize">Status: {indexingStatus}</div>
                  <div className="text-[10px] text-slate-450 mt-0.5">{statusMessage}</div>
                </div>
              </div>

              {/* Progress Flow Map */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                {[
                  { id: 'chunking', label: '1. Chunking split', icon: Layers, activeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
                  { id: 'embedding', label: '2. Embedding vectors', icon: Compass, activeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
                  { id: 'storing', label: '3. ChromaDB index', icon: Database, activeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
                ].map((step) => {
                  const isActive = indexingStatus === step.id;
                  const isDone = 
                    (step.id === 'chunking' && (indexingStatus === 'embedding' || indexingStatus === 'storing' || indexingStatus === 'done')) ||
                    (step.id === 'embedding' && (indexingStatus === 'storing' || indexingStatus === 'done')) ||
                    (step.id === 'storing' && indexingStatus === 'done');

                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-xl border text-[10px] font-semibold transition-all duration-300 flex flex-col items-center gap-1.5 ${
                        isActive
                          ? step.activeColor
                          : isDone
                          ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                          : 'text-slate-500 border-slate-850 bg-slate-950/20'
                      }`}
                    >
                      <step.icon className="h-4 w-4" />
                      {step.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
