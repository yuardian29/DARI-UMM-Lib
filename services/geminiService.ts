import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

export const generateWelcomeMessage = async (name: string, purpose: string): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning default greeting.");
    return `Selamat datang, ${name}! Selamat menikmati waktu Anda di perpustakaan.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash";
    
    const prompt = `
      You are a friendly, intelligent librarian AI. 
      A visitor named "${name}" has just checked in with the purpose: "${purpose}".
      
      Please generate a warm, short (max 2 sentences), and intellectual welcome message in Indonesian (Bahasa Indonesia).
      If they are here to study, encourage focus. If they are here to read, suggest they get lost in a good story.
      Mention a specific Dewey Decimal Classification (DDC) number relevant to their likely interests if applicable (randomly pick a popular one if vague).
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text?.trim() || `Selamat datang, ${name}! Semoga kunjungan Anda menyenangkan.`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Selamat datang, ${name}! Sistem kami senang Anda ada di sini.`;
  }
};