'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { postData } from '../../utils/api';
import { 
  Send, 
  Trash2, 
  Clock, 
  FileText, 
  Type,
  Bot,
  User,
  Loader2
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMetrics {
  response_time: number;
  word_count: number;
  character_count: number;
}

export default function ChatPage() {
  const { simulateApi } = useSimulation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastMetrics, setLastMetrics] = useState<ChatMetrics | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userPrompt = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userPrompt }]);
    setIsLoading(true);
    setLastMetrics(null);

    try {
      const data = await postData('/api/chat', {
        prompt: userPrompt,
        simulate: simulateApi
      });

      if (data && data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
        setLastMetrics({
          response_time: data.response_time,
          word_count: data.word_count,
          character_count: data.character_count
        });
      } else {
        const errorMsg = data?.text || 'Failed to generate response.';
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${errorMsg}` }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Request Error: ${err.message || 'Something went wrong.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setLastMetrics(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-slate-900/60 p-4 border border-slate-800 rounded-2xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            💬 Chat Playground
          </h1>
          <p className="text-xs text-slate-400">
            Interact with Large Language Models and review response performance.
          </p>
        </div>
        
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600/10 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-600/20 uppercase tracking-wider transition-all duration-200"
          >
            <Trash2 className="h-4.5 w-4.5" /> Clear History
          </button>
        )}
      </div>

      {/* Chat Display Container */}
      <div className="flex-1 overflow-y-auto bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-4 shadow-inner min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center space-y-4 p-8">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl text-slate-500 shadow-md">
              <Bot className="h-10 w-10 text-blue-500" />
            </div>
            <div className="max-w-md">
              <h3 className="text-slate-300 font-bold text-lg">Start a Conversation</h3>
              <p className="text-xs text-slate-500 mt-2">
                Type a prompt below to chat with the model. If you experience API quota errors, toggle **Simulation Mode** in the sidebar.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={index} 
                  className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Bot className="h-5 w-5 text-blue-400" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`max-w-[70%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                    isUser 
                      ? 'bg-blue-600 border border-blue-500 text-white shadow-lg shadow-blue-500/10 rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5 text-blue-400 animate-pulse" />
                </div>
                <div className="bg-slate-900/50 border border-slate-850 rounded-2xl rounded-tl-none px-6 py-4 flex items-center gap-3 text-sm text-slate-400 font-medium">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  Generating response...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Metrics Row (Only visible for the last successful request) */}
      {lastMetrics && (
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">Response Time</div>
              <div className="text-lg font-extrabold text-slate-200">{lastMetrics.response_time} sec</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">Word Count</div>
              <div className="text-lg font-extrabold text-slate-200">{lastMetrics.word_count} words</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg">
              <Type className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">Characters</div>
              <div className="text-lg font-extrabold text-slate-200">{lastMetrics.character_count} chars</div>
            </div>
          </div>
        </div>
      )}

      {/* Message Input Bar */}
      <form onSubmit={handleSend} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Generating response..." : "Ask Gemini a question..."}
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors duration-200 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-blue-600 border border-blue-500 hover:bg-blue-500 hover:border-blue-400 text-white rounded-2xl px-6 flex items-center justify-center shadow-lg shadow-blue-500/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
