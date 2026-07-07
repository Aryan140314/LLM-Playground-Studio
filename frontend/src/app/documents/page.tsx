'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Trash2, Eye, BarChart2, Loader2, X, ChevronDown, ChevronUp, BookOpen, FileType } from 'lucide-react';
import { postData, getData } from '../../utils/api';

interface DocumentMeta {
  id: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  page_count: number;
  word_count: number;
  char_count: number;
  uploaded_at: string;
}

interface DocStats {
  total_documents: number;
  total_pages: number;
  total_words: number;
  total_chars: number;
  total_size_bytes: number;
  file_types: Record<string, number>;
}

export default function DocumentManager() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [stats, setStats] = useState<DocStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [error, setError] = useState('');
  const [viewingDoc, setViewingDoc] = useState<{ meta: DocumentMeta; content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const data = await getData('/api/documents');
      if (data?.status === 'success') {
        setDocuments(data.documents || []);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getData('/api/documents/stats/overview');
      if (data?.status === 'success') {
        setStats(data.statistics);
      }
    } catch (err: any) {
      console.error('Stats error:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:8000/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(errData.detail || 'Upload failed');
      }

      await fetchDocuments();
      await fetchStats();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoadSample = async () => {
    setLoadingSample(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/documents/load-sample', { method: 'POST' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: 'Failed' }));
        throw new Error(errData.detail || 'Failed to load sample');
      }
      await fetchDocuments();
      await fetchStats();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingSample(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/documents/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchDocuments();
        await fetchStats();
        if (viewingDoc?.meta.id === docId) setViewingDoc(null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleView = async (doc: DocumentMeta) => {
    try {
      const data = await getData(`/api/documents/${doc.id}`);
      if (data?.status === 'success') {
        setViewingDoc({ meta: doc, content: data.content || '' });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      PDF: 'text-rose-400 bg-rose-400/10 border-rose-500/30',
      DOCX: 'text-blue-400 bg-blue-400/10 border-blue-500/30',
      TXT: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/30',
      MD: 'text-purple-400 bg-purple-400/10 border-purple-500/30',
    };
    return colors[type] || 'text-slate-400 bg-slate-400/10 border-slate-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
            Document Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload, view, and manage documents for the RAG pipeline
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLoadSample}
            disabled={loadingSample}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-slate-300 transition-all duration-200 disabled:opacity-50"
          >
            {loadingSample ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
            Load Sample PDF
          </button>
          <label className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl text-sm text-white font-semibold cursor-pointer transition-all duration-200 shadow-lg shadow-amber-500/20">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Document
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError('')}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && stats.total_documents > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Documents', value: stats.total_documents, color: 'text-amber-400' },
            { label: 'Pages', value: stats.total_pages, color: 'text-cyan-400' },
            { label: 'Words', value: stats.total_words.toLocaleString(), color: 'text-emerald-400' },
            { label: 'Characters', value: stats.total_chars.toLocaleString(), color: 'text-purple-400' },
            { label: 'Total Size', value: formatBytes(stats.total_size_bytes), color: 'text-rose-400' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* File Type Breakdown */}
      {stats && stats.total_documents > 0 && Object.keys(stats.file_types).length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 uppercase tracking-wider">File Types:</span>
          {Object.entries(stats.file_types).map(([type, count]) => (
            <span key={type} className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getFileTypeColor(type)}`}>
              {type} ({count})
            </span>
          ))}
        </div>
      )}

      {/* Document List */}
      {documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition-all duration-200"
            >
              {/* File Type Badge */}
              <div className={`p-3 rounded-xl border ${getFileTypeColor(doc.file_type)}`}>
                <FileType className="h-5 w-5" />
              </div>

              {/* Document Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-200 truncate">{doc.filename}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-slate-500">{doc.page_count} pages</span>
                  <span className="text-xs text-slate-500">{doc.word_count.toLocaleString()} words</span>
                  <span className="text-xs text-slate-500">{formatBytes(doc.file_size_bytes)}</span>
                  <span className="text-xs text-slate-600">{doc.uploaded_at}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleView(doc)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-all duration-200 border border-slate-700"
                  title="View Content"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-all duration-200 border border-slate-700 hover:border-rose-500/30"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-slate-500">
          <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-full">
            <FileText className="h-10 w-10 text-amber-400/40" />
          </div>
          <p className="text-sm">No documents uploaded yet</p>
          <p className="text-xs text-slate-600 max-w-md text-center">
            Upload a PDF, DOCX, TXT, or Markdown file to begin building your RAG knowledge base.
            Or click &quot;Load Sample PDF&quot; to use our pre-built LLM Foundations document.
          </p>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-semibold text-slate-200">{viewingDoc.meta.filename}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {viewingDoc.meta.page_count} pages | {viewingDoc.meta.word_count.toLocaleString()} words | {formatBytes(viewingDoc.meta.file_size_bytes)}
                </p>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {viewingDoc.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
