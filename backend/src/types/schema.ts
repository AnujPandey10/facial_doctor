import { z } from 'zod';

// Canonical schema for LLM response
export const SkinIssueSchema = z.object({
  issue_id: z.string(),
  issue_name: z.string(), // e.g., "Acne", "Dark Spots", "Fine Lines"
  confidence: z.number().min(0).max(1), // 0.0 to 1.0
  severity: z.enum(['mild', 'moderate', 'severe']),
  description: z.string(),
  affected_areas: z.array(z.string()), // e.g., ["forehead", "cheeks"]
  bounding_boxes: z.array(z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  })).optional(),
  tags: z.array(z.string()).optional() // for mapping to products
});

export const AnalysisResponseSchema = z.object({
  analysis_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  skin_tone: z.string().optional(), // e.g., "fair", "medium", "dark"
  overall_assessment: z.string(),
  detected_issues: z.array(SkinIssueSchema),
  heatmap_url: z.string().url().optional(), // optional heatmap overlay
  recommendations_summary: z.string().optional()
});

export const ProductSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string(),
  brand: z.string(),
  affiliate_url: z.string().url(),
  price: z.number().optional(),
  image_url: z.string().url().optional(),
  inci: z.array(z.string()), // International Nomenclature of Cosmetic Ingredients
  key_actives: z.array(z.string()), // e.g., ["niacinamide", "retinol"]
  tags: z.array(z.string()), // for matching with issues
  description: z.string().optional()
});

export const EvidenceSchema = z.object({
  evidence_id: z.string().uuid(),
  active_ingredient: z.string(),
  paper_title: z.string(),
  source: z.string(), // journal name or URL
  year: z.number(),
  short_summary: z.string(),
  strength_label: z.enum(['strong', 'moderate', 'preliminary']),
  pubmed_url: z.string().url().optional()
});

export const ProductRecommendationSchema = z.object({
  product: ProductSchema,
  evidence: z.array(EvidenceSchema),
  llm_generated_summary: z.string().optional(),
  relevance_score: z.number().min(0).max(1).optional()
});

export const FinalResponseSchema = z.object({
  analysis: z.object({
    analysis_id: z.string().uuid(),
    timestamp: z.string(),
    skin_tone: z.string().optional(),
    overall_assessment: z.string()
  }),
  issues: z.array(z.object({
    issue: SkinIssueSchema,
    recommendations: z.array(ProductRecommendationSchema)
  }))
});

// Types
export type SkinIssue = z.infer<typeof SkinIssueSchema>;
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type ProductRecommendation = z.infer<typeof ProductRecommendationSchema>;
export type FinalResponse = z.infer<typeof FinalResponseSchema>;

// Request schemas
export const AnalyzeRequestSchema = z.object({
  user_id: z.string().optional(),
  consent_given: z.boolean(),
  metadata: z.object({
    lighting_condition: z.string().optional(),
    makeup_removed: z.boolean().optional(),
    image_angles: z.array(z.enum(['frontal', 'left', 'right'])).optional()
  }).optional()
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

