'use client';

import React, { useState, useEffect } from 'react';
import { postData } from '../../utils/api';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Compass, 
  Flame,
  Search,
  Hash,
  Eye,
  Loader2,
  HelpCircle
} from 'lucide-react';

const presets: Record<string, string[]> = {
  "Semantic Similarity": [
    "I love AI",
    "I enjoy Machine Learning",
    "Banana is yellow",
    "A mango is a delicious sweet fruit",
    "Deep learning is a subset of artificial intelligence"
  ],
  "Word Disambiguation": [
    "The bank of the river was covered in moss.",
    "He went to the river bank to fish.",
    "I need to deposit money at the bank.",
    "The financial bank announced a new interest rate.",
    "The robbery occurred at a local banking institution."
  ],
  "Tech vs Food": [
    "Apple released a new iPhone model today.",
    "Microsoft is investing heavily in cloud computing.",
    "I bought a fresh, juicy apple from the market.",
    "Baking an apple pie requires sweet apples and cinnamon.",
    "Google plans to update its search engine algorithms."
  ]
};

const clusterColors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // orange
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4'  // cyan
];

export default function EmbeddingsPage() {
  const [inputText, setInputText] = useState(presets["Semantic Similarity"].join('\n'));
  const [modelName, setModelName] = useState('sentence-transformers/all-MiniLM-L6-v2');
  const [dimAlgo, setDimAlgo] = useState('PCA');
  const [enableCluster, setEnableCluster] = useState(true);
  const [nClusters, setNClusters] = useState(3);
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Tabs State
  const [activeTab, setActiveTab] = useState('heatmap');
  
  // Semantic Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Vector Inspector State
  const [selectedVecIdx, setSelectedVecIdx] = useState(0);

  const handleCalculate = async () => {
    const sentences = inputText.split('\n').map(s => s.trim()).filter(s => s);
    if (sentences.length < 2) {
      setErrorMsg('Please enter at least 2 sentences.');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    setResults(null);
    setSearchResults([]);
    setSearchQuery('');
    setSelectedVecIdx(0);

    try {
      const data = await postData('/api/embeddings', {
        sentences: sentences,
        model_name: modelName,
        dim_algo: dimAlgo,
        enable_cluster: enableCluster,
        n_clusters: nClusters
      });
      setResults(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to compute embeddings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleCalculate();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !results || searchLoading) return;

    setSearchLoading(true);
    try {
      const searchData = await postData('/api/semantic-search', {
        query: searchQuery,
        sentences: results.sentences,
        model_name: modelName
      });
      setSearchResults(searchData);
    } catch (err: any) {
      alert(`Search failed: ${err.message}`);
    } finally {
      setSearchLoading(false);
    }
  };

  // Build scatter chart data formatting for Recharts
  const scatterData = results ? results.points.map((pt: any) => ({
    x: pt.x,
    y: pt.y,
    sentence: pt.sentence,
    cluster: pt.cluster,
    truncated: pt.sentence.length > 25 ? pt.sentence.substring(0, 25) + '...' : pt.sentence
  })) : [];

  // Helper for heatmap cell coloring
  const getHeatmapColor = (val: number) => {
    // Value is similarity between -1 and 1. We scale colors between slate-950 and blue-500.
    // Clamped value between 0 and 1
    const clamped = Math.max(0, Math.min(1, val));
    return `rgba(59, 130, 246, ${clamped})`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-2xl backdrop-blur-md">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          📊 Embedding Explorer
        </h1>
        <p className="text-xs text-slate-400">
          Transform sentences into vector coordinates, compute similarity matrices, and project points in 2D space.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Settings Panel */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 h-fit">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Configuration
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Model Selection</label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="sentence-transformers/all-MiniLM-L6-v2">all-MiniLM-L6-v2 (384 dims)</option>
                <option value="sentence-transformers/all-mpnet-base-v2">all-mpnet-base-v2 (768 dims)</option>
                <option value="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2">paraphrase-multilingual (384 dims)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">2D Reduction Method</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="dimAlgo"
                    value="PCA"
                    checked={dimAlgo === 'PCA'}
                    onChange={() => setDimAlgo('PCA')}
                    className="text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-800"
                  />
                  PCA (Linear)
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="dimAlgo"
                    value="t-SNE"
                    checked={dimAlgo === 't-SNE'}
                    onChange={() => setDimAlgo('t-SNE')}
                    className="text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-800"
                  />
                  t-SNE (Local)
                </label>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-bold">Semantic Clustering</span>
                <input
                  type="checkbox"
                  checked={enableCluster}
                  onChange={(e) => setEnableCluster(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-800 h-4 w-4"
                />
              </div>
              
              {enableCluster && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>CLUSTERS (K)</span>
                    <span className="text-blue-400 font-extrabold">{nClusters}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    value={nClusters}
                    onChange={(e) => setNClusters(Number(e.target.value))}
                    className="w-full bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Sentences Panel */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Input Sentences (One per line)
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Preset:</span>
              <select
                onChange={(e) => setInputText(presets[e.target.value].join('\n'))}
                className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                {Object.keys(presets).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            disabled={isLoading}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors duration-200 disabled:opacity-50 font-sans"
          />

          <button
            onClick={handleCalculate}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 border border-blue-500 hover:bg-blue-500 hover:border-blue-400 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-blue-500/10 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Generating Embeddings...
              </>
            ) : (
              <>
                <Compass className="h-4.5 w-4.5" />
                Generate Embeddings & Compare
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

      {/* Results Workspace */}
      {results && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          
          {/* Tab Selector */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`pb-4 px-6 text-sm font-bold border-b-2 uppercase tracking-wider transition-all duration-200 ${activeTab === 'heatmap' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              🔥 Similarity Heatmap
            </button>
            <button
              onClick={() => setActiveTab('projection')}
              className={`pb-4 px-6 text-sm font-bold border-b-2 uppercase tracking-wider transition-all duration-200 ${activeTab === 'projection' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              🗺️ 2D Projection Space
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`pb-4 px-6 text-sm font-bold border-b-2 uppercase tracking-wider transition-all duration-200 ${activeTab === 'search' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              🔍 Semantic Search
            </button>
            <button
              onClick={() => setActiveTab('inspector')}
              className={`pb-4 px-6 text-sm font-bold border-b-2 uppercase tracking-wider transition-all duration-200 ${activeTab === 'inspector' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              🔢 Raw Vector Inspector
            </button>
          </div>

          {/* TAB CONTENT */}

          {/* TAB 1: HEATMAP */}
          {activeTab === 'heatmap' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-200">Pairwise Cosine Similarity Heatmap</h3>
                <p className="text-[10px] text-slate-500 mt-1">Brighter grid cells represent higher semantic similarity. Move mouse over cells to see names.</p>
              </div>

              <div className="overflow-auto border border-slate-850 rounded-2xl bg-slate-950 p-4">
                <div 
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `minmax(120px, 1fr) repeat(${results.sentences.length}, minmax(45px, 60px))` }}
                >
                  {/* Empty Corner */}
                  <div />
                  {/* Top Axis Labels */}
                  {results.sentences.map((s: string, idx: number) => (
                    <div 
                      key={idx} 
                      title={s} 
                      className="text-[9px] font-bold text-slate-500 text-center truncate py-1 border-b border-slate-800"
                    >
                      {idx}
                    </div>
                  ))}

                  {/* Matrix Rows */}
                  {results.sentences.map((sentenceY: string, idxY: number) => (
                    <React.Fragment key={idxY}>
                      {/* Left Axis Label */}
                      <div 
                        title={sentenceY} 
                        className="text-[10px] font-bold text-slate-400 truncate pr-2 flex items-center"
                      >
                        [{idxY}] {sentenceY}
                      </div>
                      
                      {/* Cells */}
                      {results.similarity_matrix[idxY].map((score: number, idxX: number) => {
                        const cellColor = getHeatmapColor(score);
                        return (
                          <div
                            key={idxX}
                            style={{ backgroundColor: cellColor }}
                            title={`[${idxY}] → [${idxX}]\nScore: ${score.toFixed(4)}\n\nA: "${sentenceY}"\nB: "${results.sentences[idxX]}"`}
                            className="aspect-square flex items-center justify-center rounded border border-slate-900 text-[10px] font-mono font-bold text-white transition-all hover:scale-110 cursor-help"
                          >
                            {score.toFixed(2)}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECTION */}
          {activeTab === 'projection' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-200">2D Projection of Vector Space ({dimAlgo})</h3>
                <p className="text-[10px] text-slate-500 mt-1">High-dimensional embeddings are reduced to 2D coordinates. Hover over markers to see full text. Clusters are K-Means grouped.</p>
              </div>

              <div className="h-96 bg-slate-950 border border-slate-850 rounded-2xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" dataKey="x" name="X" stroke="#64748b" fontSize={10} domain={['auto', 'auto']} />
                    <YAxis type="number" dataKey="y" name="Y" stroke="#64748b" fontSize={10} domain={['auto', 'auto']} />
                    <ZAxis type="category" dataKey="sentence" name="Sentence" />
                    <RechartsTooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-xl max-w-sm">
                              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">Cluster {data.cluster}</p>
                              <p className="text-xs text-slate-200 mt-1.5 leading-normal">"{data.sentence}"</p>
                              <p className="text-[9px] text-slate-500 mt-2">X: {data.x.toFixed(4)} | Y: {data.y.toFixed(4)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Sentences" data={scatterData} fill="#3b82f6">
                      {scatterData.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={clusterColors[entry.cluster % clusterColors.length]} 
                          className="hover:scale-125 transition-transform duration-200 cursor-pointer"
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 3: SEMANTIC SEARCH */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-200">Semantic Search Sandbox</h3>
                <p className="text-[10px] text-slate-500 mt-1">Queries are converted into vectors, and cosine similarities are calculated against the input document collection.</p>
              </div>

              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter a search term (e.g. 'fruit', 'technology', 'bank')..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!searchQuery.trim() || searchLoading}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 flex items-center justify-center font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shrink-0"
                >
                  {searchLoading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    'Search'
                  )}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Query Search Results:</h4>
                  
                  <div className="space-y-4 divide-y divide-slate-900">
                    {searchResults.map((res: any, idx: number) => (
                      <div key={idx} className={`pt-4 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                        <div className="text-sm text-slate-200">
                          <span className="text-xs text-slate-500 font-bold font-mono mr-2">#{idx+1}</span>
                          "{res.sentence}"
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-24 bg-slate-800 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${Math.max(0, Math.min(100, res.score * 100))}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold font-mono text-blue-400">{(res.score).toFixed(4)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INSPECTOR */}
          {activeTab === 'inspector' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Selector Column */}
              <div className="md:col-span-1 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-200">Vector Inspector</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Review the raw dense numbers and statistics representing each sentence.</p>
                </div>

                <div className="space-y-2">
                  {results.sentences.map((s: string, idx: number) => {
                    const isSelected = selectedVecIdx === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedVecIdx(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs truncate transition-all ${
                          isSelected
                            ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 font-bold'
                            : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                        }`}
                      >
                        [{idx}] {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Statistics Column */}
              <div className="md:col-span-2 space-y-4">
                {/* Stats cards */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex items-center gap-3">
                    <Hash className="h-5 w-5 text-blue-400" />
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Dimensions</div>
                      <div className="text-base font-extrabold text-slate-350">{results.points[selectedVecIdx].vector_stats.dimensions}</div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex items-center gap-3">
                    <Flame className="h-5 w-5 text-amber-500" />
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Mean</div>
                      <div className="text-base font-extrabold text-slate-350">{results.points[selectedVecIdx].vector_stats.mean.toFixed(4)}</div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex items-center gap-3">
                    <Eye className="h-5 w-5 text-emerald-500" />
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Min</div>
                      <div className="text-base font-extrabold text-slate-350">{results.points[selectedVecIdx].vector_stats.min.toFixed(4)}</div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex items-center gap-3">
                    <Eye className="h-5 w-5 text-rose-500" />
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Max</div>
                      <div className="text-base font-extrabold text-slate-350">{results.points[selectedVecIdx].vector_stats.max.toFixed(4)}</div>
                    </div>
                  </div>
                </div>

                {/* Vector block */}
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Sample Vector Array (First 40 dimensions):</h4>
                  <pre className="bg-slate-900 border border-slate-850 rounded-xl p-4 font-mono text-[10px] text-blue-400 overflow-x-auto whitespace-pre-wrap">
                    {`[\n  ${results.points[selectedVecIdx].vector_preview.map((v: number) => v.toFixed(5)).join(', ')}, ...\n]`}
                  </pre>
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
