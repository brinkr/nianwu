
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  X,
  Trash2,
  Share
} from 'lucide-react';
import { archiveObject } from './services/geminiService';
import { saveItem, getItems, deleteItem, getUserStats, seedDatabase, getNickname, setNickname } from './services/storageService';
import { ArchivedItem, AppView, GeminiResponse, UserStats, ArchiveMode } from './types';
import ZenBackground from './components/ZenBackground';

// --- Components ---

// Inkstone Button (Action)
const InkstoneButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="group relative w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-500 hover:scale-105 active:scale-95 outline-none cursor-pointer"
    aria-label="Start Ritual"
    style={{ touchAction: 'none' }}
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
const SettingsSheet: React.FC<{ isOpen: boolean, onClose: () => void, onSeedData: () => void, nickname: string, onNicknameChange: (name: string) => void }> = ({ isOpen, onClose, onSeedData, nickname, onNicknameChange }) => {
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
const HomeView: React.FC<{ onStartDeclutter: () => void, onOpenSettings: () => void, onOpenGallery: () => void }> = ({ onStartDeclutter, onOpenSettings, onOpenGallery }) => {
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

// --- Scan View (Restored Dark Theme) ---
const ScanView: React.FC<{ onImageCaptured: (files: File[], note: string, mode: ArchiveMode) => void, onCancel: () => void }> = ({ onImageCaptured, onCancel }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [note, setNote] = useState('');
  const [mode, setMode] = useState<ArchiveMode>('sentiment');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files.item(i);
        if (file) files.push(file);
      }
      
      const newFiles = [...selectedFiles, ...files];
      setSelectedFiles(newFiles);

      const newPreviewPromises = files.map(file => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }));

      Promise.all(newPreviewPromises).then(newPreviews => {
        setPreviews(prev => [...prev, ...newPreviews]);
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
    <div className="flex flex-col h-[100dvh] bg-[#1c1917] text-stone-200 relative overflow-hidden font-serif">
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center pointer-events-none">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 pointer-events-auto"><ArrowLeft size={24} /></button>
        <span className="text-stone-500 text-xs tracking-[0.3em]">拾 遗</span>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {previews.length > 0 ? (
          <div className="flex-1 flex flex-col h-full animate-fade-in relative">
            <div className="flex-1 relative min-h-0 bg-black/50 w-full">
               <img src={previews[activePreviewIndex]} alt="To archive" className="absolute inset-0 w-full h-full object-contain opacity-90 transition-opacity duration-300" />
               <div className="absolute top-6 right-6 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 pointer-events-auto"><span className="text-[10px] tracking-widest text-white/80">{mode === 'sentiment' ? '仪式：羁绊' : '仪式：尘俗'}</span></div>
               {activePreviewIndex === 0 && <div className="absolute bottom-4 left-6 px-2 py-0.5 bg-amber-900/50 backdrop-blur rounded text-[10px] text-amber-100/80 tracking-wider">封面</div>}
            </div>
            
            <div className="bg-stone-900 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] shrink-0">
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
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Tabs */}
            <div className="flex items-center space-x-16 mb-12">
               <button onClick={() => setMode('sentiment')} className={`flex flex-col items-center space-y-3 group transition-all duration-300 ${mode === 'sentiment' ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-70'}`}>
                  <Heart size={24} strokeWidth={1} className={mode === 'sentiment' ? 'fill-amber-500/0 text-amber-200' : 'text-stone-400'} />
                  <span className="text-sm tracking-[0.2em] text-stone-300">羁绊</span>
                  {mode === 'sentiment' && <div className="w-8 h-px bg-amber-200/50 mt-2 shadow-[0_0_8px_rgba(253,230,138,0.5)]"></div>}
               </button>
               <div className="w-px h-8 bg-stone-800"></div>
               <button onClick={() => setMode('utility')} className={`flex flex-col items-center space-y-3 group transition-all duration-300 ${mode === 'utility' ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-70'}`}>
                  <Box size={24} strokeWidth={1} className={mode === 'utility' ? 'fill-blue-500/0 text-blue-200' : 'text-stone-400'} />
                  <span className="text-sm tracking-[0.2em] text-stone-300">尘俗</span>
                   {mode === 'utility' && <div className="w-8 h-px bg-blue-200/50 mt-2 shadow-[0_0_8px_rgba(191,219,254,0.5)]"></div>}
               </button>
            </div>

            {/* Poetic Line */}
            <p className="text-[10px] text-stone-600 tracking-[0.3em] mb-16 opacity-80">
               {mode === 'sentiment' ? '—— 唯美告别，释放情感 ——' : '—— 理性归档，清理杂物 ——'}
            </p>

            {/* Camera Trigger Area */}
            <div onClick={handleSelectFile} className="relative group cursor-pointer">
               <div className="w-64 h-80 rounded-[3rem] border border-dashed border-stone-800 flex flex-col items-center justify-center transition-all duration-500 group-hover:border-stone-600 group-hover:bg-stone-800/30">
                  <div className="w-20 h-20 rounded-full bg-stone-800/50 flex items-center justify-center mb-6 border border-stone-700 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                     <Camera size={28} strokeWidth={1} className="text-stone-400 group-hover:text-stone-200" />
                  </div>
                  <h3 className="text-lg text-stone-300 font-light tracking-[0.2em] mb-2">拍摄旧物</h3>
                  <p className="text-[10px] text-stone-600 tracking-wider">记录它的最后时刻</p>
               </div>
            </div>
          </div>
        )}
      </div>
      
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
    </div>
  );
};

// --- Analyzing View (Pure Text Zen Style) ---
const AnalyzingView = () => (
  <div className="flex flex-col h-full bg-paper items-center justify-center relative overflow-hidden">
    <ZenBackground />
    <div className="relative z-10 flex flex-col items-center text-center p-8">
      <div className="space-y-4 animate-pulse">
        <h2 className="text-2xl font-serif text-stone-800 tracking-[0.2em] font-light">
          读取记忆中
        </h2>
        <div className="h-px w-12 bg-stone-300 mx-auto"></div>
        <p className="text-stone-500 text-xs tracking-widest font-serif italic">
          正在倾听它的告别...
        </p>
      </div>
    </div>
  </div>
);

// --- Ritual View (Farewell) ---
const RitualView: React.FC<{ item: ArchivedItem, onComplete: () => void, onCancel: () => void }> = ({ item, onComplete, onCancel }) => {
  const [progressState, setProgressState] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Logic Refs
  const progressRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lockedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Keep callback fresh
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const DURATION = item.mode === 'sentiment' ? 2000 : 1000;

  // Global event handlers
  const handleGlobalUp = useCallback(() => {
    if (lockedRef.current) return;
    
    // Stop logic
    setIsPressing(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;
    progressRef.current = 0;
    setProgressState(0);

    // Clean up global listeners
    window.removeEventListener('mouseup', handleGlobalUp);
    window.removeEventListener('touchend', handleGlobalUp);
  }, []);

  const startPress = (e: React.TouchEvent | React.MouseEvent) => {
    if (lockedRef.current) return;
    
    setIsPressing(true);
    startTimeRef.current = Date.now();
    
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);

    const animate = () => {
      if (!startTimeRef.current || lockedRef.current) return;
      
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min(100, (elapsed / DURATION) * 100);
      
      progressRef.current = newProgress;
      setProgressState(newProgress);

      if (newProgress >= 100) {
        lockedRef.current = true; // Irreversible Lock
        setIsCompleted(true);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        
        window.removeEventListener('mouseup', handleGlobalUp);
        window.removeEventListener('touchend', handleGlobalUp);
        
        try { if (navigator.vibrate) navigator.vibrate([50, 50, 50]); } catch(e) {}
        
        setTimeout(() => {
           onCompleteRef.current(); 
        }, 100);
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => { 
      if (rafRef.current) cancelAnimationFrame(rafRef.current); 
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [handleGlobalUp]);

  return (
    <div 
      className="flex flex-col h-full bg-stone-900 text-stone-100 relative overflow-hidden select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
       <div className="absolute inset-0 z-0">
         <img src={item.imageUris[0]} alt="" className="w-full h-full object-cover opacity-40 blur-sm scale-105" />
         <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"></div>
       </div>

       <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 pb-32">
          <div className="w-full max-w-sm bg-paper text-ink p-8 shadow-2xl animate-fade-in-up transform transition-transform duration-500" style={{ transform: isPressing ? 'scale(0.98)' : 'scale(1)' }}>
             <div className="w-full h-48 mb-6 overflow-hidden relative grayscale opacity-90 contrast-125">
               <img src={item.imageUris[0]} alt="" className="w-full h-full object-cover" />
             </div>
             <div className="text-center space-y-4">
                <div className="text-[10px] text-stone-400 tracking-[0.3em] uppercase border-b border-stone-200 pb-2 inline-block">告别信</div>
                <h2 className="text-2xl font-serif text-stone-800">{item.title}</h2>
                <div className="text-sm font-serif leading-loose text-stone-600 italic opacity-80">
                  "{item.farewellMessage}"
                </div>
             </div>
          </div>
       </div>

       <div className="absolute bottom-0 left-0 right-0 h-48 flex flex-col items-center justify-center bg-gradient-to-t from-stone-900 to-transparent z-20">
          <p className={`text-xs font-serif tracking-[0.3em] mb-8 transition-opacity duration-500 ${isPressing || isCompleted ? 'opacity-100 text-amber-100' : 'opacity-50 text-stone-400'}`}>
            {isCompleted ? '已释怀' : '长按 · 释怀'}
          </p>
          
          <div 
            className="relative w-32 h-32 flex items-center justify-center"
            onMouseDown={startPress}
            onTouchStart={startPress}
            style={{ cursor: 'pointer' }}
          >
             <div className="absolute inset-[-4rem] z-30 rounded-full" /> 
             <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                {item.mode === 'sentiment' ? (
                  <>
                    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="3 3" opacity={isPressing ? 0.3 : 0} />
                    <g style={{ 
                        opacity: (isPressing || isCompleted) ? 1 : 0, 
                        transition: 'opacity 0.2s',
                        transform: `rotate(${progressState * 3.6}deg)`, 
                        transformOrigin: '50px 50px' 
                    }}>
                       <circle cx="50" cy="4" r="3" fill="#fbbf24" filter="url(#glow)" />
                       <path d="M 50 4 A 46 46 0 0 0 35 6" fill="none" stroke="url(#trailGradient)" strokeWidth="2" strokeLinecap="round" opacity={progressState > 2 ? 0.6 : 0} />
                    </g>
                    <defs>
                      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                      <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
                        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                  </>
                ) : (
                  <>
                    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="4" />
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="289" strokeDashoffset={289 - (289 * progressState) / 100} strokeLinecap="butt" />
                  </>
                )}
             </svg>
             <div
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 outline-none pointer-events-none ${item.mode === 'sentiment' ? 'bg-gradient-to-br from-amber-900/80 to-stone-900 border border-amber-900/50' : 'bg-stone-800 border border-blue-900/50'}`}
                style={{ transform: isPressing ? 'scale(0.95)' : 'scale(1)' }}
             >
                {item.mode === 'sentiment' ? <Feather size={24} strokeWidth={1} className={`text-amber-100/80 transition-all duration-1000 ${isPressing ? 'opacity-100 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'opacity-60'}`} /> : <Stamp size={24} strokeWidth={1} className={`text-blue-100/80 transition-all ${isPressing ? 'scale-110 text-blue-400' : ''}`} />}
             </div>
          </div>
          
          <button onClick={onCancel} className="mt-8 text-xs text-stone-500 hover:text-stone-300 transition-colors tracking-widest border-b border-transparent hover:border-stone-500 pb-1">取消</button>
       </div>
    </div>
  );
};

// --- Utility Components (Gallery) ---
const UtilityRow: React.FC<{ item: ArchivedItem, onClick: () => void }> = ({ item, onClick }) => (
  <div onClick={onClick} className="w-full bg-white border-b border-dashed border-stone-200 p-4 flex items-center justify-between group active:bg-stone-50 cursor-pointer">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-stone-100 rounded-sm overflow-hidden border border-stone-100 grayscale opacity-80">
        <img src={item.imageUris[0]} alt="" className="w-full h-full object-cover mix-blend-multiply" />
      </div>
      <div>
        <h3 className="font-serif text-sm text-stone-800 tracking-wide">{item.title}</h3>
        <p className="text-[10px] text-stone-400 font-serif mt-1 line-clamp-1 max-w-[200px]">{item.farewellMessage}</p>
      </div>
    </div>
    <div className="flex flex-col items-end space-y-2">
      <span className="text-[10px] text-stone-300 font-mono tracking-tighter">{new Date(item.dateArchived).toLocaleDateString()}</span>
      <div className="px-2 py-0.5 border border-stone-200 rounded-full flex items-center space-x-1">
        <CheckCircle2 size={8} className="text-green-800/60" />
        <span className="text-[9px] text-stone-500 tracking-widest">{item.sentiment}</span>
      </div>
    </div>
  </div>
);

const SentimentCard: React.FC<{ item: ArchivedItem, onClick: () => void }> = ({ item, onClick }) => (
  <div onClick={onClick} className="break-inside-avoid mb-6 cursor-pointer group">
    <div className="relative overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-500">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img src={item.imageUris[0]} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter saturate-[0.8]" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
           <span className="text-white text-xs font-serif tracking-widest">{item.sentiment}</span>
        </div>
      </div>
      <div className="p-5 text-center">
        <h3 className="font-serif text-lg text-ink mb-2">{item.title}</h3>
        <div className="w-8 h-px bg-stone-200 mx-auto my-3"></div>
        <p className="text-[10px] text-stone-400 tracking-[0.2em] font-serif">—— {item.category} ——</p>
      </div>
    </div>
  </div>
);

// --- Gallery View ---
const GalleryView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [activeTab, setActiveTab] = useState<'sentiment' | 'utility'>('sentiment');
  const [selectedItem, setSelectedItem] = useState<ArchivedItem | null>(null);
  const [isSlideShow, setIsSlideShow] = useState(false);

  useEffect(() => { setItems(getItems()); }, []);

  const filteredItems = items.filter(i => i.mode === activeTab);

  if (isSlideShow) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={() => setIsSlideShow(false)}>
        <p className="text-white font-serif tracking-widest animate-pulse">冥想策展模式 · 播放中</p>
      </div>
    );
  }

  if (selectedItem) {
    return <DetailView item={selectedItem} onClose={() => setSelectedItem(null)} onDelete={(id) => { deleteItem(id); setItems(getItems()); setSelectedItem(null); }} />;
  }

  return (
    <div className="flex flex-col h-full bg-[#f2f0e9]">
      <div className="px-6 pt-12 pb-4 bg-[#f2f0e9]/90 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between border-b border-stone-200/50">
         <div className="flex items-center">
           <button onClick={onBack} className="p-2 -ml-2 text-stone-400 hover:text-stone-600 transition-colors"><ArrowLeft size={20} strokeWidth={1.5} /></button>
           <h2 className="ml-2 font-serif text-2xl text-ink tracking-tight">念物馆</h2>
         </div>
         <button onClick={() => setIsSlideShow(true)} className="p-2 text-stone-400 hover:text-stone-600 transition-colors"><Play size={18} strokeWidth={1.5} /></button>
      </div>

      <div className="px-6 py-4">
        <div className="flex p-1 bg-stone-200/50 rounded-lg">
          <button onClick={() => setActiveTab('sentiment')} className={`flex-1 py-2 text-xs font-serif tracking-widest transition-all rounded-md ${activeTab === 'sentiment' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-600'}`}><span className="flex items-center justify-center space-x-2"><Heart size={12} /><span>追忆画廊</span></span></button>
          <button onClick={() => setActiveTab('utility')} className={`flex-1 py-2 text-xs font-serif tracking-widest transition-all rounded-md ${activeTab === 'utility' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-600'}`}><span className="flex items-center justify-center space-x-2"><Box size={12} /><span>封存档案</span></span></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
         {filteredItems.length === 0 ? (
           <div className="h-64 flex flex-col items-center justify-center text-stone-300 space-y-4">
             <Wind size={48} strokeWidth={1} />
             <p className="text-xs font-serif tracking-widest">空无一物</p>
           </div>
         ) : (
           activeTab === 'sentiment' ? (
             <div className="columns-2 gap-6 space-y-6 pb-20">
               {filteredItems.map(item => <SentimentCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />)}
             </div>
           ) : (
             <div className="space-y-0 pb-20 border-t border-dashed border-stone-200">
               {filteredItems.map(item => <UtilityRow key={item.id} item={item} onClick={() => setSelectedItem(item)} />)}
             </div>
           )
         )}
      </div>
    </div>
  );
};

// --- Detail View ---
const DetailView: React.FC<{ item: ArchivedItem, onClose: () => void, onDelete: (id: string) => void }> = ({ item, onClose, onDelete }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#f2f0e9] overflow-y-auto hide-scrollbar">
      <button onClick={onClose} className="fixed top-6 left-6 z-50 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/80 hover:bg-black/40 transition-colors"><ArrowLeft size={20} /></button>
      
      <div className="relative h-[45vh] w-full overflow-hidden">
        <img src={item.imageUris[0]} alt="" className="absolute inset-0 w-full h-full object-cover saturate-[0.8] brightness-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
          <div className="text-white/90">
             <div className="w-px h-12 bg-white/50 mb-4"></div>
             <p className="font-serif text-xs tracking-[0.3em] opacity-80 mb-2">{item.sentiment}</p>
             <h1 className="font-serif text-3xl tracking-widest drop-shadow-lg">{item.title}</h1>
          </div>
          <div className="vertical-text font-serif text-xs text-white/60 tracking-[0.5em] h-32 border-l border-white/20 pl-4">{item.category}</div>
        </div>
      </div>

      <div className="relative -mt-12 mx-4 mb-12 bg-white shadow-xl p-6 min-h-[50vh]">
         <div className="flex justify-between items-start mb-8 border-b border-stone-100 pb-6">
            <div>
              <span className="block text-[9px] text-stone-400 tracking-widest uppercase mb-1">STATUS</span>
              <div className="flex items-center space-x-2 text-stone-700 font-serif">
                {item.mode === 'sentiment' ? <Heart size={14} className="text-amber-600" /> : <CheckCircle2 size={14} className="text-green-700" />}
                <span>{item.sentiment}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[9px] text-stone-400 tracking-widest uppercase mb-1">DATE</span>
              <span className="text-stone-700 font-serif">{new Date(item.dateArchived).toLocaleDateString()}</span>
            </div>
         </div>

         <div className="mb-8">
            <p className="font-serif text-stone-600 leading-relaxed text-sm text-justify opacity-80">{item.description}</p>
         </div>

         {item.imageUris.length > 1 && (
           <div className="mb-8">
             <span className="block text-[9px] text-stone-400 tracking-widest uppercase mb-3">MEMORY FRAGMENTS</span>
             <div className="flex space-x-3 overflow-x-auto pb-4 hide-scrollbar">
               {item.imageUris.slice(1).map((uri, idx) => (
                 <div key={idx} className="flex-shrink-0 w-24 h-32 bg-stone-100 p-1 shadow-sm rotate-1 first:-rotate-1">
                   <img src={uri} alt="" className="w-full h-full object-cover filter sepia-[0.2]" />
                 </div>
               ))}
             </div>
           </div>
         )}

         <div className={`p-6 relative ${item.mode === 'sentiment' ? 'bg-stone-50' : 'bg-blue-50/30 border border-blue-100'}`}>
            {item.mode === 'sentiment' && <FileText size={48} className="absolute top-4 right-4 text-stone-200 -z-0 rotate-12" />}
            <span className="block text-[9px] text-stone-400 tracking-widest uppercase mb-4 relative z-10">{item.mode === 'sentiment' ? 'DISPOSITION NOTE' : 'ARCHIVE RECORD'}</span>
            <p className="font-serif text-stone-600 leading-loose italic text-sm relative z-10">
              "{item.farewellMessage}"
            </p>
         </div>

         <div className="mt-12 flex justify-center">
            <button onClick={() => { if(confirm('彻底遗忘此物品？')) onDelete(item.id); }} className="text-[10px] text-stone-300 tracking-[0.3em] hover:text-red-400 transition-colors uppercase">Remove Record</button>
         </div>
      </div>
    </div>
  );
};

// --- Main App ---
const App = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [scannedImages, setScannedImages] = useState<File[]>([]);
  const [scanNote, setScanNote] = useState('');
  const [scanMode, setScanMode] = useState<ArchiveMode>('sentiment');
  const [analyzedItem, setAnalyzedItem] = useState<ArchivedItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [nickname, setNicknameState] = useState(getNickname());

  useEffect(() => { setNicknameState(getNickname()); }, []);
  const handleNicknameChange = (name: string) => { setNicknameState(name); setNickname(name); };

  const handleArchiveStart = async (files: File[], note: string, mode: ArchiveMode) => {
    setScannedImages(files);
    setScanNote(note);
    setScanMode(mode);
    setView(AppView.ANALYZING);

    const base64Promises = files.map(file => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    }));

    try {
      const base64Images = await Promise.all(base64Promises);
      const result = await archiveObject(base64Images, note, mode, nickname);
      
      const newItem: ArchivedItem = {
        id: Date.now().toString(),
        imageUris: base64Images,
        title: result.title,
        description: result.description,
        farewellMessage: result.farewellMessage,
        sentiment: result.sentiment,
        category: result.category,
        dateArchived: Date.now(),
        userNote: note,
        mode: mode,
        estimatedVolume: result.estimatedVolume
      };

      setAnalyzedItem(newItem);
      setView(AppView.RITUAL);
    } catch (error) {
      console.error(error);
      setView(AppView.SCAN);
    }
  };

  const handleRitualComplete = useCallback(() => {
    if (analyzedItem) {
      saveItem(analyzedItem);
      setView(AppView.GALLERY);
      setAnalyzedItem(null);
    }
  }, [analyzedItem]);

  return (
    <div className="h-[100dvh] w-full bg-stone-100 shadow-none relative overflow-hidden font-sans">
      {view === AppView.HOME && (
        <HomeView 
          onStartDeclutter={() => setView(AppView.SCAN)} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenGallery={() => setView(AppView.GALLERY)}
        />
      )}
      
      {view === AppView.SCAN && (
        <ScanView 
          onImageCaptured={handleArchiveStart} 
          onCancel={() => setView(AppView.HOME)} 
        />
      )}
      
      {view === AppView.ANALYZING && <AnalyzingView />}
      
      {view === AppView.RITUAL && analyzedItem && (
        <RitualView 
          item={analyzedItem} 
          onComplete={handleRitualComplete}
          onCancel={() => setView(AppView.HOME)}
        />
      )}
      
      {view === AppView.GALLERY && (
        <GalleryView onBack={() => setView(AppView.HOME)} />
      )}

      <SettingsSheet 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSeedData={() => { seedDatabase(); window.location.reload(); }}
        nickname={nickname}
        onNicknameChange={handleNicknameChange}
      />
    </div>
  );
};

export default App;
