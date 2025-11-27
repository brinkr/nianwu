import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  ArrowLeft, 
  Plus, 
  Search,
  Box,
  Heart,
  Wind,
  Loader2,
  FileText,
  Stamp,
  CheckCircle2,
  Settings,
  Download,
  Upload,
  RefreshCcw,
  Sparkles,
  Feather,
  User,
  Play,
  X
} from 'lucide-react';
import { archiveObject } from './services/geminiService';
import { saveItem, getItems, deleteItem, getUserStats, seedDatabase, getNickname, setNickname } from './services/storageService';
import { ArchivedItem, AppView, GeminiResponse, UserStats, ArchiveMode } from './types';
import ZenBackground from './components/ZenBackground';

// --- Components ---

// Inkstone Button (Action)
const InkstoneButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="group relative w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-500 hover:scale-105 active:scale-95 outline-none cursor-pointer"
    aria-label="Start Ritual"
  >
    <div className="absolute inset-0 rounded-full bg-stone-900/40 blur-xl translate-y-4 scale-90 group-hover:scale-100 transition-all duration-700"></div>
    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-stone-800 to-stone-950 overflow-hidden shadow-[0_20px_40px_-10px_rgba(28,25,23,0.5)] ring-1 ring-white/5">
      <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay" viewBox="0 0 100 100">
        <filter id="stoneGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#stoneGrain)" />
      </svg>
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent opacity-50 rounded-t-full"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Plus size={32} strokeWidth={0.8} className="text-stone-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
      </div>
    </div>
  </button>
);

// Settings Sheet
const SettingsSheet = ({ isOpen, onClose, onSeedData, nickname, onNicknameChange }: { isOpen: boolean, onClose: () => void, onSeedData: () => void, nickname: string, onNicknameChange: (name: string) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const items = getItems();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "nianwu_backup_" + new Date().toISOString().slice(0,10) + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => { fileInputRef.current?.click(); };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          if (json.length > 0 && !json[0].id) throw new Error("Invalid format");
          localStorage.setItem('digital_keep_items_v2', JSON.stringify(json));
          alert("记忆回溯成功。即将刷新...");
          window.location.reload();
        }
      } catch (err) { alert("文件格式有误，无法解析。"); }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className={`fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
      <div className={`fixed bottom-0 left-0 right-0 bg-[#f2f0e9] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 transition-transform duration-500 ease-out transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} max-h-[85vh] overflow-y-auto`}>
        <div className="p-8 pb-12">
           <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-8"></div>
           <h3 className="font-serif text-2xl text-ink mb-2">数据方舟</h3>
           <p className="text-xs text-stone-500 tracking-widest font-serif mb-8">DATA ARK · 记忆备份与管理</p>
           <div className="space-y-6">
             <div className="bg-white border border-stone-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4"><div className="p-2 bg-stone-100 rounded-full text-stone-600"><User size={18} strokeWidth={1.5} /></div><span className="text-stone-700 font-serif">我的称谓</span></div>
                <input type="text" value={nickname} onChange={(e) => onNicknameChange(e.target.value)} placeholder="请输入昵称" className="w-full bg-stone-50 border-b border-stone-300 py-2 px-3 text-ink font-serif focus:outline-none focus:border-stone-500 transition-colors" />
                <p className="text-[10px] text-stone-400 mt-2 tracking-wide">物品在告别信中对您的称呼。</p>
             </div>
             <div className="space-y-4">
               <button onClick={handleExport} className="w-full py-4 px-6 bg-white border border-stone-200 rounded-xl flex items-center justify-between group hover:border-stone-400 transition-all">
                 <div className="flex items-center space-x-4"><div className="p-2 bg-stone-100 rounded-full text-stone-600 group-hover:bg-stone-200 transition-colors"><Download size={20} strokeWidth={1.5} /></div><div className="text-left"><div className="text-stone-800 font-serif">记忆结集 (导出)</div><div className="text-[10px] text-stone-400 tracking-wide">保存当前所有数据为 JSON 文件</div></div></div><ArrowLeft size={16} className="rotate-180 text-stone-300 group-hover:text-stone-600 transition-colors" />
               </button>
               <button onClick={handleImportClick} className="w-full py-4 px-6 bg-white border border-stone-200 rounded-xl flex items-center justify-between group hover:border-stone-400 transition-all">
                 <div className="flex items-center space-x-4"><div className="p-2 bg-stone-100 rounded-full text-stone-600 group-hover:bg-stone-200 transition-colors"><Upload size={20} strokeWidth={1.5} /></div><div className="text-left"><div className="text-stone-800 font-serif">时光回溯 (导入)</div><div className="text-[10px] text-stone-400 tracking-wide">从备份文件恢复数据</div></div></div><ArrowLeft size={16} className="rotate-180 text-stone-300 group-hover:text-stone-600 transition-colors" />
               </button>
               <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
               <div className="h-px bg-stone-200 my-6"></div>
               <button onClick={onSeedData} className="w-full py-4 px-6 bg-stone-100/50 border border-stone-200/50 rounded-xl flex items-center justify-between group hover:bg-amber-50/50 hover:border-amber-200/50 transition-all">
                 <div className="flex items-center space-x-4"><div className="p-2 bg-white rounded-full text-amber-600/70 group-hover:text-amber-600 transition-colors"><Sparkles size={20} strokeWidth={1.5} /></div><div className="text-left"><div className="text-stone-700 font-serif">注入演示数据</div><div className="text-[10px] text-stone-400 tracking-wide">快速体验应用功能</div></div></div>
               </button>
               <button onClick={() => { if(confirm('确定要重置所有数据吗？此操作无法撤销。')) { localStorage.clear(); window.location.reload(); } }} className="w-full py-4 px-6 bg-transparent border border-dashed border-stone-300 rounded-xl flex items-center justify-center space-x-2 group hover:border-red-300 hover:bg-red-50/30 transition-all mt-4"><RefreshCcw size={16} className="text-stone-400 group-hover:text-red-400 transition-colors" /><span className="text-stone-400 text-xs tracking-widest group-hover:text-red-400 transition-colors">重置应用</span></button>
             </div>
           </div>
        </div>
      </div>
    </>
  );
};

// --- Home View ---
const HomeView = ({ onStartDeclutter, onOpenSettings, onOpenGallery }: { onStartDeclutter: () => void, onOpenSettings: () => void, onOpenGallery: () => void }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => { setStats(getUserStats()); }, []);
  if (!stats) return null;

  return (
    <div className="flex flex-col h-full bg-paper relative overflow-hidden transition-colors duration-1000">
      <ZenBackground />
      <div className="flex-1 flex flex-col p-8 pt-12 relative z-10">
        <header className="mb-12 flex justify-between items-start animate-fade-in-up relative z-20">
          <div className="text-left"><h1 className="text-4xl font-serif text-ink mb-1 tracking-tight">念物</h1><p className="text-stone-400 text-[10px] tracking-[0.3em] uppercase opacity-70">MONO NO AWARE</p></div>
          <button onClick={onOpenSettings} className="p-2 -mr-2 text-stone-400 hover:text-stone-600 transition-colors opacity-60 hover:opacity-100"><Settings size={20} strokeWidth={1.5} /></button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center relative -mt-20">
          <div className="relative w-72 h-72 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-stone-200 via-stone-100 to-white rounded-full opacity-30 animate-breathe blur-xl" style={{ transform: `scale(${1 + (stats.levelProgress / 200)})` }}></div>
            <div className="relative z-10 text-center flex flex-col items-center cursor-pointer group" onClick={() => setShowVolume(!showVolume)}>
              <span className="font-serif text-stone-500 text-sm mb-3 tracking-[0.2em] border-b border-stone-300 pb-1">修行境界</span>
              <h2 className="text-5xl font-serif text-ink mb-4 tracking-wider">{stats.levelTitle}</h2>
              <div className="flex items-center space-x-2 text-stone-400 text-xs tracking-widest mt-2 group-hover:text-stone-600 transition-colors" onClick={(e) => { e.stopPropagation(); onOpenGallery(); }}>
                {showVolume ? (<span>已腾出 <span className="text-stone-600 font-serif text-lg">{(stats.totalReleased * 0.02 + 0.05).toFixed(2)}</span> m³</span>) : (<span>已释放 <span className="text-stone-600 font-serif text-lg">{stats.totalReleased}</span> 件旧物</span>)}
              </div>
            </div>
            <svg className="absolute inset-0 w-full h-full animate-[spin_60s_linear_infinite] opacity-10 pointer-events-none"><defs><path id="circlePath" d="M 144, 144 m -120, 0 a 120,120 0 1,1 240,0 a 120,120 0 1,1 -240,0" /></defs><text fontSize="9"><textPath href="#circlePath" className="font-serif tracking-[0.5em] fill-current text-stone-900">放下过往 • 腾出空间 • 拥抱未来 • </textPath></text></svg>
          </div>
        </div>
        <button onClick={onOpenGallery} className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-48 flex items-center justify-center group"><div className="vertical-text font-serif text-stone-300 text-xs tracking-[0.8em] group-hover:text-stone-500 transition-colors duration-500 h-full border-l border-stone-200/50 pl-6 hover:border-stone-300">念物馆</div></button>
        <div className="pb-12 flex flex-col items-center animate-fade-in relative z-20"><InkstoneButton onClick={onStartDeclutter} /><p className="font-serif text-stone-400 text-[10px] text-center mt-6 tracking-[0.3em] opacity-60">仪式 · 开启</p></div>
      </div>
    </div>
  );
};

// --- Scan View (Multi-Image) ---
const ScanView = ({ onImageCaptured, onCancel }: { onImageCaptured: (files: File[], note: string, mode: ArchiveMode) => void, onCancel: () => void }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [note, setNote] = useState('');
  const [mode, setMode] = useState<ArchiveMode>('sentiment');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Safely convert FileList to File[]
      const files: File[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files.item(i);
        if (file) files.push(file);
      }
      
      const newFiles = [...selectedFiles, ...files];
      setSelectedFiles(newFiles);

      // Create previews
      const newPreviewPromises = files.map(file => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }));

      Promise.all(newPreviewPromises).then(newPreviews => {
        setPreviews(prev => [...prev, ...newPreviews]);
        // Set active preview to the first added image if none selected
        if (selectedFiles.length === 0) setActivePreviewIndex(0);
      });
    }
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    if (activePreviewIndex >= newFiles.length) setActivePreviewIndex(Math.max(0, newFiles.length - 1));
  };

  const handleSelectFile = () => { if (fileInputRef.current) fileInputRef.current.value = ''; fileInputRef.current?.click(); }

  return (
    <div className="flex flex-col h-full bg-stone-900 text-stone-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center pointer-events-none">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 pointer-events-auto"><ArrowLeft size={24} /></button>
        <span className="text-white/40 text-xs tracking-[0.3em] font-serif">拾 遗</span>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {previews.length > 0 ? (
          <div className="flex-1 flex flex-col h-full animate-fade-in relative">
            {/* Main Preview Area - Absolute fill strategy for robust mobile layout */}
            <div className="flex-1 relative min-h-0 bg-black/50 w-full">
               <img src={previews[activePreviewIndex]} alt="To archive" className="absolute inset-0 w-full h-full object-contain opacity-90 transition-opacity duration-300" />
               <div className="absolute top-6 right-6 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 pointer-events-auto"><span className="text-[10px] tracking-widest text-white/80">{mode === 'sentiment' ? '仪式：羁绊' : '仪式：尘俗'}</span></div>
               {activePreviewIndex === 0 && <div className="absolute bottom-4 left-6 px-2 py-0.5 bg-amber-900/50 backdrop-blur rounded text-[10px] text-amber-100/80 tracking-wider">封面</div>}
            </div>
            
            {/* Film Strip & Inputs - Shrink prevented */}
            <div className="bg-stone-900 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] shrink-0">
               {/* Film Strip */}
               <div className="flex items-center p-3 space-x-3 overflow-x-auto hide-scrollbar bg-black/20 border-b border-white/5">
                  {previews.map((preview, idx) => (
                    <div key={idx} onClick={() => setActivePreviewIndex(idx)} className={`relative w-14 h-14 flex-shrink-0 rounded overflow-hidden cursor-pointer border-2 transition-all ${activePreviewIndex === idx ? 'border-amber-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={preview} className="w-full h-full object-cover" alt="" />
                      <button onClick={(e) => { e.stopPropagation(); removeImage(idx); }} className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full text-white hover:bg-red-500/80 transition-colors"><X size={10} /></button>
                    </div>
                  ))}
                  <button onClick={handleSelectFile} className="w-14 h-14 flex-shrink-0 rounded border border-dashed border-stone-600 flex flex-col items-center justify-center text-stone-500 hover:text-stone-300 hover:border-stone-400 transition-all">
                    <Plus size={16} />
                    <span className="text-[8px] mt-1">加图</span>
                  </button>
               </div>

               <div className="p-5 pt-4">
                 <div className="mb-4"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder={mode === 'sentiment' ? "这件物品承载了什么记忆..." : "备注物品瑕疵或处理原因..."} className="w-full bg-transparent text-lg font-serif text-stone-200 placeholder-stone-600 focus:outline-none border-b border-stone-800 pb-2 transition-colors focus:border-stone-500" /></div>
                 <div className="flex space-x-4">
                   <button onClick={() => selectedFiles.length > 0 && onImageCaptured(selectedFiles, note, mode)} className={`w-full py-3.5 rounded-full font-bold text-xs tracking-widest transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl active:scale-95 ${mode === 'sentiment' ? 'bg-amber-100 text-amber-900 hover:bg-white' : 'bg-stone-200 text-stone-900 hover:bg-white'}`}>{mode === 'sentiment' ? <Sparkles size={14} /> : <Stamp size={14} />}<span>{mode === 'sentiment' ? '开始通灵' : '确认归档'}</span></button>
                 </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            <div className="flex items-center space-x-12 relative">
               <button onClick={() => setMode('sentiment')} className={`relative pb-2 transition-all duration-500 ${mode === 'sentiment' ? 'text-amber-100 opacity-100' : 'text-stone-500 opacity-50 hover:opacity-80'}`}>
                 <div className="flex flex-col items-center space-y-2"><Heart size={24} strokeWidth={1} className={mode === 'sentiment' ? 'fill-amber-500/20' : ''} /><span className="font-serif text-lg tracking-[0.2em]">羁绊</span></div>
                 {mode === 'sentiment' && <div className="absolute bottom-0 left-0 right-0 h-px bg-amber-100/50 shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>}
               </button>
               <div className="w-px h-12 bg-stone-800"></div>
               <button onClick={() => setMode('utility')} className={`relative pb-2 transition-all duration-500 ${mode === 'utility' ? 'text-blue-100 opacity-100' : 'text-stone-500 opacity-50 hover:opacity-80'}`}>
                 <div className="flex flex-col items-center space-y-2"><Box size={24} strokeWidth={1} className={mode === 'utility' ? 'fill-blue-500/20' : ''} /><span className="font-serif text-lg tracking-[0.2em]">尘俗</span></div>
                 {mode === 'utility' && <div className="absolute bottom-0 left-0 right-0 h-px bg-blue-100/50 shadow-[0_0_10px_rgba(147,197,253,0.5)]"></div>}
               </button>
            </div>
            <p className="text-stone-500 text-xs font-serif tracking-widest h-4 transition-all duration-300">{mode === 'sentiment' ? '—— 唯美告别，释放情感 ——' : '—— 理性审阅，快速归档 ——'}</p>
            <div onClick={handleSelectFile} className="w-full max-w-xs aspect-[3/4] border border-dashed border-stone-700 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-stone-800/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800/50 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center transform group-hover:scale-105 transition-transform duration-500">
                 <div className="w-20 h-20 rounded-full border border-stone-600 flex items-center justify-center mb-6 text-stone-500 group-hover:text-stone-300 group-hover:border-stone-400 transition-all duration-500"><Camera size={28} strokeWidth={1} /></div>
                 <p className="font-serif text-stone-400 tracking-widest text-lg">拍摄旧物</p><p className="text-stone-600 text-xs mt-3 tracking-wider">记录它的最后时刻</p>
              </div>
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={handleFileChange} className="hidden" />
          </div>
        )}
      </div>
    </div>
  );
};

// --- Ritual View (Updated for Multi-Image) ---
const RitualView = ({ item, onComplete, onCancel, nickname }: { item: GeminiResponse & { imageUris: string[], mode: ArchiveMode }, onComplete: () => void, onCancel: () => void, nickname: string }) => {
  // Uses first image for display
  const displayImage = item.imageUris[0];
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationFrame = useRef<number>(0);
  const isUtility = item.mode === 'utility';
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const displayFarewell = item.farewellMessage.replace(/主人/g, nickname);

  useEffect(() => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) audioCtxRef.current = new AudioContext();
    return () => { if (audioCtxRef.current) audioCtxRef.current.close().catch(console.error); };
  }, []);

  const playSound = (isStart: boolean) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    if (isStart) {
      oscillatorRef.current = ctx.createOscillator();
      gainNodeRef.current = ctx.createGain();
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(ctx.destination);
      oscillatorRef.current.type = isUtility ? 'sawtooth' : 'sine';
      oscillatorRef.current.frequency.setValueAtTime(isUtility ? 50 : 100, ctx.currentTime);
      gainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime);
      gainNodeRef.current.gain.linearRampToValueAtTime(isUtility ? 0.1 : 0.5, ctx.currentTime + (isUtility ? 0.1 : 1));
      oscillatorRef.current.start();
    } else {
      if (gainNodeRef.current) gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      setTimeout(() => oscillatorRef.current?.stop(), 200);
      if (progress > 90) {
        const endOsc = ctx.createOscillator();
        const endGain = ctx.createGain();
        endOsc.connect(endGain);
        endGain.connect(ctx.destination);
        endOsc.type = isUtility ? 'square' : 'sine';
        endOsc.frequency.setValueAtTime(isUtility ? 80 : 800, ctx.currentTime);
        endGain.gain.setValueAtTime(isUtility ? 0.5 : 0.2, ctx.currentTime);
        endGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (isUtility ? 0.2 : 1.5));
        endOsc.start();
        endOsc.stop(ctx.currentTime + (isUtility ? 0.2 : 1.5));
      }
    }
  };

  const updatePitch = (percent: number) => {
    if (oscillatorRef.current && audioCtxRef.current) {
       const base = isUtility ? 50 : 100;
       const factor = isUtility ? 0.2 : 5;
       oscillatorRef.current.frequency.setTargetAtTime(base + (percent * factor), audioCtxRef.current.currentTime, 0.1);
    }
  };

  const startHolding = () => { setHolding(true); playSound(true); if (navigator.vibrate) navigator.vibrate(50); };
  const stopHolding = () => { setHolding(false); if (progress < 100) setProgress(0); playSound(false); if (navigator.vibrate) navigator.vibrate(0); };

  useEffect(() => {
    if (holding) {
      const startTime = Date.now();
      const duration = isUtility ? 1500 : 3000;
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(100, (elapsed / duration) * 100);
        setProgress(newProgress);
        updatePitch(newProgress);
        if (navigator.vibrate && newProgress % 15 < 2) navigator.vibrate(20 + newProgress);
        if (newProgress < 100) { animationFrame.current = requestAnimationFrame(animate); } else { onComplete(); }
      };
      animationFrame.current = requestAnimationFrame(animate);
    } else { if (animationFrame.current) cancelAnimationFrame(animationFrame.current); }
    return () => { if (animationFrame.current) cancelAnimationFrame(animationFrame.current); };
  }, [holding, onComplete]);

  return (
    <div className={`flex flex-col h-full bg-stone-900 relative overflow-hidden items-center justify-center transition-colors duration-1000 ${isUtility ? 'bg-slate-900' : 'bg-stone-900'}`}>
      <div className="absolute inset-0"><img src={displayImage} className="w-full h-full object-cover opacity-20 blur-2xl scale-110" alt="" /><div className={`absolute inset-0 mix-blend-multiply ${isUtility ? 'bg-slate-900/80' : 'bg-stone-900/60'}`}></div></div>
      <div className="relative z-10 w-full max-w-md px-8 flex flex-col items-center">
        <div className={`w-full rounded-sm shadow-2xl overflow-hidden mb-12 transform transition-all duration-300 ease-out ${isUtility ? 'bg-stone-100 p-6 font-mono text-xs' : 'bg-paper p-4 pb-12 font-serif'} ${holding && !isUtility ? 'scale-95 opacity-80 filter blur-[1px]' : ''} ${holding && isUtility ? 'scale-[0.98] translate-y-1' : ''}`}>
           <div className={`aspect-[4/3] w-full overflow-hidden bg-stone-200 mb-6 transition-all duration-1000 ${isUtility ? 'grayscale-[50%] contrast-110' : 'grayscale-[20%] hover:grayscale-0'}`}><img src={displayImage} className="w-full h-full object-cover" alt="Item" /></div>
           <div className="text-center px-2">
             <div className={`text-[10px] tracking-[0.3em] uppercase mb-3 border-b pb-2 inline-block ${isUtility ? 'text-slate-500 border-slate-300' : 'text-amber-700/60 border-stone-200'}`}>{isUtility ? '处置回执' : '告别信'}</div>
             <h2 className={`text-2xl mb-6 text-ink ${isUtility ? 'font-bold tracking-tighter' : 'font-serif'}`}>{item.title}</h2>
             <p className={`leading-loose ${isUtility ? 'text-slate-600 text-left border-l-2 border-slate-300 pl-4' : 'text-stone-600 italic'}`}>"{displayFarewell}"</p>
           </div>
           {isUtility && progress === 100 && (<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-red-700 text-red-700 rounded-lg p-2 font-black text-4xl rotate-[-15deg] opacity-80 animate-in zoom-in duration-300">已 处 理</div>)}
        </div>
        <div className="relative">
           <p className={`text-stone-400 text-[10px] tracking-[0.3em] text-center mb-6 transition-opacity duration-500 ${holding ? 'opacity-0' : 'opacity-100'}`}>{isUtility ? '长按 · 归档' : '长按 · 释怀'}</p>
           <button className="group relative w-20 h-20 flex items-center justify-center outline-none touch-none" onMouseDown={startHolding} onMouseUp={stopHolding} onTouchStart={(e) => { e.preventDefault(); startHolding(); }} onTouchEnd={(e) => { e.preventDefault(); stopHolding(); }} onMouseLeave={stopHolding}>
             <div className={`absolute inset-0 border rounded-full transition-all duration-1000 ${isUtility ? 'border-slate-500/30' : 'border-stone-500/30'} ${holding ? 'scale-150 opacity-0' : 'scale-100'}`}></div>
             <div className={`absolute inset-0 border rounded-full scale-75 transition-all duration-1000 delay-75 ${isUtility ? 'border-slate-400/50' : 'border-stone-400/50'} ${holding ? 'scale-125 opacity-0' : 'scale-75'}`}></div>
             <div className={`w-3 h-3 rounded-full transition-all duration-300 ${isUtility ? 'bg-slate-200' : 'bg-stone-200'} ${holding ? (isUtility ? 'scale-[6] bg-red-800 rounded-sm' : 'scale-[6] bg-amber-100 shadow-[0_0_40px_rgba(255,255,255,0.5)]') : 'scale-100'}`}></div>
             {holding && !isUtility && (<div className="absolute inset-0 animate-spin-slow"><div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full opacity-50 blur-[1px]"></div><div className="absolute bottom-0 right-1/2 w-1 h-1 bg-white rounded-full opacity-50 blur-[1px]"></div></div>)}
           </button>
        </div>
        <button onClick={onCancel} className={`mt-8 text-stone-600 text-xs hover:text-stone-400 transition-colors ${holding ? 'opacity-0' : 'opacity-100'}`}>取消</button>
      </div>
      {!isUtility && (<div className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-100" style={{ opacity: progress === 100 ? 1 : 0 }} ></div>)}
    </div>
  );
};

// --- Slideshow Overlay (Curator Mode) ---
const SlideshowOverlay = ({ items, onClose }: { items: ArchivedItem[], onClose: () => void }) => {
  const [index, setIndex] = useState(0);
  const current = items[index];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % items.length);
    }, 8000); // 8 seconds per slide
    return () => clearInterval(timer);
  }, [items.length]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-in fade-in duration-1000">
      <div className="absolute inset-0 pointer-events-none">
         <img key={current.id} src={current.imageUris[0]} className="w-full h-full object-cover opacity-60 animate-[ken-burns_10s_ease-in-out_infinite] scale-110" alt="" />
      </div>
      <div className="relative z-10 max-w-lg p-8 text-center text-stone-200">
         <div className="animate-fade-in-up key={current.id}">
           <div className="text-[10px] tracking-[0.5em] uppercase text-stone-400 mb-4">{current.sentiment}</div>
           <h2 className="text-3xl font-serif mb-8 text-white tracking-widest">{current.title}</h2>
           <p className="font-serif italic text-lg leading-loose opacity-80">"{current.farewellMessage}"</p>
         </div>
      </div>
      <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"><X size={32} strokeWidth={1} /></button>
    </div>
  );
};

// --- Gallery View ---
const UtilityRow: React.FC<{ item: ArchivedItem, onClick: () => void, nickname: string }> = ({ item, onClick, nickname }) => {
  const displayFarewell = item.farewellMessage.replace(/主人/g, nickname);
  return (
    <div onClick={onClick} className="flex items-center p-3 border-b border-stone-300/60 bg-[#f4f2ea] hover:bg-[#eae8df] transition-colors cursor-pointer group relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-stone-300/50"></div>
      <div className="w-10 h-10 bg-stone-200 overflow-hidden rounded-sm flex-shrink-0 relative border border-stone-300 ml-2">
        <img src={item.imageUris[0]} className="w-full h-full object-cover saturate-0 contrast-125 opacity-70" alt="" />
        <div className="absolute inset-0 bg-stone-500/10 mix-blend-multiply"></div>
      </div>
      <div className="ml-4 flex-1 min-w-0 font-mono text-stone-700">
        <div className="flex justify-between items-baseline mb-1">
           <h4 className="text-xs font-bold tracking-tight truncate mr-2 text-stone-800">{item.title}</h4>
           <span className="text-[9px] text-stone-400 shrink-0">{new Date(item.dateArchived).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between items-center">
           <p className="text-[10px] text-stone-500 truncate max-w-[70%] tracking-tight border-b border-dashed border-stone-300 pb-0.5">{displayFarewell}</p>
           <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded-sm border border-stone-300 bg-white/50"><span className="text-[8px] font-bold text-stone-600 uppercase tracking-wide">{item.sentiment}</span></div>
        </div>
      </div>
    </div>
  );
};

const SentimentCard: React.FC<{ item: ArchivedItem, onClick: () => void, index: number }> = ({ item, onClick }) => (
  <div onClick={onClick} className={`mb-8 break-inside-avoid cursor-pointer group`}>
     <div className="relative overflow-hidden bg-white p-3 pb-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-sm">
        <div className="aspect-[3/4] overflow-hidden bg-stone-100 mb-4 relative">
          <img src={item.imageUris[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 saturate-[0.8] group-hover:saturate-100" alt="" />
          {item.imageUris.length > 1 && <div className="absolute bottom-2 right-2 bg-black/40 px-1.5 py-0.5 rounded text-[9px] text-white/90 backdrop-blur-sm tracking-widest font-serif">+{item.imageUris.length - 1}</div>}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5"></div>
        </div>
        <div className="px-1 text-center">
           <h3 className="font-serif text-lg text-ink mb-2 tracking-tight leading-relaxed">{item.title}</h3>
           <div className="flex items-center justify-center space-x-2 opacity-60">
             <div className="h-px w-3 bg-stone-300"></div><p className="text-[10px] text-stone-500 tracking-[0.2em] font-serif">{item.sentiment}</p><div className="h-px w-3 bg-stone-300"></div>
           </div>
        </div>
     </div>
  </div>
);

const GalleryView = ({ items, onItemClick, onBack, nickname }: { items: ArchivedItem[], onItemClick: (item: ArchivedItem) => void, onBack: () => void, nickname: string }) => {
  const [tab, setTab] = useState<'sentiment' | 'utility'>('sentiment');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  
  const filteredItems = items.filter(item => {
    const matchesSearch = searchQuery === '' || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.sentiment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = item.mode === tab; 
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex flex-col h-full relative bg-paper transition-colors duration-500">
      <div className="pt-10 pb-4 px-6 backdrop-blur-xl sticky top-0 z-30 border-b border-stone-200/50 bg-paper/90">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
             <button onClick={onBack} className="text-stone-500 hover:text-stone-800 transition-colors"><ArrowLeft size={20} strokeWidth={1.5} /></button>
             <h2 className="text-2xl font-serif tracking-wide text-ink">念物馆</h2>
          </div>
          <div className="flex space-x-3">
             {tab === 'sentiment' && items.length > 0 && <button onClick={() => setIsSlideshowOpen(true)} className="text-stone-400 hover:text-stone-600 transition-colors"><Play size={20} strokeWidth={1.5} /></button>}
             <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-stone-400 hover:text-stone-600 transition-colors"><Search size={20} strokeWidth={1.5} /></button>
          </div>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${isSearchOpen ? 'h-12 opacity-100 mb-4' : 'h-0 opacity-0'}`}>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="寻觅..." className="w-full bg-transparent border-b border-stone-300 py-2 text-stone-600 font-serif focus:outline-none placeholder-stone-400" />
        </div>
        <div className="flex p-1 rounded-lg relative bg-stone-200/50">
           <button onClick={() => setTab('sentiment')} className={`flex-1 py-2 text-xs tracking-widest font-serif transition-all duration-300 rounded-md flex items-center justify-center space-x-2 ${tab === 'sentiment' ? 'bg-white shadow-sm text-amber-900' : 'text-stone-500 hover:text-stone-700'}`}><Heart size={12} className={tab === 'sentiment' ? 'fill-amber-500/20' : ''} /><span>追忆画廊</span></button>
           <button onClick={() => setTab('utility')} className={`flex-1 py-2 text-xs tracking-widest font-bold font-mono transition-all duration-300 rounded-md flex items-center justify-center space-x-2 ${tab === 'utility' ? 'bg-[#f4f2ea] shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}><Box size={12} className={tab === 'utility' ? 'text-stone-600' : ''} /><span>封存档案</span></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-8">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-40 space-y-4">{tab === 'sentiment' ? <Wind size={32} /> : <FileText size={32} />}<p className="font-serif text-xs tracking-widest">此处空无一物</p></div>
        ) : (
           <>
             {tab === 'sentiment' ? (<div className="p-4 columns-2 gap-4 space-y-4">{filteredItems.map((item, i) => (<SentimentCard key={item.id} item={item} index={i} onClick={() => onItemClick(item)} />))}</div>) : (<div className="border-t border-stone-300/50"><div className="bg-[repeating-linear-gradient(transparent,transparent_39px,#e5e2d6_40px)]">{filteredItems.map((item) => (<UtilityRow key={item.id} item={item} onClick={() => onItemClick(item)} nickname={nickname} />))}</div></div>)}
           </>
        )}
      </div>
      {isSlideshowOpen && <SlideshowOverlay items={filteredItems} onClose={() => setIsSlideshowOpen(false)} />}
    </div>
  );
};

// --- Detail View ---
const DetailView = ({ item, onBack, onDelete, nickname }: { item: ArchivedItem, onBack: () => void, onDelete: (id: string) => void, nickname: string }) => {
  if (!item) return null;
  const isUtility = item.mode === 'utility';
  const displayFarewell = item.farewellMessage.replace(/主人/g, nickname);

  return (
    <div className={`h-full overflow-y-auto animate-in fade-in duration-500 relative bg-paper`}>
      <button onClick={onBack} className="fixed top-6 left-6 z-30 p-3 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors shadow-lg"><ArrowLeft size={20} /></button>
      <div className="relative h-[45vh] w-full">
        <img src={item.imageUris[0]} className={`w-full h-full object-cover transition-all duration-700 ${isUtility ? 'saturate-[0.5] contrast-110' : 'saturate-[0.85] brightness-90'}`} alt={item.title} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none"></div>
        <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-paper to-transparent`}></div>
        <div className="absolute top-20 right-8 z-10 writing-mode-vertical vertical-text text-white/95 drop-shadow-lg"><h1 className={`text-3xl font-serif tracking-[0.2em] leading-loose ${isUtility ? 'font-mono font-bold text-white/90' : 'font-light'}`}>{item.title}</h1></div>
      </div>
      <div className="relative z-20 px-6 pb-20 -mt-12">
        <div className={`backdrop-blur-sm p-6 rounded-t-sm shadow-sm ${isUtility ? 'bg-[#f4f2ea] border border-stone-300' : 'bg-paper/95 border-t border-white/50'}`}>
          <div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4">
             <div className="flex flex-col"><span className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">{isUtility ? '状态' : '情感印记'}</span><span className={`font-serif text-stone-600 ${isUtility ? 'font-bold font-mono text-stone-700' : ''}`}>{isUtility && <CheckCircle2 size={12} className="inline mr-1 text-stone-600" />}{item.sentiment}</span></div>
             <div className="flex flex-col items-end"><span className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">{isUtility ? '封存日期' : '封存日期'}</span><span className="font-serif text-stone-600">{new Date(item.dateArchived).toLocaleDateString()}</span></div>
          </div>
          
          {/* Memory Fragments (Multi-Image Gallery) */}
          {item.imageUris.length > 1 && (
            <div className="mb-8">
              <span className="text-[10px] text-stone-400 uppercase tracking-widest mb-3 block font-serif">记忆碎片</span>
              <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2">
                {item.imageUris.slice(1).map((uri, idx) => (
                  <div key={idx} className="flex-shrink-0 w-24 h-24 bg-stone-100 p-1 shadow-sm rotate-1 first:rotate-[-2deg] last:rotate-2">
                    <img src={uri} className="w-full h-full object-cover saturate-[0.8]" alt="" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-10 relative">
            {!isUtility && <Feather className="absolute -top-6 -left-2 text-stone-200 w-12 h-12 -z-10 opacity-50" />}
            {isUtility && <FileText className="absolute -top-6 -left-2 text-stone-200 w-12 h-12 -z-10 opacity-50" />}
            <p className={`text-lg leading-loose text-ink text-justify ${isUtility ? 'font-mono text-sm' : 'font-serif indent-8'}`}>{item.description}</p>
          </div>
          <div className={`p-6 relative mb-12 ${isUtility ? 'bg-stone-200/30 border-2 border-dashed border-stone-300' : 'bg-stone-50 border-l-2 border-amber-800/20'}`}>
             <div className={`absolute -top-3 left-4 px-2 text-xs tracking-widest uppercase ${isUtility ? 'bg-[#f4f2ea] text-stone-500 font-bold' : 'bg-stone-50 text-amber-900/40 font-serif'}`}>{isUtility ? '处置回执' : '物品寄语'}</div>
             <p className={`text-stone-600 leading-loose ${isUtility ? 'font-mono text-xs' : 'font-serif italic'}`}>"{displayFarewell}"</p>
          </div>
          
          {item.estimatedVolume && (
            <div className="mb-8 text-center">
              <span className="text-[10px] text-stone-400 uppercase tracking-widest">已释放空间</span>
              <div className="text-stone-600 font-serif text-lg mt-1">{item.estimatedVolume} m³</div>
            </div>
          )}

          <div className="flex justify-center mt-8 pb-12"><button onClick={() => onDelete(item.id)} className="text-xs text-stone-300 hover:text-red-400 transition-colors tracking-widest uppercase border-b border-transparent hover:border-red-400 pb-1">{isUtility ? '移除此记录' : '将此记忆抹去'}</button></div>
        </div>
      </div>
    </div>
  );
};

// --- Analyzing View ---
const AnalyzingView = () => (
  <div className="flex flex-col h-full bg-paper relative overflow-hidden items-center justify-center">
    <ZenBackground />
    <div className="relative z-10 flex flex-col items-center p-8 space-y-6 animate-pulse">
      <h2 className="text-2xl font-serif text-stone-800 tracking-[0.2em] font-light">
        读取记忆中
      </h2>
      <div className="h-px w-12 bg-stone-400 mx-auto"></div>
      <p className="text-stone-500 text-xs tracking-widest font-serif italic">
        正在倾听它的告别...
      </p>
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ArchivedItem | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<(GeminiResponse & { imageUris: string[], userNote: string, mode: ArchiveMode }) | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [nickname, setNicknameState] = useState(getNickname());

  useEffect(() => { setItems(getItems()); }, [view]);

  const handleNicknameChange = (name: string) => { setNicknameState(name); setNickname(name); };

  const handleArchiveStart = async (files: File[], note: string, mode: ArchiveMode) => {
    setView(AppView.ANALYZING);
    try {
      // Read all files
      const base64Promises = files.map(file => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }));

      const base64Images = await Promise.all(base64Promises);
      const analysis: GeminiResponse = await archiveObject(base64Images, note, mode, nickname);
      setPendingAnalysis({ ...analysis, imageUris: base64Images, userNote: note, mode: analysis.mode || mode });
      setView(AppView.RITUAL);
    } catch (e) { console.error(e); setView(AppView.HOME); }
  };

  const handleRitualComplete = () => {
    if (pendingAnalysis) {
      const newItem: ArchivedItem = {
        id: Date.now().toString(),
        imageUris: pendingAnalysis.imageUris,
        title: pendingAnalysis.title,
        description: pendingAnalysis.description,
        farewellMessage: pendingAnalysis.farewellMessage,
        sentiment: pendingAnalysis.sentiment,
        category: pendingAnalysis.category,
        dateArchived: Date.now(),
        userNote: pendingAnalysis.userNote,
        mode: pendingAnalysis.mode,
        estimatedVolume: pendingAnalysis.estimatedVolume
      };
      saveItem(newItem); setSelectedItem(newItem); setView(AppView.DETAIL); setPendingAnalysis(null);
    }
  };

  const handleDelete = (id: string) => { if(confirm("确定要删除这条记录吗？")) { deleteItem(id); setView(AppView.GALLERY); } };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-paper font-sans text-stone-900 selection:bg-stone-200">
      {view === AppView.HOME && (<HomeView onStartDeclutter={() => setView(AppView.SCAN)} onOpenSettings={() => setIsSettingsOpen(true)} onOpenGallery={() => setView(AppView.GALLERY)} />)}
      {view === AppView.SCAN && <ScanView onImageCaptured={handleArchiveStart} onCancel={() => setView(AppView.HOME)} />}
      {view === AppView.ANALYZING && <AnalyzingView />}
      {view === AppView.RITUAL && pendingAnalysis && <RitualView item={pendingAnalysis} onComplete={handleRitualComplete} onCancel={() => setView(AppView.HOME)} nickname={nickname} />}
      {view === AppView.GALLERY && <GalleryView items={items} onItemClick={(item) => {setSelectedItem(item); setView(AppView.DETAIL);}} onBack={() => setView(AppView.HOME)} nickname={nickname} />}
      {view === AppView.DETAIL && selectedItem && <DetailView item={selectedItem} onBack={() => setView(AppView.GALLERY)} onDelete={handleDelete} nickname={nickname} />}
      <SettingsSheet isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSeedData={() => {seedDatabase(); setItems(getItems());}} nickname={nickname} onNicknameChange={handleNicknameChange} />
    </div>
  );
}