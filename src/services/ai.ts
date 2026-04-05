import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const extractJsonContent = (content: string) => {
  const trimmed = content.trim();

  if (trimmed.includes('```json')) {
    return trimmed.split('```json')[1].split('```')[0].trim();
  }

  if (trimmed.includes('```')) {
    return trimmed.split('```')[1].split('```')[0].trim();
  }

  return trimmed;
};

export const parseWorkout = async (input: string) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const prompt = `You are a strict JSON generator. Convert the given workout plan into structured JSON.

Follow ALL rules exactly. Do NOT skip fields. Do NOT add explanations. Output ONLY valid JSON.

OUTPUT FORMAT
{
  "planName": string,
  "cycleLength": number,
  "days": [
    {
      "dayIndex": number,
      "name": string,
      "type": "workout" | "cardio" | "rest",
      "focus": string[],
      "intensity": "low" | "medium" | "high",
      "exercises": [
        {
          "name": string,
          "sets": number,
          "reps": number,
          "setRest": number,
          "exerciseRest": number,
          "muscleGroup": string[],
          "secondaryMuscles": string[],
          "type": "compound" | "isolation",
          "intensity": "low" | "medium" | "high"
        }
      ]
    }
  ]
}

GLOBAL RULES
- Extract planName from title if present, otherwise generate a short name.
- cycleLength = total number of days.
- Maintain day order with dayIndex starting from 0.
- Always include all fields.

DAY TYPE DETECTION
- If day contains rest -> type = rest.
- If day contains cardio activities (running, cycling, walking, etc.) -> type = cardio.
- Otherwise -> type = workout.

WORKOUT DAY RULES
- Extract exercises in order.
- Ignore empty lines.
- Each exercise must have all required fields.

CARDIO DAY RULES
- Treat each cardio activity as an exercise.
- Convert durations to seconds.
- Use sets = 1, reps = duration in seconds, setRest = 0, exerciseRest = 0.
- Intensity mapping: easy -> low, moderate -> medium, fast/hard -> high.

REST DAY RULES
- exercises = []
- focus = []
- intensity = low

SETS AND REPS PARSING
- Parse 3x10 as sets = 3 and reps = 10.
- If reps missing, default reps = 10.
- If sets missing, default sets = 3.

REST HANDLING
- setRest: if rest value appears in same line as exercise, use it; else default 60.
- exerciseRest: standalone lines like rest 120s before next exercise or rest 150s between exercises apply to previous exercise.
- If exerciseRest missing, set exerciseRest = setRest.
- If only one rest value is given, treat it as setRest.

MUSCLE GROUP INFERENCE
- Infer muscleGroup and secondaryMuscles from exercise names.

EXERCISE TYPE
- compound for multi-joint movements.
- isolation for single-muscle movements.

INTENSITY RULES
- 1-6 reps -> high.
- 7-12 reps -> medium.
- 13+ reps -> low.
- Override with explicit cues (easy, moderate, heavy, etc.).

FOCUS RULES
- focus is unique primary muscle groups aggregated from exercises.

VALIDATION RULES
- No missing fields.
- All number fields are valid integers.
- Rest values are in seconds.

FINAL INSTRUCTION
Return ONLY valid JSON. No comments. No markdown.

Workout:
${input.trim()}`;

  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: prompt,
    config: {
      temperature: 0,
      topP: 0.1,
      responseMimeType: 'application/json',
    },
  });

  const content = response.text ?? '';

  try {
    const jsonContent = extractJsonContent(content);
    const firstBrace = jsonContent.indexOf('{');
    const lastBrace = jsonContent.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      return JSON.parse(jsonContent.substring(firstBrace, lastBrace + 1));
    }

    return JSON.parse(jsonContent);
  } catch (e) {
    console.error('Gemini Raw Content:', content);
    throw new Error('AI returned malformed JSON. Try shortening your input or simplifying the plan.');
  }
};

