
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateIcon(prompt: string, stylePrompt: string): Promise<string> {
    try {
      // Aggressive anti-text prompt engineering
      const noTextConstraint = "STRICTLY NO TEXT. NO LETTERS. NO WORDS. NO TYPOGRAPHY. NO CHARACTERS. NO NUMBERS. ABSOLUTELY NO WRITING OR CAPTIONS.";
      const qualityConstraint = "Professional digital asset, high-end design, centered, isolated on plain white background, sharp edges, 8k resolution, masterpiece quality.";
      
      const fullPrompt = `${noTextConstraint} A professional icon of ${prompt}. ${stylePrompt}. ${qualityConstraint} ZERO TEXT ALLOWED.`;

      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [{ text: fullPrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      // Find the image part in candidates
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }

      throw new Error("No image data found in response");
    } catch (error) {
      console.error("Gemini Image Generation Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
