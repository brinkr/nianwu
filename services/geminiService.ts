import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeminiResponse, ArchiveMode } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "物品名称",
    },
    description: {
      type: Type.STRING,
      description: "物品描述",
    },
    farewellMessage: {
      type: Type.STRING,
      description: "告别信或处置回执",
    },
    sentiment: {
      type: Type.STRING,
      description: "情感关键词或归档状态",
    },
    category: {
      type: Type.STRING,
      description: "分类",
    },
  },
  required: ["title", "description", "farewellMessage", "sentiment", "category"],
};

export const archiveObject = async (base64Image: string, note: string, mode: ArchiveMode): Promise<GeminiResponse> => {
  try {
    let systemInstruction = "";
    
    if (mode === 'sentiment') {
      systemInstruction = `
        你是一位拥有“通灵”能力的物品整理师。
        用户拍了一张想要丢弃但情感上舍不得的物品照片。
        用户的备注是：“${note}”。
        
        请以**物品的第一人称口吻**生成内容：
        1. title: 给它起一个雅致、有文学性的名字（不超过10字）。
        2. description: 描述它的外观细节以及它陪伴主人的时光，语气温暖、怀旧。
        3. farewellMessage: **这是核心**。以"我"的角度给主人写一封简短的告别信。感谢主人的照顾，告诉主人自己已经完成了使命，数字化是最好的归宿，劝慰主人放下。
        4. sentiment: 一个四字唯美词汇，概括这段回忆（如：青春回响、静谧时光）。
        5. category: 物品分类。
      `;
    } else {
      systemInstruction = `
        你是一位严谨、冷静的皇家档案馆管理员。
        用户需要对一件无用物品进行“销毁归档”记录，以缓解强迫症带来的“怕丢错”焦虑。
        用户的备注是：“${note}”。

        请以**第三人称客观口吻**生成内容（风格类似老式档案卡片）：
        1. title: 物品的规范名称（冷静、准确）。
        2. description: 简述物品的物理状态（如：已过期、破损、闲置过久）。
        3. farewellMessage: 一份“处置回执”。说明该物品已无使用价值，建议立即执行物理丢弃，并未对未来造成任何负面影响。语气要绝对笃定，给予用户安全感。
        4. sentiment: 状态标签（只能从以下选择：已审阅、准予丢弃、无价值、过期）。
        5. category: 物品分类。
      `;
    }

    const prompt = `请根据上述设定分析图片并返回JSON数据。确保所有输出为中文。`;

    // Strip header if present
    const cleanBase64 = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: prompt + "\n" + systemInstruction }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: mode === 'sentiment' ? 0.7 : 0.2, // Creative vs Deterministic
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const result = JSON.parse(jsonText) as GeminiResponse;
    // Inject the mode back into the response so the UI knows how to render it
    return { ...result, mode };

  } catch (error) {
    console.error("Gemini Archival Failed:", error);
    // Fallback
    return {
      title: mode === 'sentiment' ? "旧日时光" : "未知物品",
      description: mode === 'sentiment' ? "记忆读取失败，但光影已留存。" : "数据解析中断，建议手动归档。",
      farewellMessage: mode === 'sentiment' ? "谢谢你，再见。" : "已记录在案，准予丢弃。",
      sentiment: mode === 'sentiment' ? "岁月静好" : "待处理",
      category: "杂物",
      mode: mode
    };
  }
};