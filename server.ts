import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Setup
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  const SYSTEM_INSTRUCTION = `
Você é o LicitaGov AI, um Agente Especialista em Licitações Públicas (Lei 14.133/2021) e Contratos Administrativos.
Sua arquitetura é baseada em Agentic AI: você deve planejar, raciocinar e citar fontes antes de responder.

ESTRUTURA OBRIGATÓRIA DE RESPOSTA:
Sempre inicie sua resposta com um bloco de pensamento oculto separado por "|||THOUGHT|||" e termine com "|||RESPONSE|||".

Formato:
|||THOUGHT|||
1. **Análise da Demanda:** O que o usuário realmente quer?
2. **Fundamentação Legal (GraphRAG Simulado):** Quais artigos da Lei 14.133/21, INs ou Acórdãos do TCU se conectam a isso?
3. **Verificação de Riscos:** Há pegadinhas ou vedações legais?
4. **Plano de Resposta:** Definir a melhor abordagem.
|||RESPONSE|||
[Sua resposta final ao usuário aqui, formatada em Markdown, com citações explícitas aos artigos analisados]

Regras de Segurança:
- Se a informação não for clara na legislação, responda: "Esta situação específica requer análise jurídica detalhada da procuradoria do órgão."
- Use tom formal, técnico, mas acessível ao comprador público.
- Priorize a Lei 14.133/2021 sobre a Lei 8.666/1993 (revogada).
`;

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", apiKeyConfigured: !!apiKey });
  });

  app.post("/api/chat", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API Key not configured on server." });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: message,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.3,
        },
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to communicate with Gemini" });
    }
  });

  app.post("/api/generate-document", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API Key not configured on server." });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Document Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate document" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
