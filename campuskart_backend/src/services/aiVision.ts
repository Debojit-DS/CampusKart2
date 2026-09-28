import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.AI_ASSIST_API_KEY || '' });

const AnalysisSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  suggestedPrice: z.number(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  categorySlug: z.string().min(1),
});

export type AnalyzeImageResult = z.infer<typeof AnalysisSchema>;

const SYSTEM_PROMPT = `You are an expert campus marketplace appraiser. Analyze the uploaded image of an item and return ONLY a strict JSON object with these exact fields:
- title: concise, highly searchable name of the item
- description: 2-3 sentences highlighting specs, features, or likely use case for a student
- suggestedPrice: estimated fair market value in INR for a college campus (number only, no currency symbol)
- condition: one of these exact values: NEW, LIKE_NEW, GOOD, FAIR, POOR
- categorySlug: one of these exact slugs: academic, hostel, electronics, cycles, stationery

Return ONLY valid JSON. No markdown, no extra text.`;

// List of fallback models if the primary model experiences high demand (503)
const GEMINI_MODELS = ['gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
  'gemini-3.1-flash-lite'];

/**
 * Executes a Gemini request with automatic retries for 503 high demand errors
 */
async function generateWithRetry(modelName: string, contents: any, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          responseMimeType: 'application/json',
        },
      });
    } catch (error: any) {
      const is503 = error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('high demand');
      
      if (is503 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.warn(`[AI Vision] ${modelName} hit 503 High Demand. Retrying in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Failed after retries on model ${modelName}`);
}

export async function analyzeListingImage(imageUrl: string): Promise<AnalyzeImageResult> {
  if (!process.env.GEMINI_API_KEY && !process.env.AI_ASSIST_API_KEY) {
    throw new Error('AI vision service is not configured');
  }

  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    // Dynamic mime type detection from image URL headers
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const base64Image = imageBuffer.toString('base64');

    const contents = [
      {
        role: 'user',
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
        ],
      },
    ];

    let response: any = null;
    let lastError: any = null;

    // Try primary model, then automatically switch to fallback models if 503 persists
    for (const modelName of GEMINI_MODELS) {
      try {
        response = await generateWithRetry(modelName, contents);
        if (response) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Vision] Model ${modelName} failed. Falling back to next model...`);
      }
    }

    if (!response) {
      throw lastError || new Error('All AI models failed to process the image.');
    }

    let text = response.text?.trim() || '';
    if (!text) {
      throw new Error('Empty response from AI model');
    }

    // Strip markdown wrappers if present
    text = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();

    const parsed = AnalysisSchema.parse(JSON.parse(text));
    return parsed;
  } catch (error) {
    console.error('AI vision analysis failed:', error);
    throw error;
  }
}