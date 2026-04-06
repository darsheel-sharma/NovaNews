"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function generateSummary(
  title: string | null,
  description: string | null,
  content: string | null,
) {
  try {
    const prompt = `
      Write a concise, exactly 2-sentence summary of the following news article.
      
      Title: ${title || "N/A"}
      Description: ${description || "N/A"}
      Content: ${content || "N/A"}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return { success: true, summary: response.text };
  } catch (err) {
    console.error("Gemini API Error:", err);
    return { success: false, error: "Failed to generate AI summary." };
  }
}
