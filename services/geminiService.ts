
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
    estimatedVolume: {
      type: Type.NUMBER,
      description: "估算物品的物理体积（单位：立方米），仅数字",
    }
  },
  required: ["title", "description", "farewellMessage", "sentiment", "category", "estimatedVolume"],
};

export const archiveObject = async (base64Images: string[], note: string, mode: ArchiveMode, nickname: string): Promise<GeminiResponse> => {
  try {
    let systemInstruction = "";
    
    if (mode === 'sentiment') {
      systemInstruction = `
        你是一位拥有“通灵”能力的物品整理师。
        用户拍了这件物品的${base64Images.length}张照片，想要丢弃但情感上舍不得。
        请结合所有照片的视觉信息（全貌、细节、瑕疵等）进行分析。
        用户的备注是：“${note}”。
        用户的昵称/称呼是：“${nickname}”。
        
        请以**物品的第一人称口吻**生成内容：
        1. title: 给它起一个雅致、有文学性的名字（不超过10字）。
        2. description: 描述它的外观细节（结合图片中的磨损、使用痕迹）以及它陪伴主人的时光，语气温暖、怀旧。
        3. farewellMessage: **这是核心**。以"我"的角度给${nickname}写一封简短的告别信。在信中请称呼用户为"${nickname}"。感谢${nickname}的照顾，告诉${nickname}自己已经完成了使命，数字化是最好的归宿，劝慰${nickname}放下。
        4. sentiment: 一个四字唯美词汇，概括这段回忆（如：青春回响、静谧时光）。
        5. category: 物品分类。
        6. estimatedVolume: 粗略估算该物品的物理空间体积（m³）。
      `;
    } else {
      systemInstruction = `
        你是一位严谨、冷静的皇家档案馆管理员。
        用户提供了一组物品照片，需要对这件无用物品进行“销毁归档”记录。
        用户的备注是：“${note}”。
        用户的昵称/称呼是：“${nickname}”。

        请以**第三人称客观口吻**生成内容（风格类似老式档案卡片）：
        1. title: 物品的规范名称（冷静、准确）。
        2. description: 简述物品的物理状态（如：已过期、破损、闲置过久）。结合所有图片判断。
        3. farewellMessage: 一份“处置回执”。说明该物品已无使用价值，建议立即执行物理丢弃，并未对未来造成任何负面影响。语气要绝对笃定，给予用户安全感。
        4. sentiment: 状态标签（只能从以下选择：已审阅、准予丢弃、无价值、过期）。
        5. category: 物品分类。
        6. estimatedVolume: 粗略估算该物品的物理空间体积（m³）。
      `;
    }

    const prompt = `请根据提供的${base64Images.length}张图片分析并返回JSON数据。确保所有输出为中文。`;

    // Construct parts: images then text
    const parts = [
      ...base64Images.map(img => {
        // Strip header if present
        const cleanBase64 = img.includes('base64,') ? img.split('base64,')[1] : img;
        return { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } };
      }),
      { text: prompt + "\n" + systemInstruction }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: mode === 'sentiment' ? 0.7 : 0.2,
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const result = JSON.parse(jsonText) as GeminiResponse;
    return { ...result, mode };

  } catch (error) {
    console.error("Gemini Archival Failed:", error);
    // Fallback
    return {
      title: mode === 'sentiment' ? "旧日时光" : "未知物品",
      description: mode === 'sentiment' ? "记忆读取失败，但光影已留存。" : "数据解析中断，建议手动归档。",
      farewellMessage: mode === 'sentiment' ? `谢谢你，${nickname}，再见。` : "已记录在案，准予丢弃。",
      sentiment: mode === 'sentiment' ? "岁月静好" : "待处理",
      category: "杂物",
      estimatedVolume: 0.01,
      mode: mode
    };
  }
};
