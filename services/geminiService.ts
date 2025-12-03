import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

// Only initialize if key exists, otherwise keep it undefined
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateWritingAssistance = async (
  prompt: string,
  currentText: string,
  taskType: string
): Promise<string> => {
  // Check if API Key is missing
  if (!apiKey || !ai) {
    console.warn("Gemini API Key is missing. AI features are disabled.");
    
    // Return mock responses so the app doesn't crash
    if (taskType === 'ideas') {
      return `[ডেমো মোড: API Key নেই]\n\n১. ${prompt} নিয়ে একটি ছোটগল্প লিখুন।\n২. এটি নিয়ে একটি স্মৃতিচারণমূলক প্রবন্ধ লিখুন।\n৩. চরিত্রের মনস্তাত্ত্বিক বিশ্লেষণ করুন।`;
    }
    
    return "[অটো-রেসপন্স]: বর্তমানে এআই অ্যাসিস্ট্যান্ট সুবিধাটি বন্ধ আছে কারণ কোনো API Key কনফিগার করা হয়নি। আপনি নিজেই লেখাটি চালিয়ে যান।";
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
    case 'tone_formal':
      fullPrompt = `Rewrite the following text in a formal, professional, and sophisticated tone:\n\n${currentText}`;
      break;
    case 'tone_casual':
      fullPrompt = `Rewrite the following text in a casual, conversational, and friendly tone:\n\n${currentText}`;
      break;
    case 'tone_literary':
      fullPrompt = `Rewrite the following text in a highly literary, poetic, and artistic tone suitable for high-quality literature:\n\n${currentText}`;
      break;
    case 'style_concise':
      fullPrompt = `Rewrite the following text to be more concise, removing unnecessary words while keeping the core message:\n\n${currentText}`;
      break;
    case 'style_descriptive':
      fullPrompt = `Rewrite the following text to be more descriptive, adding vivid imagery, sensory details, and metaphors:\n\n${currentText}`;
      break;
    case 'genre_mystery':
      fullPrompt = `Rewrite or enhance the following text to fit the Mystery/Thriller genre. Add suspense, intrigue, and atmospheric tension:\n\n${currentText}`;
      break;
    case 'genre_romance':
      fullPrompt = `Rewrite or enhance the following text to fit the Romance genre. Focus on deep emotions, sensory details, and intimacy:\n\n${currentText}`;
      break;
    case 'genre_horror':
      fullPrompt = `Rewrite or enhance the following text to fit the Horror genre. Build a sense of dread, use unsettling imagery, and fear:\n\n${currentText}`;
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
    return "এআই সেবা সংযোগে সমস্যা হচ্ছে অথবা কোটা শেষ হয়ে গেছে।";
  }
};
