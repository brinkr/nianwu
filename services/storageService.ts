import { ArchivedItem, UserStats } from '../types';

const STORAGE_KEY = 'digital_keep_items_v2';

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
      title: '六弦之夏',
      description: '琴颈微微变形，品丝磨损。它见证了大学时代草坪上的笨拙弹唱，也陪伴了无数个失眠的夜晚。上面的贴纸已经斑驳，那是属于那个夏天的印记。',
      farewellMessage: '主人，谢谢你曾用指尖赋予我生命。那些笨拙的和弦是我们共同的青春。我不遗憾被放下，因为音乐已经留在了你的身体里。',
      sentiment: '青春回响',
      category: '乐器',
      dateArchived: now - 86400000 * 2,
      mode: 'sentiment',
      userNote: '大学时买的第一把吉他。'
    },
    {
      id: 'demo-archive-1',
      imageUri: 'https://images.unsplash.com/photo-1585255318859-f5c15f4cffe9?q=80&w=800&auto=format&fit=crop',
      title: '过期票据 No.0921',
      description: '三年前的差旅报销凭证，纸张已氧化发黄，字迹模糊。经核查，相关财务流程已于2021年结案，该实体凭证无留存法律效力。',
      farewellMessage: '经系统核算，该凭证所载信息已完成数字化备份。物理载体已无留存必要。建议执行销毁，释放物理存储空间 0.01cm³。',
      sentiment: '准予丢弃',
      category: '票据',
      dateArchived: now - 86400000 * 3,
      mode: 'utility'
    },
    {
      id: 'demo-3',
      imageUri: 'https://images.unsplash.com/photo-1550966871-3ed3c47e7490?q=80&w=800&auto=format&fit=crop',
      title: '十四行诗',
      description: '书页已经发脆，边缘卷起。这是你中学时最爱读的诗集，里面夹着一片枯萎的银杏叶。它曾是你逃离繁重课业的秘密花园。',
      farewellMessage: '文字的灵魂已经住进了你的心里，载体便不再重要。当你在生活中偶然念起一句诗，那就是我存在的证明。',
      sentiment: '静谧时光',
      category: '书籍',
      dateArchived: now - 86400000 * 10,
      mode: 'sentiment'
    },
    {
      id: 'demo-archive-2',
      imageUri: 'https://images.unsplash.com/photo-1591193686104-fddba4d0e4d8?q=80&w=800&auto=format&fit=crop',
      title: '废旧连接线 Type-A',
      description: '外层橡胶老化发粘，接口处金属触点氧化。经测试，传输效率低于标准值 40%，且存在短路风险。',
      farewellMessage: '设备检测结果：功能失效。继续保留存在安全隐患。请将其放入电子垃圾回收箱。此操作符合安全用电规范。',
      sentiment: '无价值',
      category: '数码',
      dateArchived: now - 86400000 * 12,
      mode: 'utility'
    },
    {
      id: 'demo-5',
      imageUri: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800&auto=format&fit=crop',
      title: '守夜人',
      description: '这盏台灯的灯罩已经褪色，开关偶尔接触不良。它曾用暖黄的光晕守护你熬夜复习的背影，也照亮过你写给初恋的信。',
      farewellMessage: '我见证了你所有的努力与孤独。现在，你心里的光已经足够明亮，不再需要我这微弱的灯火了。',
      sentiment: '温暖守护',
      category: '家居',
      dateArchived: now - 86400000 * 30,
      mode: 'sentiment'
    }
  ];

  const newItems = demoItems.filter(item => !existingIds.has(item.id));
  
  if (newItems.length > 0) {
    const updated = [...newItems, ...currentItems];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};