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

export async function analyzeListingImage(imageUrl: string): Promise<AnalyzeImageResult> {
  if (!process.env.GEMINI_API_KEY && !process.env.AI_ASSIST_API_KEY) {
    throw new Error('AI vision service is not configured');
  }

  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const base64Image = imageBuffer.toString('base64');

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_PROMPT },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    if (!text) {
      throw new Error('Empty response from AI model');
    }

    const parsed = AnalysisSchema.parse(JSON.parse(text));
    return parsed;
  } catch (error) {
    console.error('AI vision analysis failed:', error);
    throw error;
  }
}
