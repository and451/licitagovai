/// <reference types="node" />
import { GoogleGenAI } from "@google/genai";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API Key not configured on server." });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1" } });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: prompt,
    });
    return res.json({ text: response.text });
  } catch (error: unknown) {
    console.error("Gemini Document Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to generate document";
    return res.status(500).json({ error: msg });
  }
}
