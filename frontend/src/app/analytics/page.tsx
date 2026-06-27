'use client';

import React, { useState, useEffect } from 'react';
import { getData, postData } from '../../utils/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  BarChart3, 
  Clock, 
  FileText, 
  Activity, 
  Trash2, 
  Database,
  Loader2
} from 'lucide-react';

const modelColors: Record<string, string> = {
  "Gemini 2.5 Flash": "#3b82f6",
  "GPT-4o-mini": "#10b981",
  "Claude 3.5 Sonnet": "#f59e0b"
};

const strategyColors = [
  '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#3b82f6', '#10b981', '#f59e0b'
];

export default function AnalyticsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getData('/api/analytics');
      setHistory(data || []);
    } catch (err: any) {
      console.error('Failed to load history:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePrefill = async () => {
    setIsLoading(true);
    try {
      await postData('/api/analytics/prefill', {});
      await fetchHistory();
    } catch (err: any) {
      alert(`Failed to prefill data: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to clear all telemetry logs?')) return;
    setIsLoading(true);
    try {
      await postData('/api/analytics/reset', {});
      setHistory([]);
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculations
  const totalRuns = history.length;
  const successfulRuns = history.filter(h => h.success);
  const successCount = successfulRuns.length;
  const successRate = totalRuns > 0 ? (successCount / totalRuns) * 100 : 0.0;
  
  const avgLatency = successfulRuns.length > 0 
    ? successfulRuns.reduce((acc, curr) => acc + curr.response_time, 0) / successfulRuns.length 
    : 0.0;
    
  const totalWords = successfulRuns.reduce((acc, curr) => acc + curr.word_count, 0);

  // Compile Chart 1: Request counts by model
  const modelCounts = history.reduce((acc: Record<string, number>, curr) => {
    acc[curr.model] = (acc[curr.model] || 0) + 1;
    return acc;
  }, {});
  
  const volumeChartData = Object.entries(modelCounts).map(([key, val]) => ({
    name: key,
    count: val
  }));

  // Compile Chart 2: Average latency by model
  const modelLatencyMap = successfulRuns.reduce((acc: Record<string, { total: number, count: number }>, curr) => {
    if (!acc[curr.model]) {
      acc[curr.model] = { total: 0, count: 0 };
    }
    acc[curr.model].total += curr.response_time;
    acc[curr.model].count += 1;
    return acc;
  }, {});
  
  const latencyChartData = Object.entries(modelLatencyMap).map(([key, val]) => ({
    name: key,
    latency: Number((val.total / val.count).toFixed(2))
  }));

  // Compile Chart 3: Strategy distribution
  const strategyCounts = history.reduce((acc: Record<string, number>, curr) => {
    acc[curr.strategy] = (acc[curr.strategy] || 0) + 1;
    return acc;
  }, {});
  
  const strategyChartData = Object.entries(strategyCounts).map(([key, val]) => ({
    name: key,
    value: val
  }));

  if (isLoading) {
    return (
      <div className="h-[50vh] flex flex-col justify-center items-center gap-3">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="text-sm text-slate-400 font-semibold">Loading analytics telemetry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/60 p-4 border border-slate-800 rounded-2xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            📈 Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Monitor API request metrics, latency speeds, success statistics, and strategy logs.
          </p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600/10 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-600/20 uppercase tracking-wider transition-all duration-200"
          >
            <Trash2 className="h-4.5 w-4.5" /> Reset Logs
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 max-w-xl mx-auto mt-12">
          <div className="mx-auto w-12 h-12 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
            <Database className="h-6 w-6 text-blue-500" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-200">No Telemetry Logs Found</h3>
            <p className="text-xs text-slate-450 leading-relaxed text-slate-400">
              Run prompts in the Chat Playground, Prompt Lab, or Model Comparison to gather real stats. Or click the button below to pre-populate the dashboard with simulated data.
            </p>
          </div>

          <button
            onClick={handlePrefill}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-blue-500/15"
          >
            ⚡ Prefill Sample History Log
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Total Requests */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-slate-700 transition-colors">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Requests</span>
                <span className="text-xl font-black text-slate-250">{totalRuns}</span>
              </div>
            </div>

            {/* Avg Latency */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-slate-700 transition-colors">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Avg Latency</span>
                <span className="text-xl font-black text-slate-250">{avgLatency.toFixed(2)}s</span>
              </div>
            </div>

            {/* Total Words */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-slate-700 transition-colors">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Words Generated</span>
                <span className="text-xl font-black text-slate-250">{totalWords.toLocaleString()}</span>
              </div>
            </div>

            {/* Success Rate */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-slate-700 transition-colors">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Success Rate</span>
                <span className="text-xl font-black text-slate-250">{successRate.toFixed(1)}%</span>
              </div>
            </div>

          </div>

          {/* Visual Analysis Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: Volume by Model */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col h-72">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Request Counts by Model</h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                    <YAxis stroke="#64748b" fontSize={9} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', fontSize: '10px' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {volumeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={modelColors[entry.name] || '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Latency by Model */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col h-72">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Avg Latency (s) (Lower is faster)</h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={latencyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                    <YAxis stroke="#64748b" fontSize={9} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', fontSize: '10px' }} />
                    <Bar dataKey="latency" fill="#10b981" radius={[4, 4, 0, 0]}>
                      {latencyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={modelColors[entry.name] || '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Strategy Distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col h-72">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Prompt Strategy Distribution</h3>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={strategyChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                      fontSize={8}
                    >
                      {strategyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={strategyColors[index % strategyColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Telemetry Spreadsheet */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Raw Telemetry Log File</h3>
            
            <div className="overflow-x-auto border border-slate-850 rounded-2xl max-h-80">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider sticky top-0 bg-slate-900 z-10">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Model Name</th>
                    <th className="py-3 px-4">Strategy Context</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Latency (s)</th>
                    <th className="py-3 px-4 text-center">Words</th>
                    <th className="py-3 px-4 text-center">Chars</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-350">
                  {history.map((run, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/40">
                      <td className="py-3 px-4 font-mono text-slate-500">{run.timestamp}</td>
                      <td className="py-3 px-4 font-bold">{run.model}</td>
                      <td className="py-3 px-4 text-slate-400">{run.strategy}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          run.success 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                        }`}>
                          {run.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{run.response_time.toFixed(2)}s</td>
                      <td className="py-3 px-4 text-center font-mono">{run.word_count}</td>
                      <td className="py-3 px-4 text-center font-mono">{run.character_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
