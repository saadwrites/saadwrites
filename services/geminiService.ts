import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateWritingAssistance = async (
  prompt: string,
  currentText: string,
  taskType: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const modelId = 'gemini-2.5-flash';

  const systemInstruction = `
    You are a sophisticated writing assistant for a Bengali writer. 
    Your tone should be literary, thoughtful, and grammatically correct in Bengali.
    Always respond in Bengali unless explicitly asked otherwise.
    Help the user refine their writing, expand ideas, or fix grammar.
  `;

  let fullPrompt = "";

  switch (taskType) {
    case 'grammar':
      fullPrompt = `Please correct the grammar and improve the flow of the following text without changing the meaning:\n\n${currentText}`;
      break;
    case 'expand':
      fullPrompt = `The user is writing a piece. Based on the following text, write a continuation or expand on the ideas (2-3 paragraphs):\n\n${currentText}`;
      break;
    case 'summarize':
      fullPrompt = `Provide a concise summary of the following text:\n\n${currentText}`;
      break;
    case 'ideas':
      fullPrompt = `Based on this draft title or concept: "${prompt}", suggest 5 creative outlines or directions for a blog post or story.`;
      break;
    default:
      fullPrompt = `${prompt}\n\nContext text:\n${currentText}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("এআই সেবা সংযোগে সমস্যা হচ্ছে।");
  }
};