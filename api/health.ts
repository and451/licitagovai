/// <reference types="node" />

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function handler(_req: any, res: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  res.json({ status: "ok", apiKeyConfigured: !!apiKey });
}
