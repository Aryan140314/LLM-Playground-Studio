'use client';

import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
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
  Scale, 
  Clock, 
  FileText, 
  Loader2,
  Bot
} from 'lucide-react';

const presets: Record<string, string> = {
  "Explain Technical Concept": "Explain the difference between a Python list and a tuple in simple terms.",
  "Logical Reasoning Riddle": "A brother and sister were born on the same day, in the same year, at the same time, but they are not twins. How is this possible?",
  "Summarization Task": "Summarize the history and purpose of artificial intelligence in exactly two sentences.",
  "Creative Writing Poetry": "Write a short 4-line rhyming poem about the joy of debugging code."
};

export default function ComparePage() {
  const { simulateApi } = useSimulation();
  const [prompt, setPrompt] = useState(presets["Explain Technical Concept"]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCompare = async () => {
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    setErrorMsg('');
    setResults(null);

    try {
      const data = await postData('/api/compare', {
        prompt: prompt,
        simulate: simulateApi
      });
      setResults(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Comparison failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Compile charts data
  const chartData = results ? Object.entries(results).map(([key, val]: any) => ({
    name: key,
    latency: val.success ? val.response_time : 0,
    words: val.success ? val.word_count : 0
  })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-2xl backdrop-blur-md">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          ⚖️ Model Comparison
        </h1>
        <p className="text-xs text-slate-400">
          Compare outputs, speeds, and word counts between Gemini, GPT, and Claude concurrently.
        </p>
      </div>

      {/* Inputs Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Enter Prompt
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Preset:</span>
            <select
              onChange={(e) => setPrompt(presets[e.target.value])}
              className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              {Object.keys(presets).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          disabled={isLoading}
          className="w-full bg-slate-950 border border-slate-850 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
        />

        <button
          onClick={handleCompare}
          disabled={!prompt.trim() || isLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 border border-blue-500 hover:bg-blue-500 hover:border-blue-400 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-blue-500/10 transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              Comparing models...
            </>
          ) : (
            <>
              <Scale className="h-4.5 w-4.5" />
              Run Comparison
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-900/10 border border-rose-500/20 rounded-2xl p-4 text-sm text-rose-400">
          ❌ {errorMsg}
        </div>
      )}

      {/* Side-by-side Columns */}
      {results && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gemini Column */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col h-[28rem]">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                <div className="h-8 w-8 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center font-bold">
                  G
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Gemini 2.5 Flash</h3>
                  <span className="text-[9px] text-slate-500 font-semibold uppercase">Google</span>
                </div>
              </div>
              
              <div className="flex-1 bg-slate-950 border border-slate-850 rounded-2xl p-4 text-xs text-slate-200 overflow-y-auto whitespace-pre-wrap leading-relaxed min-h-0">
                {results.Gemini.success ? (
                  results.Gemini.text
                ) : (
                  <div className="text-rose-400 bg-rose-900/15 border border-rose-800/30 rounded-xl p-3.5">
                    ❌ API Error: {results.Gemini.text}
                  </div>
                )}
              </div>
              
              {results.Gemini.success && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-850">
                  <div className="bg-slate-950 p-2.5 rounded-xl flex items-center gap-2 text-[10px]">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <div>
                      <span className="text-slate-500 block font-bold uppercase">Time</span>
                      <span className="font-extrabold text-slate-355">{results.Gemini.response_time}s</span>
                    </div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl flex items-center gap-2 text-[10px]">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <div>
                      <span className="text-slate-500 block font-bold uppercase">Words</span>
                      <span className="font-extrabold text-slate-355">{results.Gemini.word_count}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* OpenAI Column */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col h-[28rem]">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                <div className="h-8 w-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center font-bold">
                  O
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">GPT-4o-mini</h3>
                  <span className="text-[9px] text-slate-500 font-semibold uppercase">OpenAI</span>
                </div>
              </div>
              
              <div className="flex-1 bg-slate-950 border border-slate-850 rounded-2xl p-4 text-xs text-slate-200 overflow-y-auto whitespace-pre-wrap leading-relaxed min-h-0">
                {results.OpenAI.success ? (
                  results.OpenAI.text
                ) : (
                  <div className="text-rose-400 bg-rose-900/15 border border-rose-800/30 rounded-xl p-3.5">
                    ❌ API Error: {results.OpenAI.text}
                  </div>
                )}
              </div>
              
              {results.OpenAI.success && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-850">
                  <div className="bg-slate-950 p-2.5 rounded-xl flex items-center gap-2 text-[10px]">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <div>
                      <span className="text-slate-500 block font-bold uppercase">Time</span>
                      <span className="font-extrabold text-slate-355">{results.OpenAI.response_time}s</span>
                    </div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl flex items-center gap-2 text-[10px]">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <div>
                      <span className="text-slate-500 block font-bold uppercase">Words</span>
                      <span className="font-extrabold text-slate-355">{results.OpenAI.word_count}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Claude Column */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col h-[28rem]">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                <div className="h-8 w-8 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg flex items-center justify-center font-bold">
                  C
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Claude 3.5 Sonnet</h3>
                  <span className="text-[9px] text-slate-500 font-semibold uppercase">Anthropic</span>
                </div>
              </div>
              
              <div className="flex-1 bg-slate-950 border border-slate-850 rounded-2xl p-4 text-xs text-slate-200 overflow-y-auto whitespace-pre-wrap leading-relaxed min-h-0">
                {results.Claude.success ? (
                  results.Claude.text
                ) : (
                  <div className="text-rose-455 bg-rose-900/10 border border-rose-500/20 rounded-xl p-3.5 text-rose-400">
                    {results.Claude.text.includes('credit') || results.Claude.text.includes('billing') ? (
                      <span>⚠️ Anthropic API key balance is exhausted. Fund credits or turn on **Simulation Mode** in sidebar.</span>
                    ) : (
                      <span>❌ API Error: {results.Claude.text}</span>
                    )}
                  </div>
                )}
              </div>
              
              {results.Claude.success && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-850">
                  <div className="bg-slate-950 p-2.5 rounded-xl flex items-center gap-2 text-[10px]">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <div>
                      <span className="text-slate-500 block font-bold uppercase">Time</span>
                      <span className="font-extrabold text-slate-355">{results.Claude.response_time}s</span>
                    </div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl flex items-center gap-2 text-[10px]">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <div>
                      <span className="text-slate-500 block font-bold uppercase">Words</span>
                      <span className="font-extrabold text-slate-355">{results.Claude.word_count}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Performance Comparison Charts */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-200">📊 Recharts Comparisons</h3>
              <p className="text-[10px] text-slate-500 mt-1">Metrics comparison for successful model responses.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
              {/* Latency Chart */}
              <div className="flex flex-col h-full">
                <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider mb-2">Response Speed (Lower is faster)</div>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', fontSize: '10px' }} />
                    <Bar dataKey="latency" name="Latency (sec)" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b'][index % 3]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Length Chart */}
              <div className="flex flex-col h-full">
                <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider mb-2">Generated Word Count</div>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', fontSize: '10px' }} />
                    <Bar dataKey="words" name="Words" fill="#10b981" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b'][index % 3]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
