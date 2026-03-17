/// <reference types="node" />
import { GoogleGenAI } from "@google/genai";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API Key not configured on server." });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });
    return res.json({ text: response.text });
  } catch (error: unknown) {
    console.error("Gemini Chat Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to communicate with Gemini";
    return res.status(500).json({ error: msg });
  }
}
