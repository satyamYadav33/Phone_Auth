
import { GoogleGenAI } from "@google/genai";
import { Activity } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSecurityInsight = async (isNewUser: boolean, name: string, activity: Activity[], twoFactorEnabled: boolean) => {
  try {
    const activitySummary = activity.slice(0, 3).map(a => `${a.type} at ${new Date(a.timestamp).toLocaleTimeString()}`).join(', ');
    
    const prompt = `
      The user is ${name}. 
      Status: ${isNewUser ? 'New User' : 'Returning User'}. 
      2FA Enabled: ${twoFactorEnabled}.
      Recent Activity: [${activitySummary}].

      Provide a natural, 2-sentence greeting. 
      Incorporate their name naturally.
      Provide one proactive security tip based on their status. 
      If 2FA is off, suggest enabling it. If they just logged in, mention safe session management.
      Tone: Professional, helpful, high-tech assistant.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 120,
        temperature: 0.8,
      }
    });

    return response.text?.trim() || "Hi " + name + "! Your account is currently protected. Consider enabling 2FA for maximum security.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Hi " + name + "! We've verified your device. Keep your OTP codes private to stay secure.";
  }
};
