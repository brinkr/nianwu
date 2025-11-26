import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeminiResponse } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "物品的名称，要雅致一些，不超过10个字。",
    },
    description: {
      type: Type.STRING,
      description: "关于这个物品的客观描述以及它可能承载的记忆，像博物馆的展品介绍一样，温暖而客观。",
    },
    farewellMessage: {
      type: Type.STRING,
      description: "以第一人称（物品的角度）写给主人的告别信。感谢主人的照顾，告诉主人自己已经完成了使命，现在很高兴被数字化保存，请主人放心放下实体。",
    },
    sentiment: {
      type: Type.STRING,
      description: "一个四字成语或短语，概括这个物品带来的感觉（例如：温暖如初、青春纪念、默默守护）。",
    },
    category: {
      type: Type.STRING,
      description: "物品类别（例如：衣物、数码、摆件、书籍、杂物）。",
    },
  },
  required: ["title", "description", "farewellMessage", "sentiment", "category"],
};

export const archiveObject = async (base64Image: string, userNote?: string): Promise<GeminiResponse> => {
  try {
    const prompt = `
      你是一位精通“断舍离”心理学的整理师，也是一位能够读取物品记忆的“灵媒”。
      用户拍了一张照片，想要丢弃这个物品，但心理上有负担。
      请通过你的回答，帮助用户完成一次“心理上的告别仪式”。

      请分析这张图片：
      ${userNote ? `用户对这个物品的备注是：“${userNote}”。请务必在生成的内容中融合这份情感。` : ''}

      请生成以下内容（返回JSON格式）：
      1. title: 给它起一个有尊严的名字。
      2. description: 描述它的外观和它可能经历过的时光。
      3. farewellMessage: **最重要的一点**。请以物品的口吻（"我"）给主人写一段话。感谢主人的使用，告诉主人不要内疚，数字化是永恒的归宿。语气要温柔、治愈、释然。
      4. sentiment: 提炼情感关键词。
      5. category: 分类。
      
      请确保所有输出都是**中文**。
    `;

    // Strip header if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, // Creativity for the farewell message
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const result = JSON.parse(jsonText) as GeminiResponse;
    return result;

  } catch (error) {
    console.error("Gemini Archival Failed:", error);
    // Fallback for demo stability
    return {
      title: "旧日时光",
      description: "这件物品陪伴了您走过一段旅程，如今它完成了使命，化作数据永存于此。",
      farewellMessage: "谢谢你曾如此珍惜我。虽然我的实体即将离去，但我们共同的记忆已经安全地保存在这里。请轻装前行吧。",
      sentiment: "岁月静好",
      category: "留念"
    };
  }
};