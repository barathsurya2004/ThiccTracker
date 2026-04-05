import axios from 'axios';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const parseWorkout = async (input: string) => {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ API Key is missing. Please add it to your .env file.');
  }

  const prompt = `Convert the following workout plan into structured JSON.

Requirements:
- Identify plan name and number of days (cycleLength)
- Split into days (Day 1, Day 2, etc.)
- For each day include:
  - name
  - dayIndex (starting from 0)
  - focus (main muscle groups as array)
  - intensity (low, medium, high)

- For each exercise include:
  - name
  - sets (number)
  - reps (number or string like "8-10" or "Failure")
  - rest (in seconds, default 60 if not specified)
  - muscleGroup (primary, as array)
  - secondaryMuscles (as array)
  - type (compound or isolation)
  - intensity (low, medium, high)

Rules:
- Infer missing data intelligently (especially muscle groups and types)
- Keep values consistent
- Return ONLY valid JSON (no explanation, no markdown blocks)

Workout:
${input}`;

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2, // Lower temperature for more consistent JSON
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  let content = response.data.choices[0].message.content;

  // Basic cleanup in case the AI returns markdown
  if (content.includes('```json')) {
    content = content.split('```json')[1].split('```')[0].trim();
  } else if (content.includes('```')) {
    content = content.split('```')[1].split('```')[0].trim();
  }

  return JSON.parse(content);
};
