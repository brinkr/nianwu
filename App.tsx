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
  Share2
} from 'lucide-react';
import { archiveObject } from './services/geminiService';
import { saveItem, getItems, deleteItem, getUserStats, seedDatabase } from './services/storageService';
import { ArchivedItem, AppView, GeminiResponse, UserStats } from './types';

// --- Sub-Components ---

// 1. Navigation Bar
const NavBar = ({ currentView, setView }: { currentView: AppView, setView: (v: AppView) => void }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-[#fdfbf7] border-t border-stone-200 py-3 px-6 flex justify-around items-center z-50 safe-area-bottom">
    <button 
      onClick={() => setView(AppView.HOME)}
      className={`flex flex-col items-center space-y-1 transition-colors ${currentView === AppView.HOME ? 'text-stone-800' : 'text-stone-400'}`}
    >
      <Box size={24} strokeWidth={currentView === AppView.HOME ? 2.5 : 2} />
      <span className="text-[10px] tracking-widest font-medium">空间</span>
    </button>
    
    <button 
      onClick={() => setView(AppView.SCAN)}
      className="relative -top-6 bg-stone-800 text-[#fdfbf7] p-4 rounded-full shadow-xl hover:bg-stone-700 transition-transform active:scale-95 border-4 border-[#fdfbf7]"
    >
      <Plus size={32} />
    </button>

    <button 
      onClick={() => setView(AppView.GALLERY)}
      className={`flex flex-col items-center space-y-1 transition-colors ${currentView === AppView.GALLERY ? 'text-stone-800' : 'text-stone-400'}`}
    >
      <Archive size={24} strokeWidth={currentView === AppView.GALLERY ? 2.5 : 2} />
      <span className="text-[10px] tracking-widest font-medium">藏馆</span>
    </button>
  </div>
);

// 2. Home View (Dashboard)
const HomeView = ({ onStartDeclutter, onSeedData }: { onStartDeclutter: () => void, onSeedData: () => void }) => {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    setStats(getUserStats());
  }, []);

  if (!stats) return null;

  return (
    <div className="flex flex-col h-full p-6 pt-12 bg-[#fdfbf7]">
      <header className="mb-10 relative">
        <h1 className="text-4xl font-serif text-stone-900 mb-2 tracking-wide">念物</h1>
        <p className="text-stone-500 text-sm tracking-widest uppercase">Digital Sanctuary</p>
        <div className="absolute top-2 right-0 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
           <span className="text-xs font-serif text-stone-600">境界：{stats.levelTitle}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center space-y-6">
        
        {/* Progress Circle Visual */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Background circles */}
          <div className="absolute inset-0 border border-stone-100 rounded-full scale-110"></div>
          <div className="absolute inset-0 border border-stone-200 rounded-full"></div>
          
          <div className="text-center z-10">
            <span className="block text-6xl font-serif text-stone-800 mb-1">{stats.totalReleased}</span>
            <span className="text-xs text-stone-400 tracking-[0.2em] uppercase">已释放</span>
          </div>

           {/* Simple Progress Ring CSS */}
           <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
             <circle 
               cx="128" cy="128" r="120" 
               stroke="#e7e5e4" strokeWidth="2" fill="none" 
             />
             <circle 
               cx="128" cy="128" r="120" 
               stroke="#44403c" strokeWidth="4" fill="none" 
               strokeDasharray={2 * Math.PI * 120}
               strokeDashoffset={2 * Math.PI * 120 * (1 - stats.levelProgress / 100)}
               className="transition-all duration-1000 ease-out"
             />
           </svg>
        </div>

        {/* Philosophy Card */}
        <div className="w-full bg-stone-100/50 p-6 rounded-2xl border border-stone-200/50 backdrop-blur-sm">
          <p className="font-serif text-stone-600 text-base leading-loose text-center">
            "万物皆有灵，告别亦是始。<br/>将回忆留在这里，把空间还给生活。"
          </p>
        </div>

        {/* CTA */}
        <div className="w-full pt-4 flex-1 flex flex-col justify-end pb-24 space-y-4">
          <button 
            onClick={onStartDeclutter}
            className="w-full bg-stone-900 text-[#fcfbf9] py-5 rounded-2xl font-medium shadow-lg hover:bg-stone-800 transition-all flex items-center justify-center space-x-3 active:scale-[0.98]"
          >
            <Wind size={20} />
            <span className="tracking-widest">开启整理仪式</span>
          </button>

          {/* Test / Debug Tools - Always visible now */}
          <div className="flex items-center justify-center space-x-4 pt-2">
            <button 
              onClick={onSeedData}
              className="text-stone-400 py-2 text-xs hover:text-stone-600 transition-colors flex items-center justify-center space-x-1"
            >
              <Database size={12} />
              <span>注入演示数据</span>
            </button>
             <span className="text-stone-300">|</span>
             <button 
              onClick={() => {
                if(confirm('确定清空所有数据吗？应用将重置。')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="text-stone-400 py-2 text-xs hover:text-red-500 transition-colors flex items-center justify-center space-x-1"
            >
              <Trash2 size={12} />
              <span>重置应用</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Scan View
const ScanView = ({ onImageCaptured, onCancel }: { onImageCaptured: (file: File, note: string) => void, onCancel: () => void }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState('');
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

  const handleSubmit = () => {
    if (selectedFile) {
      onImageCaptured(selectedFile, note);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-900 text-stone-50">
      <div className="p-4 flex items-center pt-8">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-stone-800 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <span className="ml-4 font-medium tracking-wide">拾起旧物</span>
      </div>

      <div className="flex-1 flex flex-col p-6">
        {preview ? (
          <div className="flex-1 relative rounded-3xl overflow-hidden bg-black mb-6 border border-stone-700 shadow-2xl">
            <img src={preview} alt="To archive" className="w-full h-full object-contain opacity-90" />
            <button 
              onClick={() => { setSelectedFile(null); setPreview(null); }}
              className="absolute top-4 right-4 bg-black/40 p-3 rounded-full backdrop-blur-md hover:bg-black/60 transition-colors"
            >
              <Trash2 size={20} className="text-white" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 border border-dashed border-stone-600 rounded-3xl flex flex-col items-center justify-center bg-stone-800/30 mb-6 cursor-pointer hover:bg-stone-800/50 transition-colors group"
          >
            <div className="bg-stone-800 p-8 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
              <Camera size={40} className="text-stone-400 group-hover:text-stone-200" />
            </div>
            <p className="text-stone-300 font-medium text-lg tracking-wide">拍摄物品</p>
            <p className="text-stone-500 text-sm mt-2">或从相册选择</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              capture="environment" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-stone-800/50 p-4 rounded-2xl border border-stone-700">
            <label className="block text-stone-400 text-xs font-bold mb-3 tracking-wider">这件物品对你的意义是？</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="写下它的故事，或者为什么你一直留着它..."
              className="w-full bg-transparent text-stone-100 placeholder-stone-600 focus:outline-none resize-none h-20 text-sm leading-relaxed"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedFile}
            className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg ${
              selectedFile 
                ? 'bg-stone-100 text-stone-900 hover:bg-white' 
                : 'bg-stone-800 text-stone-600 cursor-not-allowed'
            }`}
          >
            <Sparkles size={18} />
            <span className="tracking-widest">提取记忆 · 准备告别</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. Analyzing View (Loading)
const AnalyzingView = () => (
  <div className="flex flex-col h-full items-center justify-center p-8 bg-[#fdfbf7] text-center">
    <div className="relative mb-12">
      <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-50 duration-1000"></div>
      <div className="relative bg-white p-8 rounded-full shadow-xl border border-amber-50">
        <Loader2 size={40} className="text-stone-800 animate-spin" />
      </div>
    </div>
    <h2 className="text-xl font-serif text-stone-800 mb-4 tracking-widest">正在阅读物品记忆...</h2>
    <p className="text-stone-400 text-sm max-w-xs leading-loose">
      AI 正在聆听它过去的故事<br/>提取它最珍贵的灵魂片段
    </p>
  </div>
);

// 5. Ritual View (The core feature)
// Augmented with Audio and Haptics
const RitualView = ({ 
  item, 
  onComplete, 
  onCancel 
}: { 
  item: GeminiResponse & { imageUri: string }, 
  onComplete: () => void, 
  onCancel: () => void 
}) => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationFrame = useRef<number>(0);
  
  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Initialize Audio Context on mount (but don't play yet)
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      audioCtxRef.current = new AudioContext();
    }
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  const playSuccessSound = () => {
    if (!audioCtxRef.current) return;
    
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Zen Chime / Release sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // Ping up
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 2);   // Long fade down
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
    
    osc.start();
    osc.stop(ctx.currentTime + 2);
  };

  const startSound = () => {
    if (!audioCtxRef.current) return;
    
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    oscillatorRef.current = ctx.createOscillator();
    gainNodeRef.current = ctx.createGain();
    
    oscillatorRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(ctx.destination);
    
    // Low drone that rises
    oscillatorRef.current.type = 'triangle';
    oscillatorRef.current.frequency.setValueAtTime(110, ctx.currentTime); // Low A
    gainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime);
    gainNodeRef.current.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5); // Fade in

    oscillatorRef.current.start();
  };

  const stopSound = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.1);
      setTimeout(() => {
        oscillatorRef.current?.stop();
        oscillatorRef.current = null;
      }, 100);
    }
  };

  const updateSound = (progressPercent: number) => {
    if (oscillatorRef.current && audioCtxRef.current) {
      // Pitch rises with progress
      const baseFreq = 110;
      const targetFreq = baseFreq + (progressPercent * 2); // 110 -> 310hz
      oscillatorRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.1);
    }
  };

  // Hold-to-release logic
  const startHolding = () => {
    setHolding(true);
    startSound();
    if (navigator.vibrate) navigator.vibrate(50); // Initial feedback
  };

  const stopHolding = () => {
    setHolding(false);
    setProgress(0);
    stopSound();
    if (navigator.vibrate) navigator.vibrate(0); // Stop vibration
  };

  useEffect(() => {
    if (holding) {
      const startTime = Date.now();
      const duration = 2500; // 2.5 seconds to hold

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(100, (elapsed / duration) * 100);
        setProgress(newProgress);
        updateSound(newProgress);

        // Haptic feedback increasing intensity (simulated by frequent pulses)
        if (navigator.vibrate && newProgress % 10 < 2) { 
           // Vibrate every ~10% roughly
           navigator.vibrate(10 + newProgress / 2); 
        }

        if (newProgress < 100) {
          animationFrame.current = requestAnimationFrame(animate);
        } else {
          stopSound();
          playSuccessSound();
          if (navigator.vibrate) navigator.vibrate([100, 50, 200]); // Success vibration pattern
          onComplete(); // Success
        }
      };
      
      animationFrame.current = requestAnimationFrame(animate);
    } else {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    }
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [holding, onComplete]);

  return (
    <div className="flex flex-col h-full bg-stone-900 relative overflow-hidden">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 opacity-20">
        <img src={item.imageUri} className="w-full h-full object-cover blur-xl" alt="" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-6 pt-12 items-center">
        {/* The Digital Card */}
        <div className="bg-[#fdfbf7] w-full max-w-sm rounded-t-3xl rounded-b-lg shadow-2xl overflow-hidden mb-8 transform transition-transform duration-500 border border-stone-800/50">
           <div className="h-64 overflow-hidden relative">
             <img src={item.imageUri} className="w-full h-full object-cover" alt="Item" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
             <div className="absolute bottom-4 left-4 text-white">
               <p className="text-xs opacity-75 tracking-widest uppercase mb-1">{item.category}</p>
               <h2 className="text-2xl font-serif">{item.title}</h2>
             </div>
           </div>
           <div className="p-6">
             <div className="flex items-center space-x-2 mb-4 text-amber-600">
               <Sparkles size={14} />
               <span className="text-xs font-bold tracking-widest uppercase">来自物品的告别</span>
             </div>
             <p className="text-stone-700 font-serif leading-loose text-sm italic">
               "{item.farewellMessage}"
             </p>
           </div>
        </div>

        {/* Instructions */}
        <div className={`text-center transition-opacity duration-300 ${holding ? 'opacity-50' : 'opacity-100'}`}>
          <p className="text-stone-300 text-sm tracking-widest mb-2">已完成数字化提取</p>
          <p className="text-stone-500 text-xs">长按指纹，确认释放实体，存入念物馆</p>
        </div>

        {/* The Fingerprint / Hold Area */}
        <div className="mt-auto mb-12 relative flex items-center justify-center">
          <button 
            className="relative z-20 w-24 h-24 rounded-full bg-stone-800 border-2 border-stone-600 flex items-center justify-center touch-none outline-none focus:outline-none overflow-hidden"
            onMouseDown={startHolding}
            onMouseUp={stopHolding}
            onTouchStart={(e) => { e.preventDefault(); startHolding(); }}
            onTouchEnd={(e) => { e.preventDefault(); stopHolding(); }}
            onMouseLeave={stopHolding}
            style={{ transform: holding ? 'scale(0.95)' : 'scale(1)' }}
          >
             <Wind size={32} className={`text-stone-400 transition-all duration-500 ${holding ? 'scale-125 text-amber-200' : ''}`} />
             
             {/* Progress Fill */}
             <div 
               className="absolute bottom-0 left-0 right-0 bg-amber-500/20 w-full transition-all duration-75 ease-linear"
               style={{ height: `${progress}%` }}
             ></div>
          </button>
          
          {/* Ripples */}
          {holding && (
            <>
              <div className="absolute w-24 h-24 rounded-full border border-amber-500/50 animate-ping"></div>
              <div className="absolute w-24 h-24 rounded-full border border-stone-500/30 animate-ping animation-delay-500"></div>
            </>
          )}
        </div>

        <button onClick={onCancel} className="mb-4 text-stone-500 text-xs hover:text-stone-300">
          暂时不扔，取消
        </button>
      </div>
    </div>
  );
};

// 6. Gallery View (Enhanced with Search)
const GalleryView = ({ items, onItemClick }: { items: ArchivedItem[], onItemClick: (item: ArchivedItem) => void }) => {
  const [filter, setFilter] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const categories = ['全部', ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(item => {
    const matchesCategory = filter === '全部' || item.category === filter;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sentiment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] pb-20">
      <div className="p-6 bg-[#fdfbf7]/90 backdrop-blur-md border-b border-stone-100 sticky top-0 z-10 transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif text-stone-800 tracking-wide">念物馆</h2>
          <button 
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (isSearchOpen) setSearchQuery('');
            }}
            className="p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
          >
            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
        </div>

        {/* Search Bar Input */}
        <div className={`overflow-hidden transition-all duration-300 ${isSearchOpen ? 'max-h-16 mb-4' : 'max-h-0'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-stone-400" size={16} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索回忆、物品或情感..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-stone-700 focus:outline-none focus:border-stone-400"
              autoFocus={isSearchOpen}
            />
          </div>
        </div>
        
        {/* Category Chips */}
        <div className="flex space-x-3 overflow-x-auto pb-2 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                filter === cat 
                  ? 'bg-stone-800 text-stone-50 border-stone-800' 
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-stone-400 space-y-4">
            <Box size={48} className="opacity-30" />
            <p className="text-sm font-serif">馆内空无一物，<br/>也是一种境界。</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-stone-400">
             <p className="text-sm">未找到相关记忆</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-24">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => onItemClick(item)}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 cursor-pointer hover:shadow-lg transition-all duration-300 group"
              >
                <div className="aspect-[4/5] w-full overflow-hidden bg-stone-200 relative">
                  <img src={item.imageUri} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <div className="p-4">
                  <h3 className="font-serif font-medium text-stone-800 text-base mb-1 truncate">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded">{item.category}</span>
                    <span className="text-[10px] text-stone-400">{new Date(item.dateArchived).getMonth() + 1}月{new Date(item.dateArchived).getDate()}日</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 7. Detail View
const DetailView = ({ item, onBack, onDelete }: { item: ArchivedItem, onBack: () => void, onDelete: (id: string) => void }) => {
  if (!item) return null;

  const handleShare = () => {
    // Simulated share
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `在[念物]中与${item.title}告别：${item.farewellMessage}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      alert("卡片已生成，截图即可分享。");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] overflow-y-auto pb-24 animate-in fade-in zoom-in-95 duration-300">
      <div className="relative h-96 w-full">
        <img src={item.imageUri} alt={item.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none"></div>
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 bg-white/30 p-2 rounded-full backdrop-blur-md shadow-sm hover:bg-white/50 text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={handleShare}
          className="absolute top-4 right-4 bg-white/30 p-2 rounded-full backdrop-blur-md shadow-sm hover:bg-white/50 text-white"
        >
          <Share2 size={24} />
        </button>
      </div>

      <div className="flex-1 p-8 -mt-10 bg-[#fdfbf7] rounded-t-[2.5rem] relative z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center space-x-2">
             <span className="text-xs font-bold uppercase tracking-widest text-stone-500 border border-stone-200 px-3 py-1 rounded-full">
               {item.category}
             </span>
             <span className="text-xs font-serif text-stone-400 px-2">
               {item.sentiment}
             </span>
           </div>
        </div>

        <h1 className="text-4xl font-serif text-stone-900 mb-8">{item.title}</h1>

        <div className="space-y-10">
          <div className="relative">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 flex items-center">
              <Sparkles size={12} className="mr-2 text-stone-300" />
              物品记忆
            </h3>
            <p className="text-base leading-loose text-stone-600 font-serif text-justify">
              {item.description}
            </p>
          </div>

          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
             <div className="flex items-center space-x-2 mb-4">
              <Heart size={14} className="text-rose-400 fill-rose-400" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">来自它的信</h3>
            </div>
            <p className="text-stone-600 font-serif italic text-sm leading-loose">
              "{item.farewellMessage}"
            </p>
          </div>

          {item.userNote && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-3">你的备注</h3>
              <p className="text-stone-500 text-sm">{item.userNote}</p>
            </div>
          )}
          
          <div className="pt-8 flex justify-center">
             <p className="text-[10px] text-stone-300 uppercase tracking-widest">Archived on {new Date(item.dateArchived).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-100">
          <button 
            onClick={() => onDelete(item.id)}
            className="w-full text-stone-400 text-sm hover:text-red-500 flex items-center justify-center space-x-2 py-4 transition-colors"
          >
            <Trash2 size={16} />
            <span>彻底删除记录 (无法找回)</span>
          </button>
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
  
  // Staging state for the Ritual
  const [pendingAnalysis, setPendingAnalysis] = useState<(GeminiResponse & { imageUri: string, userNote: string }) | null>(null);

  useEffect(() => {
    setItems(getItems());
  }, [view]);

  const handleArchiveStart = async (file: File, note: string) => {
    setView(AppView.ANALYZING);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // Call AI
        const analysis: GeminiResponse = await archiveObject(base64, note);
        
        // Instead of saving immediately, go to Ritual View
        setPendingAnalysis({
          ...analysis,
          imageUri: base64,
          userNote: note
        });
        setView(AppView.RITUAL);
      };
    } catch (e) {
      console.error("Error archiving", e);
      setView(AppView.HOME);
      alert("连接整理师失败，请重试。");
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
        userNote: pendingAnalysis.userNote
      };

      saveItem(newItem);
      setSelectedItem(newItem);
      // Optional: Add a success flash or sound here
      setView(AppView.DETAIL);
      setPendingAnalysis(null);
    }
  };

  const handleItemClick = (item: ArchivedItem) => {
    setSelectedItem(item);
    setView(AppView.DETAIL);
  };

  const handleDelete = (id: string) => {
    if(confirm("确定要删除这条记忆吗？一旦删除，就真的什么都不留下了。")) {
      deleteItem(id);
      setView(AppView.GALLERY);
    }
  };
  
  const handleSeedData = () => {
    seedDatabase();
    // Refresh items
    const newItems = getItems();
    setItems(newItems);
    setView(AppView.GALLERY);
  };

  // View Router
  const renderView = () => {
    switch(view) {
      case AppView.HOME:
        return <HomeView onStartDeclutter={() => setView(AppView.SCAN)} onSeedData={handleSeedData} />;
      case AppView.SCAN:
        return <ScanView onImageCaptured={handleArchiveStart} onCancel={() => setView(AppView.HOME)} />;
      case AppView.ANALYZING:
        return <AnalyzingView />;
      case AppView.RITUAL:
        return pendingAnalysis ? (
          <RitualView 
            item={pendingAnalysis} 
            onComplete={handleRitualComplete} 
            onCancel={() => setView(AppView.HOME)} 
          />
        ) : null;
      case AppView.GALLERY:
        return <GalleryView items={items} onItemClick={handleItemClick} />;
      case AppView.DETAIL:
        return selectedItem ? (
          <DetailView 
            item={selectedItem} 
            onBack={() => setView(AppView.GALLERY)} 
            onDelete={handleDelete} 
          />
        ) : <GalleryView items={items} onItemClick={handleItemClick} />;
      default:
        return <HomeView onStartDeclutter={() => setView(AppView.SCAN)} onSeedData={handleSeedData} />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#fdfbf7] font-sans text-stone-900">
      {renderView()}
      
      {/* Hide navbar on Scan, Analyzing, Ritual and Detail views for immersion */}
      {(view === AppView.HOME || view === AppView.GALLERY) && (
        <NavBar currentView={view} setView={setView} />
      )}
    </div>
  );
}