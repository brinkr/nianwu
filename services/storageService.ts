import { ArchivedItem, UserStats } from '../types';

const STORAGE_KEY = 'digital_keep_items_v1';

export const getItems = (): ArchivedItem[] => {
  try {
    const items = localStorage.getItem(STORAGE_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error("Failed to load items", error);
    return [];
  }
};

export const saveItem = (item: ArchivedItem): void => {
  const currentItems = getItems();
  const newItems = [item, ...currentItems];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
};

export const deleteItem = (id: string): void => {
  const currentItems = getItems();
  const newItems = currentItems.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
};

export const getUserStats = (): UserStats => {
  const items = getItems();
  const count = items.length;
  
  // Simple Gamification / Level logic
  const levels = [
    { threshold: 0, title: "初舍" },
    { threshold: 5, title: "离尘" },
    { threshold: 15, title: "净心" },
    { threshold: 30, title: "空寂" },
    { threshold: 50, title: "无物" },
    { threshold: 100, title: "自在" }
  ];

  let currentLevel = levels[0];
  let nextThreshold = levels[1].threshold;

  for (let i = 0; i < levels.length; i++) {
    if (count >= levels[i].threshold) {
      currentLevel = levels[i];
      nextThreshold = levels[i+1] ? levels[i+1].threshold : 999;
    }
  }

  const progress = Math.min(100, Math.floor(((count - currentLevel.threshold) / (nextThreshold - currentLevel.threshold)) * 100));

  return {
    levelTitle: currentLevel.title,
    levelProgress: nextThreshold === 999 ? 100 : progress,
    totalReleased: count,
    nextLevelThreshold: nextThreshold
  };
};

export const seedDatabase = (): void => {
  const currentItems = getItems();
  const existingIds = new Set(currentItems.map(i => i.id));
  const now = Date.now();

  const demoItems: ArchivedItem[] = [
    {
      id: 'demo-1',
      imageUri: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=800&auto=format&fit=crop',
      title: '沉默的六弦琴',
      description: '这把吉他琴颈已经微微变形，品丝也磨损了。它见证了大学时代草坪上的笨拙弹唱，也陪伴了无数个失眠的夜晚。上面的贴纸已经斑驳，那是属于那个夏天的印记。',
      farewellMessage: '主人，谢谢你曾用指尖赋予我生命。那些笨拙的和弦是我们共同的青春。我不遗憾被放下，因为音乐已经留在了你的身体里。轻装上阵吧，去演奏更精彩的人生。',
      sentiment: '青春回响',
      category: '乐器',
      dateArchived: now - 86400000 * 2, // 2 days ago
      userNote: '大学时买的第一把吉他，好久没弹了，搬家带着太麻烦。'
    },
    {
      id: 'demo-2',
      imageUri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
      title: '远行者',
      description: '鞋底磨平了花纹，红色的鞋面也有些泛黄。它陪你走过毕业旅行的泥泞，也跑过第一次马拉松的终点。每一道褶皱里都藏着一段路途。',
      farewellMessage: '嘿，伙计。我们一起丈量过世界的宽广，真的很过瘾。我的旅途到此为止了，但你的路还在延伸。别回头，跑下去。',
      sentiment: '脚踏实地',
      category: '衣物',
      dateArchived: now - 86400000 * 5, // 5 days ago
    },
    {
      id: 'demo-3',
      imageUri: 'https://images.unsplash.com/photo-1550966871-3ed3c47e7490?q=80&w=800&auto=format&fit=crop',
      title: '泛黄的诗集',
      description: '书页已经发脆，边缘卷起。这是你中学时最爱读的诗集，里面夹着一片枯萎的银杏叶。它曾是你逃离繁重课业的秘密花园。',
      farewellMessage: '文字的灵魂已经住进了你的心里，载体便不再重要。当你在生活中偶然念起一句诗，那就是我存在的证明。',
      sentiment: '静谧时光',
      category: '书籍',
      dateArchived: now - 86400000 * 10, // 10 days ago
    },
    {
      id: 'demo-4',
      imageUri: 'https://images.unsplash.com/photo-1512418490979-92798cec1380?q=80&w=800&auto=format&fit=crop',
      title: '红色闪电',
      description: '这辆缺了一个轮子的玩具赛车，曾是你童年最快的“座驾”。漆面剥落露出了金属底色，却依然有着一种倔强的速度感。',
      farewellMessage: '现在的你已经可以驾驶真正的车去任何地方了。我会在赛道的终点为你欢呼，永远做那个相信你是第一名的朋友。',
      sentiment: '童心未泯',
      category: '玩具',
      dateArchived: now - 86400000 * 15,
    },
    {
      id: 'demo-5',
      imageUri: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800&auto=format&fit=crop',
      title: '旧时灯盏',
      description: '这盏台灯的灯罩已经褪色，开关偶尔接触不良。它曾用暖黄的光晕守护你熬夜复习的背影，也照亮过你写给初恋的信。',
      farewellMessage: '我见证了你所有的努力与孤独。现在，你心里的光已经足够明亮，不再需要我这微弱的灯火了。',
      sentiment: '温暖守护',
      category: '家居',
      dateArchived: now - 86400000 * 30,
    }
  ];

  const newItems = demoItems.filter(item => !existingIds.has(item.id));
  
  if (newItems.length > 0) {
    const updated = [...newItems, ...currentItems];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};