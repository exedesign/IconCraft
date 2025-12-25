
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Wand2, 
  Download, 
  Trash2, 
  Image as ImageIcon, 
  Check, 
  Loader2, 
  ShieldAlert, 
  Zap,
  Layers,
  Sparkles,
  History,
  X,
  Smartphone,
  Info
} from 'lucide-react';
import { geminiService } from './services/gemini';
import { GeneratedIcon, IconStyle, GenerationState } from './types';
import { removeBackground, downloadImage } from './utils/imageProcessing';

const STYLES: IconStyle[] = [
  { 
    id: 'modern-flat', 
    name: 'Premium Flat', 
    promptSuffix: 'flat vector symbol, geometric abstraction, clean sharp lines, vibrant colors, white background' 
  },
  { 
    id: '3d-glass', 
    name: 'Glassmorphism', 
    promptSuffix: 'translucent glass sculpture, realistic refraction, frosted textures, vivid gradient interior, luxury UI asset' 
  },
  { 
    id: 'clay', 
    name: 'Soft Clay', 
    promptSuffix: 'claymorphism style, soft rounded edges, matte finish, playful 3d form, vibrant pastel colors' 
  },
  { 
    id: 'cyber-neon', 
    name: 'Cyber Neon', 
    promptSuffix: 'glowing futuristic emblem, vibrant neon light lines, tech aesthetic, dark-mode ready, sharp details' 
  },
  { 
    id: 'minimal-outline', 
    name: 'Minimal Stroke', 
    promptSuffix: 'minimalist outline logo, thick consistent strokes, balanced negative space, professional monochrome' 
  }
];

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState(STYLES[0].id);
  const [history, setHistory] = useState<GeneratedIcon[]>([]);
  const [currentIcon, setCurrentIcon] = useState<GeneratedIcon | null>(null);
  const [genState, setGenState] = useState<GenerationState>(GenerationState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('icon_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history when it changes
  useEffect(() => {
    localStorage.setItem('icon_history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenState(GenerationState.GENERATING);
    setErrorMsg(null);

    const selectedStyle = STYLES.find(s => s.id === selectedStyleId) || STYLES[0];
    
    try {
      const imageUrl = await geminiService.generateIcon(prompt, selectedStyle.promptSuffix);
      
      const newIcon: GeneratedIcon = {
        id: crypto.randomUUID(),
        url: imageUrl,
        prompt: prompt,
        style: selectedStyle.name,
        timestamp: Date.now()
      };

      setCurrentIcon(newIcon);
      setHistory(prev => [newIcon, ...prev].slice(0, 20)); // Keep last 20
      setGenState(GenerationState.IDLE);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate icon. Please try again.");
      setGenState(GenerationState.ERROR);
    }
  };

  const handleRemoveBackground = async () => {
    if (!currentIcon) return;
    setIsProcessing(true);
    try {
      const transparentUrl = await removeBackground(currentIcon.url);
      const updatedIcon = { ...currentIcon, url: transparentUrl };
      setCurrentIcon(updatedIcon);
      setHistory(prev => prev.map(icon => icon.id === updatedIcon.id ? updatedIcon : icon));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearHistory = () => {
    if (confirm("Clear all history?")) {
      setHistory([]);
      setCurrentIcon(null);
    }
  };

  const deleteIcon = (id: string) => {
    setHistory(prev => prev.filter(i => i.id !== id));
    if (currentIcon?.id === id) {
      setCurrentIcon(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Control Panel (Sidebar) */}
      <aside className="w-full md:w-96 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-8 h-full md:h-screen overflow-y-auto z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="text-white fill-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight italic">ICONCRAFT <span className="text-indigo-500">PRO</span></h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Next-Gen Graphic Engine</p>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Design Concept
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A robotic hummingbird with liquid gold wings..."
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-700 resize-none"
            />
            <div className="mt-2 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex gap-2">
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-tight">
                To prevent text generation, focus on objects/shapes. Avoid words like "logo" or "label" in your prompt.
              </p>
            </div>
          </section>

          <section>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block">Visual Aesthetic</label>
            <div className="grid grid-cols-1 gap-2">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyleId(style.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    selectedStyleId === style.id 
                    ? 'border-indigo-600 bg-indigo-600/10 text-white font-semibold' 
                    : 'border-slate-800 bg-slate-950/50 text-slate-500 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${selectedStyleId === style.id ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-slate-700'}`} />
                    {style.name}
                  </span>
                  {selectedStyleId === style.id && <Check className="w-4 h-4 text-indigo-500" />}
                </button>
              ))}
            </div>
          </section>

          <button
            onClick={handleGenerate}
            disabled={genState === GenerationState.GENERATING || !prompt.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-indigo-900/20 transition-all active:scale-95 group"
          >
            {genState === GenerationState.GENERATING ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            )}
            {genState === GenerationState.GENERATING ? 'Forging Piksels...' : 'Generate Icon'}
          </button>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-200">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-auto pt-6 border-t border-slate-800">
           <div className="flex items-center gap-2 text-indigo-400/50 mb-2">
            <ShieldAlert className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Zero Text Protocol Active</span>
          </div>
          <p className="text-[10px] text-slate-600">Powered by Gemini & IconCraft Engine</p>
        </div>
      </aside>

      {/* Workspace */}
      <main className="flex-1 bg-slate-950 relative flex flex-col h-full md:h-screen overflow-hidden">
        {/* Workspace Backdrop Decor */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 blur-[150px] rounded-full animate-pulse delay-1000"></div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 overflow-y-auto">
          {currentIcon ? (
            <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-500">
              <div className="relative group mx-auto">
                <div className="absolute -inset-8 bg-indigo-600/15 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full"></div>
                <div className="relative aspect-square w-full max-w-[480px] mx-auto bg-slate-900 rounded-[64px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border border-slate-800 p-12 md:p-16 flex items-center justify-center overflow-hidden ring-1 ring-white/10 group">
                  {/* Checkerboard Backdrop for Transparency testing */}
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] invert"></div>
                  
                  {isProcessing && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-20 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Removing Background...</span>
                      </div>
                    </div>
                  )}

                  <img 
                    src={currentIcon.url} 
                    alt="Generated Asset" 
                    className="relative w-full h-full object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.4)] transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>

              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                <button 
                  onClick={handleRemoveBackground}
                  disabled={isProcessing}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl border border-slate-700"
                >
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Make Transparent
                </button>
                <button 
                  onClick={() => downloadImage(currentIcon.url, `iconcraft-${currentIcon.id}.png`)}
                  className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-900/40"
                >
                  <Download className="w-4 h-4" />
                  Export PNG
                </button>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-4 text-slate-500">
                <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-widest">1024x1024</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
                   <span className="text-[10px] font-bold uppercase tracking-widest">{currentIcon.style}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="w-24 h-24 bg-slate-900 rounded-[32px] border border-slate-800 flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
                <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full"></div>
                <ImageIcon className="w-10 h-10 text-slate-700 relative" />
              </div>
              <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">CRAFT YOUR VISION</h2>
              <p className="max-w-md mx-auto text-slate-500 font-medium leading-relaxed">
                Enter a concept in the sidebar to generate professional, high-fidelity icons designed for modern user interfaces.
              </p>
            </div>
          )}
        </div>

        {/* History Bar (Horizontal Desktop / Mobile Friendly) */}
        {history.length > 0 && (
          <div className="bg-slate-900/50 backdrop-blur-md border-t border-slate-800 p-6 z-20">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Library</h3>
              </div>
              <button onClick={clearHistory} className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors">
                Clear All
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-2">
              {history.map((icon) => (
                <div key={icon.id} className="relative group shrink-0">
                  <button
                    onClick={() => setCurrentIcon(icon)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${
                      currentIcon?.id === icon.id 
                      ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20 z-10' 
                      : 'border-slate-800 hover:border-slate-600 grayscale hover:grayscale-0'
                    }`}
                  >
                    <img src={icon.url} alt="History Item" className="w-full h-full object-cover" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteIcon(icon.id); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Global Processing State */}
      {genState === GenerationState.GENERATING && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="relative mb-12">
            <div className="w-40 h-40 border-4 border-indigo-500/10 rounded-full animate-ping absolute -inset-0"></div>
            <div className="w-40 h-40 border-2 border-indigo-500/20 rounded-full animate-pulse absolute -inset-0"></div>
            <div className="w-40 h-40 flex items-center justify-center">
              <Zap className="w-16 h-16 text-indigo-500 animate-bounce" />
            </div>
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-black text-white italic tracking-widest uppercase">Piksel Forge Active</h3>
            <div className="flex items-center justify-center gap-3">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse max-w-xs mx-auto">
              Scanning prompt for text anomalies... Generating high-end vector geometry...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
