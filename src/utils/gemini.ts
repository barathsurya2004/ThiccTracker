import { GoogleGenAI } from "@google/genai";
import type { WorkoutDay } from "../context/AppContext";

const SYSTEM = `You are an expert fitness coach. Output ONLY a valid JSON object — no markdown, no explanation.

Schema:
{
  "name": "Plan name",
  "days": [
    {
      "name": "Day label",
      "modality": "lifting|pool|calisthenics|rest",
      "exercises": [
        { "name": "Exercise name", "sets": 3, "reps": "8-10", "rest": 90 }
      ]
    }
  ]
}

Rules:
- Rest days must have modality "rest" and an empty exercises array
- rest is in seconds (e.g. 90)
- reps can be a range "6-8" or fixed "5"
- Include a full rest day at the end of each week`;

export type GenerateResult =
  | { ok: true; plan: { name: string; days: WorkoutDay[] } }
  | { ok: false; error: string };

export async function generatePlan(prompt: string): Promise<GenerateResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  if (!apiKey) {
    return {
      ok: false,
      error:
        "No Gemini API key found. Add VITE_GEMINI_API_KEY to your .env file.",
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const userRequest = prompt.trim() || "A balanced weekly workout plan with rest days";

    const response = await ai.models.generateContentStream({
      model: "gemini-flash-lite-latest",
      config: {
        thinkingConfig: {
          thinkingBudget: 1024,
        },
        systemInstruction: SYSTEM,
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${userRequest}\n\nReturn the JSON object now.`,
            },
          ],
        },
      ],
    });

    let fullText = "";
    for await (const chunk of response) {
      if (chunk.text) fullText += chunk.text;
    }

    const match = fullText.match(/\{[\s\S]*\}/);
    if (!match)
      return {
        ok: false,
        error: "AI returned an unexpected format. Try again.",
      };

    const data = JSON.parse(match[0]) as { name?: string; days?: unknown[] };
    if (!Array.isArray(data.days) || data.days.length === 0) {
      return {
        ok: false,
        error: "AI returned an invalid plan structure. Try a different prompt.",
      };
    }

    const cleaned: WorkoutDay[] = (data.days as Record<string, unknown>[]).map(
      (d) => ({
        name: String(d.name || "Day"),
        modality: (
          ["lifting", "pool", "calisthenics", "rest"] as const
        ).includes(d.modality as WorkoutDay["modality"])
          ? (d.modality as WorkoutDay["modality"])
          : "lifting",
        exercises: Array.isArray(d.exercises)
          ? (d.exercises as Record<string, unknown>[]).map((e) => ({
              name: String(e.name || "Exercise"),
              sets: Math.max(1, Number(e.sets) || 3),
              reps: String(e.reps || "8-10"),
              rest: Math.max(0, Number(e.rest) || 90),
            }))
          : [],
      }),
    );

    return {
      ok: true,
      plan: { name: String(data.name || "My Plan"), days: cleaned },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("API_KEY") || msg.includes("403")) {
      return {
        ok: false,
        error: "Invalid Gemini API key. Check your .env file.",
      };
    }
    if (msg.includes("quota") || msg.includes("429")) {
      return {
        ok: false,
        error: "API rate limit hit. Wait a moment and try again.",
      };
    }
    if (msg.includes("network") || msg.includes("fetch")) {
      return {
        ok: false,
        error: "Network error. Check your connection and try again.",
      };
    }
    return { ok: false, error: `AI generation failed: ${msg}` };
  }
}
