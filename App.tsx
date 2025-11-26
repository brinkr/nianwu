import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Archive, 
  Sparkles, 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Search,
  Box,
  Heart,
  Wind,
  Loader2,
  Database,
  X,
  Share2,
  Feather,
  Circle,
  FileText,
  Stamp,
  CheckCircle2,
  List,
  Grid
} from 'lucide-react';
import { archiveObject } from './services/geminiService';
import { saveItem, getItems, deleteItem, getUserStats, seedDatabase } from './services/storageService';
import { ArchivedItem, AppView, GeminiResponse, UserStats, ArchiveMode } from './types';

// --- Artistic Components ---

const FloatingNavBar = ({ currentView, setView }: { currentView: AppView, setView: (v: AppView) => void }) => (
  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
    <div className="flex items-center space-x-8 bg-stone-900/95 backdrop-blur-xl px-10 py-5 rounded-full shadow-2xl border border-stone-800/50 ring-1 ring-white/5">
      <button 
        onClick={() => setView(AppView.HOME)}
        className={`transition-all duration-500 ease-out group ${currentView === AppView.HOME ? 'text-amber-100 scale-110' : 'text-stone-500 hover:text-stone-300'}`}
      >
        <div className="flex flex-col items-center space-y-1">
          <Feather size={22} strokeWidth={currentView === AppView.HOME ? 2 : 1.5} className="group-hover:animate-pulse" />
        </div>
      </button>
      
      <div className="w-px h-8 bg-stone-700/50"></div>

      <button 
        onClick={() => setView(AppView.SCAN)}
        className="bg-stone-100 text-stone-900 p-4 rounded-full hover:bg-white hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95 group"
      >
        <Plus size={28} strokeWidth={2} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

      <div className="w-px h-8 bg-stone-700/50"></div>

      <button 
        onClick={() => setView(AppView.GALLERY)}
        className={`transition-all duration-500 ease-out ${currentView === AppView.GALLERY ? 'text-amber-100 scale-110' : 'text-stone-500 hover:text-stone-300'}`}
      >
        <div className="flex flex-col items-center space-y-1">
           <Archive size={22} strokeWidth={currentView === AppView.GALLERY ? 2 : 1.5} />
        </div>
      </button>
    </div>
  </div>
);

// --- Home View (Zen Sanctuary) ---
const HomeView = ({ onStartDeclutter, onSeedData }: { onStartDeclutter: () => void, onSeedData: () => void }) => {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    setStats(getUserStats());
  }, []);

  if (!stats) return null;

  return (
    <div className="flex flex-col h-full bg-paper relative overflow-hidden transition-colors duration-1000">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-stone-200/40 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none animate-float"></div>
      
      <div className="flex-1 flex flex-col p-8 pt-16 relative z-10">
        <header className="mb-12 flex justify-between items-start animate-fade-in-up">
          <div>
            <h1 className="text-5xl font-serif text-ink mb-2 tracking-tight">念物</h1>
            <p className="text-stone-400 text-xs tracking-[0.3em] uppercase opacity-70">Digital Keep</p>
          </div>
          <div className="vertical-text text-stone-300 font-serif text-xs h-24 tracking-widest opacity-60">
             万物皆有灵 · 唯舍即是得
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center relative -mt-10">
          {/* Zen Circle Visualization */}
          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* The Breathing Orb */}
            <div 
               className="absolute inset-0 bg-gradient-to-tr from-stone-200 via-stone-100 to-white rounded-full opacity-60 animate-breathe blur-xl"
               style={{ transform: `scale(${1 + (stats.levelProgress / 200)})` }}
            ></div>
            
            <div className="relative z-10 text-center flex flex-col items-center">
              <span className="font-serif text-stone-500 text-sm mb-3 tracking-[0.2em] border-b border-stone-300 pb-1">修行境界</span>
              <h2 className="text-5xl font-serif text-ink mb-4 tracking-wider">{stats.levelTitle}</h2>
              <div className="flex items-center space-x-2 text-stone-400 text-xs tracking-widest mt-2">
                <span>已释放</span>
                <span className="text-stone-600 font-serif text-lg">{stats.totalReleased}</span>
                <span>件旧物</span>
              </div>
            </div>
            
            {/* Orbiting text */}
            <svg className="absolute inset-0 w-full h-full animate-[spin_60s_linear_infinite] opacity-10">
              <defs>
                <path id="circlePath" d="M 144, 144 m -120, 0 a 120,120 0 1,1 240,0 a 120,120 0 1,1 -240,0" />
              </defs>
              <text fontSize="9">
                <textPath href="#circlePath" className="font-serif tracking-[0.5em] fill-current text-stone-900">
                  放下过往 • 腾出空间 • 拥抱未来 • 
                </textPath>
              </text>
            </svg>
          </div>
        </div>

        <div className="pb-32 flex flex-col items-center space-y-8 animate-fade-in">
          <p className="font-serif text-stone-500 text-sm text-center leading-loose max-w-xs italic opacity-80">
            "我们告别的不是物品，<br/>而是依附在物品上的那个旧的自己。"
          </p>
          
          {/* Demo Controls - Made Visible */}
          <div className="flex flex-col items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
             <button 
               onClick={onSeedData}
               className="px-6 py-2 rounded-full border border-stone-300 text-stone-500 text-xs tracking-[0.2em] hover:bg-stone-200/50 hover:text-stone-700 transition-all font-serif"
             >
               注入演示数据
             </button>
             
             <button 
               onClick={() => { localStorage.clear(); window.location.reload(); }}
               className="text-[10px] text-stone-300 tracking-[0.2em] uppercase hover:text-red-400 transition-colors"
             >
               重置应用数据
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Scan View (Camera) ---
const ScanView = ({ onImageCaptured, onCancel }: { onImageCaptured: (file: File, note: string, mode: ArchiveMode) => void, onCancel: () => void }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [mode, setMode] = useState<ArchiveMode>('sentiment');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSelectFile = () => {
    // Reset value to allow selecting the same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  }

  return (
    <div className="flex flex-col h-full bg-stone-900 text-stone-50 relative">
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70">
          <ArrowLeft size={24} />
        </button>
        <span className="text-white/40 text-xs tracking-[0.3em] font-serif">拾 遗</span>
      </div>

      <div className="flex-1 flex flex-col">
        {preview ? (
          <div className="flex-1 relative bg-black flex flex-col animate-fade-in">
            <div className="flex-1 relative overflow-hidden">
               <img src={preview} alt="To archive" className="w-full h-full object-cover opacity-90" />
               <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent"></div>
               
               {/* Mode Indicator Overlay */}
               <div className="absolute top-6 right-6 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                 <span className="text-[10px] tracking-widest text-white/80">
                   {mode === 'sentiment' ? '仪式：羁绊' : '仪式：尘俗'}
                 </span>
               </div>
            </div>
            
            <div className="p-8 bg-stone-900 -mt-10 relative z-10 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
               <div className="mb-8">
                 <input
                   value={note}
                   onChange={(e) => setNote(e.target.value)}
                   placeholder={mode === 'sentiment' ? "这件物品承载了什么记忆..." : "备注物品瑕疵或处理原因..."}
                   className="w-full bg-transparent text-lg font-serif text-stone-200 placeholder-stone-600 focus:outline-none border-b border-stone-800 pb-3 transition-colors focus:border-stone-500"
                 />
               </div>
               
               <div className="flex space-x-4">
                 <button 
                   onClick={() => { setSelectedFile(null); setPreview(null); }}
                   className="flex-1 py-4 rounded-full border border-stone-700 text-stone-400 hover:text-white transition-colors text-xs tracking-widest"
                 >
                   重选
                 </button>
                 <button 
                   onClick={() => selectedFile && onImageCaptured(selectedFile, note, mode)}
                   className={`flex-[2] py-4 rounded-full font-bold text-xs tracking-widest transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl active:scale-95 ${
                     mode === 'sentiment' 
                       ? 'bg-amber-100 text-amber-900 hover:bg-white' 
                       : 'bg-stone-200 text-stone-900 hover:bg-white'
                   }`}
                 >
                   {mode === 'sentiment' ? <Sparkles size={14} /> : <Stamp size={14} />}
                   <span>{mode === 'sentiment' ? '开始通灵' : '确认归档'}</span>
                 </button>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            
            {/* Mode Switcher */}
            <div className="flex items-center space-x-12 relative">
               <button 
                 onClick={() => setMode('sentiment')}
                 className={`relative pb-2 transition-all duration-500 ${mode === 'sentiment' ? 'text-amber-100 opacity-100' : 'text-stone-500 opacity-50 hover:opacity-80'}`}
               >
                 <div className="flex flex-col items-center space-y-2">
                   <Heart size={24} strokeWidth={1} className={mode === 'sentiment' ? 'fill-amber-500/20' : ''} />
                   <span className="font-serif text-lg tracking-[0.2em]">羁绊</span>
                 </div>
                 {mode === 'sentiment' && <div className="absolute bottom-0 left-0 right-0 h-px bg-amber-100/50 shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>}
               </button>

               <div className="w-px h-12 bg-stone-800"></div>

               <button 
                 onClick={() => setMode('utility')}
                 className={`relative pb-2 transition-all duration-500 ${mode === 'utility' ? 'text-blue-100 opacity-100' : 'text-stone-500 opacity-50 hover:opacity-80'}`}
               >
                 <div className="flex flex-col items-center space-y-2">
                   <Box size={24} strokeWidth={1} className={mode === 'utility' ? 'fill-blue-500/20' : ''} />
                   <span className="font-serif text-lg tracking-[0.2em]">尘俗</span>
                 </div>
                 {mode === 'utility' && <div className="absolute bottom-0 left-0 right-0 h-px bg-blue-100/50 shadow-[0_0_10px_rgba(147,197,253,0.5)]"></div>}
               </button>
            </div>

            <p className="text-stone-500 text-xs font-serif tracking-widest h-4 transition-all duration-300">
              {mode === 'sentiment' ? '—— 唯美告别，释放情感 ——' : '—— 理性审阅，快速归档 ——'}
            </p>

            <div 
              onClick={handleSelectFile}
              className="w-full max-w-xs aspect-[3/4] border border-dashed border-stone-700 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-stone-800/30 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800/50 to-transparent"></div>
              
              <div className="relative z-10 flex flex-col items-center transform group-hover:scale-105 transition-transform duration-500">
                 <div className="w-20 h-20 rounded-full border border-stone-600 flex items-center justify-center mb-6 text-stone-500 group-hover:text-stone-300 group-hover:border-stone-400 transition-all duration-500">
                    <Camera size={28} strokeWidth={1} />
                 </div>
                 <p className="font-serif text-stone-400 tracking-widest text-lg">拍摄旧物</p>
                 <p className="text-stone-600 text-xs mt-3 tracking-wider">记录它的最后时刻</p>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              // Removed capture="environment" to fix Android/Simulator bug
              onChange={handleFileChange} 
              className="hidden" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

// --- Analyzing View (Ethereal Loading) ---
const AnalyzingView = () => (
  <div className="flex flex-col h-full items-center justify-center bg-stone-900 text-stone-200 relative overflow-hidden">
    <div className="absolute inset-0 bg-noise opacity-10"></div>
    
    <div className="relative z-10 text-center">
      <div className="mb-12 relative flex items-center justify-center">
         <div className="absolute w-32 h-32 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
         <Loader2 size={48} className="text-amber-100/80 animate-spin duration-[3000ms]" strokeWidth={1} />
      </div>
      
      <div className="space-y-4 animate-pulse">
        <h2 className="text-2xl font-serif text-stone-100 tracking-[0.2em] font-light">
          读取记忆中
        </h2>
        <div className="h-px w-12 bg-stone-700 mx-auto"></div>
        <p className="text-stone-500 text-xs tracking-widest font-serif italic">
          正在倾听它的告别...
        </p>
      </div>
    </div>
  </div>
);

// --- Ritual View (The Climax) ---
const RitualView = ({ 
  item, 
  onComplete, 
  onCancel 
}: { 
  item: GeminiResponse & { imageUri: string, mode: ArchiveMode }, 
  onComplete: () => void, 
  onCancel: () => void 
}) => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationFrame = useRef<number>(0);
  const isUtility = item.mode === 'utility';
  
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) audioCtxRef.current = new AudioContext();
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(console.error);
      }
    };
  }, []);

  const playSound = (isStart: boolean) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    if (isStart) {
      if (isUtility) {
        // Utility Sound: Mechanical hum/Paper rustle
        oscillatorRef.current = ctx.createOscillator();
        gainNodeRef.current = ctx.createGain();
        oscillatorRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(ctx.destination);
        oscillatorRef.current.type = 'sawtooth';
        oscillatorRef.current.frequency.setValueAtTime(50, ctx.currentTime);
        gainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime);
        gainNodeRef.current.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
        oscillatorRef.current.start();
      } else {
        // Sentiment Sound: Ethereal Sine
        oscillatorRef.current = ctx.createOscillator();
        gainNodeRef.current = ctx.createGain();
        oscillatorRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(ctx.destination);
        oscillatorRef.current.type = 'sine';
        oscillatorRef.current.frequency.setValueAtTime(100, ctx.currentTime);
        gainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime);
        gainNodeRef.current.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1);
        oscillatorRef.current.start();
      }
    } else {
      if (gainNodeRef.current) gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      setTimeout(() => oscillatorRef.current?.stop(), 200);
      
      // Completion Sound (Stamp thud or Wind chime)
      if (progress > 90) {
        const endOsc = ctx.createOscillator();
        const endGain = ctx.createGain();
        endOsc.connect(endGain);
        endGain.connect(ctx.destination);
        
        if (isUtility) {
           // Stamp THUD
           endOsc.type = 'square';
           endOsc.frequency.setValueAtTime(80, ctx.currentTime);
           endOsc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.1);
           endGain.gain.setValueAtTime(0.5, ctx.currentTime);
           endGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
           endOsc.start();
           endOsc.stop(ctx.currentTime + 0.2);
        } else {
           // Wind Chime
           endOsc.type = 'sine';
           endOsc.frequency.setValueAtTime(800, ctx.currentTime);
           endGain.gain.setValueAtTime(0.2, ctx.currentTime);
           endGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
           endOsc.start();
           endOsc.stop(ctx.currentTime + 1.5);
        }
      }
    }
  };

  const updatePitch = (percent: number) => {
    if (oscillatorRef.current && audioCtxRef.current) {
       if (isUtility) {
         // Pitch goes down for mechanical "pressure"
         oscillatorRef.current.frequency.setTargetAtTime(50 - (percent * 0.2), audioCtxRef.current.currentTime, 0.1);
       } else {
         // Pitch goes up for "ascension"
         oscillatorRef.current.frequency.setTargetAtTime(100 + (percent * 5), audioCtxRef.current.currentTime, 0.1);
       }
    }
  };

  const startHolding = () => {
    setHolding(true);
    playSound(true);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const stopHolding = () => {
    setHolding(false);
    // Don't reset progress if completed
    if (progress < 100) setProgress(0);
    playSound(false);
    if (navigator.vibrate) navigator.vibrate(0);
  };

  useEffect(() => {
    if (holding) {
      const startTime = Date.now();
      const duration = isUtility ? 1500 : 3000; // Utility is faster
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(100, (elapsed / duration) * 100);
        setProgress(newProgress);
        updatePitch(newProgress);

        if (navigator.vibrate && newProgress % 15 < 2) navigator.vibrate(20 + newProgress);

        if (newProgress < 100) {
          animationFrame.current = requestAnimationFrame(animate);
        } else {
          onComplete();
        }
      };
      animationFrame.current = requestAnimationFrame(animate);
    } else {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    }
    return () => { if (animationFrame.current) cancelAnimationFrame(animationFrame.current); };
  }, [holding, onComplete]);

  return (
    <div className={`flex flex-col h-full bg-stone-900 relative overflow-hidden items-center justify-center transition-colors duration-1000 ${isUtility ? 'bg-slate-900' : 'bg-stone-900'}`}>
      {/* Background Ambience */}
      <div className="absolute inset-0">
        <img src={item.imageUri} className="w-full h-full object-cover opacity-20 blur-2xl scale-110" alt="" />
        <div className={`absolute inset-0 mix-blend-multiply ${isUtility ? 'bg-slate-900/80' : 'bg-stone-900/60'}`}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-8 flex flex-col items-center">
        {/* The Card */}
        <div className={`
          w-full rounded-sm shadow-2xl overflow-hidden mb-12 transform transition-all duration-300 ease-out 
          ${isUtility ? 'bg-stone-100 p-6 font-mono text-xs' : 'bg-paper p-4 pb-12 font-serif'}
          ${holding && !isUtility ? 'scale-95 opacity-80 filter blur-[1px]' : ''}
          ${holding && isUtility ? 'scale-[0.98] translate-y-1' : ''}
        `}>
           <div className={`aspect-[4/3] w-full overflow-hidden bg-stone-200 mb-6 transition-all duration-1000 ${isUtility ? 'grayscale-[50%] contrast-110' : 'grayscale-[20%] hover:grayscale-0'}`}>
             <img src={item.imageUri} className="w-full h-full object-cover" alt="Item" />
           </div>
           
           <div className="text-center px-2">
             <div className={`text-[10px] tracking-[0.3em] uppercase mb-3 border-b pb-2 inline-block ${isUtility ? 'text-slate-500 border-slate-300' : 'text-amber-700/60 border-stone-200'}`}>
               {isUtility ? '处置回执' : '告别信'}
             </div>
             <h2 className={`text-2xl mb-6 text-ink ${isUtility ? 'font-bold tracking-tighter' : 'font-serif'}`}>{item.title}</h2>
             <p className={`leading-loose ${isUtility ? 'text-slate-600 text-left border-l-2 border-slate-300 pl-4' : 'text-stone-600 italic'}`}>
               "{item.farewellMessage}"
             </p>
           </div>
           
           {/* Stamp Animation for Utility */}
           {isUtility && progress === 100 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-red-700 text-red-700 rounded-lg p-2 font-black text-4xl rotate-[-15deg] opacity-80 animate-in zoom-in duration-300">
                已 处 理
              </div>
           )}
        </div>

        {/* The Trigger */}
        <div className="relative">
           <p className={`text-stone-400 text-[10px] tracking-[0.3em] text-center mb-6 transition-opacity duration-500 ${holding ? 'opacity-0' : 'opacity-100'}`}>
             {isUtility ? '长按 · 归档' : '长按 · 释怀'}
           </p>
           
           <button 
            className="group relative w-20 h-20 flex items-center justify-center outline-none touch-none"
            onMouseDown={startHolding}
            onMouseUp={stopHolding}
            onTouchStart={(e) => { e.preventDefault(); startHolding(); }}
            onTouchEnd={(e) => { e.preventDefault(); stopHolding(); }}
            onMouseLeave={stopHolding}
          >
             {/* Dynamic Rings */}
             <div className={`absolute inset-0 border rounded-full transition-all duration-1000 ${isUtility ? 'border-slate-500/30' : 'border-stone-500/30'} ${holding ? 'scale-150 opacity-0' : 'scale-100'}`}></div>
             <div className={`absolute inset-0 border rounded-full scale-75 transition-all duration-1000 delay-75 ${isUtility ? 'border-slate-400/50' : 'border-stone-400/50'} ${holding ? 'scale-125 opacity-0' : 'scale-75'}`}></div>
             
             {/* Center Core */}
             <div className={`w-3 h-3 rounded-full transition-all duration-300 
               ${isUtility ? 'bg-slate-200' : 'bg-stone-200'} 
               ${holding ? (isUtility ? 'scale-[6] bg-red-800 rounded-sm' : 'scale-[6] bg-amber-100 shadow-[0_0_40px_rgba(255,255,255,0.5)]') : 'scale-100'}
             `}></div>

             {/* Particles (Sentiment Only) */}
             {holding && !isUtility && (
               <div className="absolute inset-0 animate-spin-slow">
                 <div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full opacity-50 blur-[1px]"></div>
                 <div className="absolute bottom-0 right-1/2 w-1 h-1 bg-white rounded-full opacity-50 blur-[1px]"></div>
               </div>
             )}
          </button>
        </div>
        
        <button onClick={onCancel} className={`mt-8 text-stone-600 text-xs hover:text-stone-400 transition-colors ${holding ? 'opacity-0' : 'opacity-100'}`}>
          取消
        </button>
      </div>

      {/* Release Overlay */}
      {!isUtility && (
        <div 
          className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-100" 
          style={{ opacity: progress === 100 ? 1 : 0 }} 
        ></div>
      )}
    </div>
  );
};

// --- Gallery View Components ---

// Refined Utility Row - Ledger Style
const UtilityRow = ({ item, onClick }: { item: ArchivedItem, onClick: () => void }) => (
  <div onClick={onClick} className="flex items-center p-3 border-b border-stone-300/60 bg-[#f4f2ea] hover:bg-[#eae8df] transition-colors cursor-pointer group relative overflow-hidden">
    {/* Ledger decorative line */}
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-stone-300/50"></div>
    
    <div className="w-10 h-10 bg-stone-200 overflow-hidden rounded-sm flex-shrink-0 relative border border-stone-300 ml-2">
      <img src={item.imageUri} className="w-full h-full object-cover saturate-0 contrast-125 opacity-70" alt="" />
      <div className="absolute inset-0 bg-stone-500/10 mix-blend-multiply"></div>
    </div>
    
    <div className="ml-4 flex-1 min-w-0 font-mono text-stone-700">
      <div className="flex justify-between items-baseline mb-1">
         <h4 className="text-xs font-bold tracking-tight truncate mr-2 text-stone-800">{item.title}</h4>
         <span className="text-[9px] text-stone-400 shrink-0">{new Date(item.dateArchived).toLocaleDateString()}</span>
      </div>
      <div className="flex justify-between items-center">
         <p className="text-[10px] text-stone-500 truncate max-w-[70%] tracking-tight border-b border-dashed border-stone-300 pb-0.5">{item.farewellMessage}</p>
         <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded-sm border border-stone-300 bg-white/50">
           <span className="text-[8px] font-bold text-stone-600 uppercase tracking-wide">{item.sentiment}</span>
         </div>
      </div>
    </div>
  </div>
);

const SentimentCard = ({ item, onClick, index }: { item: ArchivedItem, onClick: () => void, index: number }) => (
  <div onClick={onClick} className={`mb-8 break-inside-avoid cursor-pointer group`}>
     <div className="relative overflow-hidden bg-white p-3 pb-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-sm">
        <div className="aspect-[3/4] overflow-hidden bg-stone-100 mb-4 relative">
          <img src={item.imageUri} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 saturate-[0.8] group-hover:saturate-100" alt="" />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5"></div>
        </div>
        <div className="px-1 text-center">
           <h3 className="font-serif text-lg text-ink mb-2 tracking-tight leading-relaxed">{item.title}</h3>
           <div className="flex items-center justify-center space-x-2 opacity-60">
             <div className="h-px w-3 bg-stone-300"></div>
             <p className="text-[10px] text-stone-500 tracking-[0.2em] font-serif">{item.sentiment}</p>
             <div className="h-px w-3 bg-stone-300"></div>
           </div>
        </div>
     </div>
  </div>
);

// --- Gallery View (Art Exhibition) ---
const GalleryView = ({ items, onItemClick }: { items: ArchivedItem[], onItemClick: (item: ArchivedItem) => void }) => {
  const [tab, setTab] = useState<'sentiment' | 'utility'>('sentiment');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const filteredItems = items.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sentiment.toLowerCase().includes(searchQuery.toLowerCase());
    
    // In utility tab, only show utility items. In sentiment tab, only show sentiment items.
    const matchesTab = item.mode === tab; 
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex flex-col h-full relative bg-paper transition-colors duration-500">
      {/* Header & Tabs */}
      <div className="pt-10 pb-4 px-6 backdrop-blur-xl sticky top-0 z-30 border-b border-stone-200/50 bg-paper/90">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif tracking-wide text-ink">念物馆</h2>
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className={`overflow-hidden transition-all duration-300 ${isSearchOpen ? 'h-12 opacity-100 mb-4' : 'h-0 opacity-0'}`}>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="寻觅..."
            className="w-full bg-transparent border-b border-stone-300 py-2 text-stone-600 font-serif focus:outline-none placeholder-stone-400"
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-lg relative bg-stone-200/50">
           <button 
             onClick={() => setTab('sentiment')}
             className={`flex-1 py-2 text-xs tracking-widest font-serif transition-all duration-300 rounded-md flex items-center justify-center space-x-2 ${tab === 'sentiment' ? 'bg-white shadow-sm text-amber-900' : 'text-stone-500 hover:text-stone-700'}`}
           >
             <Heart size={12} className={tab === 'sentiment' ? 'fill-amber-500/20' : ''} />
             <span>追忆画廊</span>
           </button>
           <button 
             onClick={() => setTab('utility')}
             className={`flex-1 py-2 text-xs tracking-widest font-bold font-mono transition-all duration-300 rounded-md flex items-center justify-center space-x-2 ${tab === 'utility' ? 'bg-[#f4f2ea] shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}
           >
             <Box size={12} className={tab === 'utility' ? 'text-stone-600' : ''} />
             <span>封存档案</span>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-40 space-y-4">
             {tab === 'sentiment' ? <Wind size={32} /> : <FileText size={32} />}
             <p className="font-serif text-xs tracking-widest">此处空无一物</p>
          </div>
        ) : (
           <>
             {tab === 'sentiment' ? (
               <div className="p-4 columns-2 gap-4 space-y-4">
                 {filteredItems.map((item, i) => (
                   <SentimentCard key={item.id} item={item} index={i} onClick={() => onItemClick(item)} />
                 ))}
               </div>
             ) : (
               <div className="border-t border-stone-300/50">
                 {/* Utility List: Ledger Style */}
                 <div className="bg-[repeating-linear-gradient(transparent,transparent_39px,#e5e2d6_40px)]">
                   {filteredItems.map((item) => (
                     <UtilityRow key={item.id} item={item} onClick={() => onItemClick(item)} />
                   ))}
                 </div>
               </div>
             )}
           </>
        )}
      </div>
    </div>
  );
};

// --- Detail View (Magazine Spread vs File Card) ---
const DetailView = ({ item, onBack, onDelete }: { item: ArchivedItem, onBack: () => void, onDelete: (id: string) => void }) => {
  if (!item) return null;
  const isUtility = item.mode === 'utility';

  return (
    <div className={`h-full overflow-y-auto animate-in fade-in duration-500 relative bg-paper`}>
      <button 
        onClick={onBack}
        className="fixed top-6 left-6 z-30 p-3 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors shadow-lg"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Hero Image */}
      <div className="relative h-[45vh] w-full">
        {/* Adjusted Image: No grayscale, just slight desaturation and dimming for text contrast */}
        <img 
          src={item.imageUri} 
          className={`w-full h-full object-cover transition-all duration-700 ${isUtility ? 'saturate-[0.5] contrast-110' : 'saturate-[0.85] brightness-90'}`} 
          alt={item.title} 
        />
        
        {/* Top Gradient for Navigation & Title Visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none"></div>
        
        {/* Bottom Fade Gradient (Smooth transition to content) */}
        <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-paper to-transparent`}></div>
        
        {/* Vertical Title Overlay */}
        <div className="absolute top-20 right-8 z-10 writing-mode-vertical vertical-text text-white/95 drop-shadow-lg">
           <h1 className={`text-3xl font-serif tracking-[0.2em] leading-loose ${isUtility ? 'font-mono font-bold text-white/90' : 'font-light'}`}>{item.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 px-6 pb-20 -mt-12">
        <div className={`backdrop-blur-sm p-6 rounded-t-sm shadow-sm ${isUtility ? 'bg-[#f4f2ea] border border-stone-300' : 'bg-paper/95 border-t border-white/50'}`}>
          
          {/* Metadata Row */}
          <div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4">
             <div className="flex flex-col">
               <span className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">{isUtility ? '状态' : '情感印记'}</span>
               <span className={`font-serif text-stone-600 ${isUtility ? 'font-bold font-mono text-stone-700' : ''}`}>
                 {isUtility && <CheckCircle2 size={12} className="inline mr-1 text-stone-600" />}
                 {item.sentiment}
               </span>
             </div>
             <div className="flex flex-col items-end">
               <span className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">{isUtility ? '封存日期' : '封存日期'}</span>
               <span className="font-serif text-stone-600">{new Date(item.dateArchived).toLocaleDateString()}</span>
             </div>
          </div>

          {/* Letter Section */}
          <div className="mb-10 relative">
            {!isUtility && <Feather className="absolute -top-6 -left-2 text-stone-200 w-12 h-12 -z-10 opacity-50" />}
            {isUtility && <FileText className="absolute -top-6 -left-2 text-stone-200 w-12 h-12 -z-10 opacity-50" />}
            
            <p className={`text-lg leading-loose text-ink text-justify ${isUtility ? 'font-mono text-sm' : 'font-serif indent-8'}`}>
              {item.description}
            </p>
          </div>

          {/* Farewell Quote */}
          <div className={`p-6 relative mb-12 ${isUtility ? 'bg-stone-200/30 border-2 border-dashed border-stone-300' : 'bg-stone-50 border-l-2 border-amber-800/20'}`}>
             <div className={`absolute -top-3 left-4 px-2 text-xs tracking-widest uppercase ${isUtility ? 'bg-[#f4f2ea] text-stone-500 font-bold' : 'bg-stone-50 text-amber-900/40 font-serif'}`}>
               {isUtility ? '处置回执' : '物品寄语'}
             </div>
             <p className={`text-stone-600 leading-loose ${isUtility ? 'font-mono text-xs' : 'font-serif italic'}`}>
               "{item.farewellMessage}"
             </p>
          </div>

          <div className="flex justify-center mt-8">
            <button 
              onClick={() => onDelete(item.id)}
              className="text-xs text-stone-300 hover:text-red-400 transition-colors tracking-widest uppercase border-b border-transparent hover:border-red-400 pb-1"
            >
              {isUtility ? '移除此记录' : '将此记忆抹去'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Controller ---

export default function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ArchivedItem | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<(GeminiResponse & { imageUri: string, userNote: string, mode: ArchiveMode }) | null>(null);

  useEffect(() => {
    setItems(getItems());
  }, [view]);

  const handleArchiveStart = async (file: File, note: string, mode: ArchiveMode) => {
    setView(AppView.ANALYZING);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const analysis: GeminiResponse = await archiveObject(base64, note, mode);
        // Ensure mode is passed through if Gemini doesn't return it implicitly (though we patch it in service)
        setPendingAnalysis({ ...analysis, imageUri: base64, userNote: note, mode: analysis.mode || mode });
        setView(AppView.RITUAL);
      };
    } catch (e) {
      console.error(e);
      setView(AppView.HOME);
    }
  };

  const handleRitualComplete = () => {
    if (pendingAnalysis) {
      const newItem: ArchivedItem = {
        id: Date.now().toString(),
        imageUri: pendingAnalysis.imageUri,
        title: pendingAnalysis.title,
        description: pendingAnalysis.description,
        farewellMessage: pendingAnalysis.farewellMessage,
        sentiment: pendingAnalysis.sentiment,
        category: pendingAnalysis.category,
        dateArchived: Date.now(),
        userNote: pendingAnalysis.userNote,
        mode: pendingAnalysis.mode
      };
      saveItem(newItem);
      setSelectedItem(newItem);
      setView(AppView.DETAIL);
      setPendingAnalysis(null);
    }
  };

  const handleDelete = (id: string) => {
    // Only prompt nicely
    if(confirm("确定要删除这条记录吗？")) {
      deleteItem(id);
      setView(AppView.GALLERY);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-paper font-sans text-stone-900 selection:bg-stone-200">
      {/* View Routing */}
      {view === AppView.HOME && <HomeView onStartDeclutter={() => setView(AppView.SCAN)} onSeedData={() => {seedDatabase(); setItems(getItems());}} />}
      {view === AppView.SCAN && <ScanView onImageCaptured={handleArchiveStart} onCancel={() => setView(AppView.HOME)} />}
      {view === AppView.ANALYZING && <AnalyzingView />}
      {view === AppView.RITUAL && pendingAnalysis && <RitualView item={pendingAnalysis} onComplete={handleRitualComplete} onCancel={() => setView(AppView.HOME)} />}
      {view === AppView.GALLERY && <GalleryView items={items} onItemClick={(item) => {setSelectedItem(item); setView(AppView.DETAIL);}} />}
      {view === AppView.DETAIL && selectedItem && <DetailView item={selectedItem} onBack={() => setView(AppView.GALLERY)} onDelete={handleDelete} />}
      
      {/* Floating Nav (Only on specific pages) */}
      {(view === AppView.HOME || view === AppView.GALLERY) && (
        <FloatingNavBar currentView={view} setView={setView} />
      )}
    </div>
  );
}