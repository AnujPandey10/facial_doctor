import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { AnalysisResponse, AnalysisResponseSchema, SkinIssue } from '../types/schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ANALYSIS_PROMPT = `You are an expert cosmetic skin analyst. Analyze the provided facial image and identify common cosmetic skin concerns.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks.

Analyze for these common issues:
- Acne & breakouts (including blackheads, whiteheads, inflammatory acne)
- Dark spots & hyperpigmentation
- Fine lines & wrinkles
- Uneven skin tone
- Redness & rosacea
- Enlarged pores
- Dryness & dehydration
- Dullness & lack of radiance
- Under-eye concerns (dark circles, puffiness)

For each detected issue, provide:
1. issue_id: unique identifier (use format: issue_<number>)
2. issue_name: specific name of the concern
3. confidence: 0.0 to 1.0 (your confidence in this detection)
4. severity: "mild", "moderate", or "severe"
5. description: brief description of what you observe
6. affected_areas: array of face areas (e.g., ["forehead", "cheeks", "nose", "chin", "around_eyes"])
7. tags: relevant tags for product matching (e.g., ["acne", "oily_skin", "inflammation"] or ["hyperpigmentation", "brightening", "vitamin_c"])

Also provide:
- analysis_id: use UUID format
- timestamp: current ISO timestamp
- skin_tone: estimate (e.g., "fair", "light", "medium", "tan", "deep")
- overall_assessment: 2-3 sentence summary

Return the response in this exact JSON structure:
{
  "analysis_id": "uuid-here",
  "timestamp": "2024-01-01T00:00:00Z",
  "skin_tone": "medium",
  "overall_assessment": "Brief overall summary here",
  "detected_issues": [
    {
      "issue_id": "issue_1",
      "issue_name": "Issue Name",
      "confidence": 0.85,
      "severity": "moderate",
      "description": "Description here",
      "affected_areas": ["area1", "area2"],
      "tags": ["tag1", "tag2"]
    }
  ]
}

Be professional, non-alarmist, and focus on cosmetic concerns only. Do not provide medical diagnoses.`;

export async function analyzeImageWithLLM(imageBase64: string): Promise<AnalysisResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.LLM_MODEL || 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: ANALYSIS_PROMPT
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.3 // Lower temperature for more consistent output
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from LLM');
    }

    // Clean up response (remove markdown code blocks if present)
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const parsedResponse = JSON.parse(cleanedContent);
    
    // Validate and parse with fallbacks
    const validatedResponse = parseWithFallbacks(parsedResponse);
    
    return validatedResponse;
  } catch (error) {
    console.error('LLM Analysis Error:', error);
    throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseWithFallbacks(data: any): AnalysisResponse {
  try {
    // Try strict validation first
    return AnalysisResponseSchema.parse(data);
  } catch (error) {
    console.warn('Strict validation failed, applying fallbacks');
    
    // Apply fallbacks for missing fields
    const fallbackData = {
      analysis_id: data.analysis_id || uuidv4(),
      timestamp: data.timestamp || new Date().toISOString(),
      skin_tone: data.skin_tone || 'unknown',
      overall_assessment: data.overall_assessment || 'Analysis completed',
      detected_issues: (data.detected_issues || []).map((issue: any, index: number) => ({
        issue_id: issue.issue_id || `issue_${index + 1}`,
        issue_name: issue.issue_name || 'Unknown Issue',
        confidence: typeof issue.confidence === 'number' ? Math.min(Math.max(issue.confidence, 0), 1) : 0.5,
        severity: ['mild', 'moderate', 'severe'].includes(issue.severity) ? issue.severity : 'moderate',
        description: issue.description || 'No description provided',
        affected_areas: Array.isArray(issue.affected_areas) ? issue.affected_areas : ['face'],
        bounding_boxes: issue.bounding_boxes || undefined,
        tags: Array.isArray(issue.tags) ? issue.tags : []
      })),
      heatmap_url: data.heatmap_url || undefined,
      recommendations_summary: data.recommendations_summary || undefined
    };
    
    // Validate again with fallbacks
    return AnalysisResponseSchema.parse(fallbackData);
  }
}

export async function generateProductSummary(
  productName: string,
  keyActives: string[],
  issue: SkinIssue
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a skincare expert. Generate brief, evidence-focused product recommendations.'
        },
        {
          role: 'user',
          content: `Generate a 2-3 sentence explanation of why "${productName}" with active ingredients [${keyActives.join(', ')}] is suitable for treating "${issue.issue_name}". Keep it professional and evidence-focused.`
        }
      ],
      max_tokens: 150,
      temperature: 0.5
    });

    return response.choices[0]?.message?.content || 'This product may help address your skin concern.';
  } catch (error) {
    console.error('Error generating product summary:', error);
    return `${productName} contains ${keyActives.join(', ')} which may help address ${issue.issue_name.toLowerCase()}.`;
  }
}

