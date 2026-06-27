'use client';

import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { postData } from '../../utils/api';
import { 
  Rocket, 
  Clock, 
  FileText, 
  Type,
  Loader2,
  Terminal,
  Cpu
} from 'lucide-react';

const strategies = [
  { id: 'Normal', name: 'Normal', desc: 'Direct question without templates.' },
  { id: 'Zero Shot', name: 'Zero Shot', desc: 'Adds clear contextual instructions.' },
  { id: 'Few Shot', name: 'Few Shot', desc: 'Provides input-output examples before the question.' },
  { id: 'Chain of Thought', name: 'Chain of Thought', desc: 'Instructs the model to think step-by-step.' }
];

const presets: Record<string, string> = {
  "Explain Technical Concept": "Explain the concept of quantum computing in simple terms.",
  "Logical Puzzle": "If a tree falls in a forest and no one is around to hear it, does it make a sound?",
  "Translate Text": "Translate the sentence 'The quick brown fox jumps over the lazy dog' into French.",
  "Write Code": "Write a python function to find the nth Fibonacci number."
};

export default function PromptLabPage() {
  const { simulateApi } = useSimulation();
  const [question, setQuestion] = useState(presets["Explain Technical Concept"]);
  const [selectedStrategy, setSelectedStrategy] = useState('Normal');
  const [isLoading, setIsLoading] = useState(false);
  const [promptSent, setPromptSent] = useState('');
  const [response, setResponse] = useState('');
  const [metrics, setMetrics] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setResponse('');
    setPromptSent('');
    setMetrics(null);

    try {
      const data = await postData('/api/prompt-lab', {
        question: question,
        strategy: selectedStrategy,
        simulate: simulateApi
      });

      if (data && data.result) {
        setPromptSent(data.prompt_sent);
        if (data.result.success) {
          setResponse(data.result.text);
          setMetrics({
            response_time: data.result.response_time,
            word_count: data.result.word_count,
            character_count: data.result.character_count
          });
        } else {
          setResponse(`❌ API Error: ${data.result.text}`);
        }
      }
    } catch (err: any) {
      setResponse(`❌ Request Error: ${err.message || 'Something went wrong.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-2xl backdrop-blur-md">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          🧠 Prompt Engineering Lab
        </h1>
        <p className="text-xs text-slate-400">
          Experiment with different Prompt Engineering techniques and see how they modify prompt structures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              1. Select Strategy
            </h2>
            
            <div className="space-y-2">
              {strategies.map((strat) => {
                const isSelected = selectedStrategy === strat.id;
                return (
                  <button
                    key={strat.id}
                    onClick={() => setSelectedStrategy(strat.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500/40 text-blue-400 font-semibold'
                        : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm font-bold">{strat.name}</div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">
                      {strat.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Input Question / Presets Column */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleGenerate} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                2. Input Question
              </h2>
              
              {/* Presets Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Presets:</span>
                <select
                  onChange={(e) => setQuestion(presets[e.target.value])}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
                >
                  {Object.keys(presets).map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question here..."
              rows={4}
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors duration-200 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 border border-blue-500 hover:bg-blue-500 hover:border-blue-400 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-blue-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Generating Response...
                </>
              ) : (
                <>
                  <Rocket className="h-4.5 w-4.5" />
                  Generate Response
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Output Display Section */}
      {(promptSent || response || isLoading) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* Prompt Sent Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col h-full">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="h-4.5 w-4.5 text-slate-400" /> Constructed Prompt Sent
            </h3>
            <div className="flex-1 bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-auto whitespace-pre-wrap max-h-96">
              {isLoading && !promptSent ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  Constructing prompt structure...
                </div>
              ) : (
                promptSent
              )}
            </div>
          </div>

          {/* Response Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col h-full">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="h-4.5 w-4.5 text-blue-400" /> Model Response
            </h3>
            <div className="flex-1 bg-slate-950 border border-slate-850 rounded-xl p-4 text-sm text-slate-200 overflow-auto whitespace-pre-wrap max-h-96 min-h-[12rem]">
              {isLoading && !response ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  LLM is thinking...
                </div>
              ) : (
                response
              )}
            </div>

            {/* Metrics cards */}
            {metrics && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Latency</div>
                    <div className="text-sm font-extrabold text-slate-300">{metrics.response_time}s</div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Words</div>
                    <div className="text-sm font-extrabold text-slate-300">{metrics.word_count}</div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex items-center gap-2.5">
                  <Type className="h-4 w-4 text-emerald-500" />
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Chars</div>
                    <div className="text-sm font-extrabold text-slate-300">{metrics.character_count}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
