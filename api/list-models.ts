/// <reference types="node" />

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(_req: any, res: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();
    const models = (data.models ?? []).map((m: any) => m.name);
    return res.json({ models });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: msg });
  }
}
