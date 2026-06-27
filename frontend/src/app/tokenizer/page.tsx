'use client';

import React, { useState, useEffect } from 'react';
import { postData } from '../../utils/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Layers, 
  ArrowRight,
  Download,
  Copy,
  Info,
  HelpCircle,
  Loader2
} from 'lucide-react';

const presets: Record<string, string> = {
  "English Sentence": "I love Machine Learning and Generative AI.",
  "Python Code Block": "def greet(name: str) -> str:\n    return f\"Hello, {name}!\" # Greeting function",
  "Multilingual Text": "Hello World! Bonjour le monde! ¡Hola Mundo! Hello Welt! 🤖",
  "Tricky Token Boundaries": "tokenize, tokenization, tokenise, tokenisation, subword, sub-word, wordpiece."
};

const badgeColors = [
  { bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  { bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  { bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' },
  { bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
  { bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
  { bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' }
];

export default function TokenizerPage() {
  const [text, setText] = useState(presets["English Sentence"]);
  const [gptModel, setGptModel] = useState('cl100k_base');
  const [bertModel, setBertModel] = useState('bert-base-uncased');
  const [spModel, setSpModel] = useState('t5-small');
  const [includeSpecial, setIncludeSpecial] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTokenize = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMsg('');
    setResults(null);

    try {
      // Fetch tokenizations concurrently
      const [gptData, bertData, spData] = await Promise.all([
        postData('/api/tokenize', { text, tokenizer_type: 'gpt', model_name: gptModel }),
        postData('/api/tokenize', { text, tokenizer_type: 'bert', model_name: bertModel, include_special_tokens: includeSpecial }),
        postData('/api/tokenize', { text, tokenizer_type: 'sentencepiece', model_name: spModel, include_special_tokens: includeSpecial })
      ]);

      setResults({
        GPT: gptData,
        BERT: bertData,
        SentencePiece: spData
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Tokenization failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run tokenizer on initial mount
  useEffect(() => {
    handleTokenize();
  }, []);

  const downloadCSV = (tokenizerName: string, tokens: string[], ids: number[]) => {
    const csvRows = [
      ['Index', 'Token String', 'Token ID', 'Length (chars)'],
      ...ids.map((id, index) => [index, tokens[index], id, tokens[index]?.length || 0])
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${tokenizerName.toLowerCase()}_tokens.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (tokens: string[]) => {
    const arrayStr = `[${tokens.map(t => `'${t}'`).join(', ')}]`;
    navigator.clipboard.writeText(arrayStr);
    alert('Copied token array representation to clipboard!');
  };

  // Structure chart data
  const chartData = results ? Object.entries(results).map(([key, value]: any) => ({
    name: key,
    count: value.metrics.token_count,
    avgLen: value.metrics.avg_token_len
  })) : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-2xl backdrop-blur-md">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          🔤 Tokenizer Explorer
        </h1>
        <p className="text-xs text-slate-400">
          Analyze and compare BPE, WordPiece, and SentencePiece tokenization behaviors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Tokenizer Config Form (Sidebar style) */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Configuration
          </h2>
          
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GPT Model (BPE)</label>
              <select
                value={gptModel}
                onChange={(e) => setGptModel(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="cl100k_base">cl100k_base (GPT-4/3.5)</option>
                <option value="o200k_base">o200k_base (GPT-4o)</option>
                <option value="p50k_base">p50k_base (GPT-3/Codex)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">BERT Model (WordPiece)</label>
              <select
                value={bertModel}
                onChange={(e) => setBertModel(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="bert-base-uncased">bert-base-uncased</option>
                <option value="bert-base-cased">bert-base-cased</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SentencePiece Model</label>
              <select
                value={spModel}
                onChange={(e) => setSpModel(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="t5-small">t5-small (T5)</option>
                <option value="xlm-roberta-base">xlm-roberta-base</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-semibold">Special Tokens</span>
              <input
                type="checkbox"
                checked={includeSpecial}
                onChange={(e) => setIncludeSpecial(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-800 h-4 w-4"
              />
            </div>
          </div>
        </div>

        {/* Input Text Area and Presets */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Input Text
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Preset:</span>
              <select
                onChange={(e) => setText(presets[e.target.value])}
                className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                {Object.keys(presets).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            disabled={isLoading}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors duration-200 disabled:opacity-50"
          />

          <button
            onClick={handleTokenize}
            disabled={!text.trim() || isLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 border border-blue-500 hover:bg-blue-500 hover:border-blue-400 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-blue-500/10 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Tokenizing text...
              </>
            ) : (
              <>
                <Layers className="h-4.5 w-4.5" />
                Tokenize
              </>
            )}
          </button>
        </div>

      </div>

      {errorMsg && (
        <div className="bg-rose-900/10 border border-rose-500/20 rounded-2xl p-4 text-sm text-rose-400">
          ❌ {errorMsg}
        </div>
      )}

      {/* Main Tabbed Layout Results */}
      {results && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4">Tokenizer Comparison Dashboard</h2>
            
            {/* 1. Comparison Metrics Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Tokenizer</th>
                    <th className="py-3 px-4">Model/Encoding</th>
                    <th className="py-3 px-4">Algorithm</th>
                    <th className="py-3 px-4 text-center">Token Count</th>
                    <th className="py-3 px-4 text-center">Avg Token Len</th>
                    <th className="py-3 px-4">Longest Token</th>
                    <th className="py-3 px-4 text-center">Char/Token Ratio</th>
                    <th className="py-3 px-4 text-center">Vocab Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {Object.entries(results).map(([key, val]: any) => {
                    const modelNameStr = key === 'GPT' ? gptModel : (key === 'BERT' ? bertModel : spModel);
                    return (
                      <tr key={key} className="hover:bg-slate-950/40">
                        <td className="py-3.5 px-4 font-bold">{key}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{modelNameStr}</td>
                        <td className="py-3.5 px-4">{val.algorithm}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-blue-400">{val.metrics.token_count}</td>
                        <td className="py-3.5 px-4 text-center">{val.metrics.avg_token_len} chars</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">'{val.metrics.longest_token}' ({val.metrics.longest_token_len})</td>
                        <td className="py-3.5 px-4 text-center text-emerald-400 font-semibold">{val.metrics.char_token_ratio}</td>
                        <td className="py-3.5 px-4 text-center">{val.vocab_size.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Visualizers & Graphs Tab Block */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Color Highlighting Visualizer */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-200">🎨 Interactive Token Visualizer</h3>
                <p className="text-[10px] text-slate-500 mt-1">Hover over tokens to check IDs and indices. Spaces are visually displayed as '·'.</p>
              </div>
              
              <div className="space-y-6">
                {Object.entries(results).map(([key, val]: any) => {
                  const modelNameStr = key === 'GPT' ? gptModel : (key === 'BERT' ? bertModel : spModel);
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                        <span>{key} ({modelNameStr})</span>
                        <span className="text-slate-500">Tokens: {val.metrics.token_count}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 p-4 bg-slate-950 border border-slate-850 rounded-2xl">
                        {val.tokens.map((token: string, idx: number) => {
                          const style = badgeColors[idx % badgeColors.length];
                          // Replace regular spaces with middle dot, keep SentencePiece block characters
                          const displayToken = token.replace(/ /g, '·');
                          
                          return (
                            <span
                              key={idx}
                              title={`Index: ${idx}\nToken ID: ${val.ids[idx]}\nRaw: ${token}`}
                              className={`px-2 py-0.5 border rounded font-mono text-xs cursor-help select-all transition-all duration-150 hover:scale-105 ${style.bg}`}
                            >
                              {displayToken}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visualizer Charts */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-200">📊 Recharts Graphs</h3>
                <p className="text-[10px] text-slate-500 mt-1">Graphical representation of token density metrics.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
                {/* Count Chart */}
                <div className="flex flex-col h-full">
                  <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider mb-2">Token Counts (Lower is better)</div>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', fontSize: '10px' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b'][index % 3]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Avg Len Chart */}
                <div className="flex flex-col h-full">
                  <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider mb-2">Avg Token Length (chars)</div>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', fontSize: '10px' }} />
                      <Bar dataKey="avgLen" fill="#10b981" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b'][index % 3]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>

          {/* 3. Detailed Data tables */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(results).map(([key, val]: any) => (
              <div key={key} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col h-96">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-200">{key} Details</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(val.tokens)}
                      title="Copy raw token list"
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => downloadCSV(key, val.tokens, val.ids)}
                      title="Download CSV"
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-950 rounded-2xl border border-slate-850 p-3 min-h-0 text-xs font-mono">
                  <div className="grid grid-cols-4 border-b border-slate-800 pb-2 text-slate-500 font-bold uppercase tracking-wider">
                    <span>Index</span>
                    <span className="col-span-2">Token</span>
                    <span>ID</span>
                  </div>
                  <div className="divide-y divide-slate-850/60 max-h-80 overflow-y-auto">
                    {val.ids.map((id: number, idx: number) => (
                      <div key={idx} className="grid grid-cols-4 py-2 hover:bg-slate-900/40 text-slate-300">
                        <span>{idx}</span>
                        <span className="col-span-2 text-blue-400 font-bold truncate">'{val.tokens[idx]}'</span>
                        <span className="text-slate-400">{id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
