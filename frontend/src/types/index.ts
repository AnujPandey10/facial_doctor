export interface SkinIssue {
  issue_id: string;
  issue_name: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  affected_areas: string[];
  tags?: string[];
}

export interface Product {
  product_id: string;
  name: string;
  brand: string;
  affiliate_url: string;
  price?: number;
  image_url?: string;
  inci: string[];
  key_actives: string[];
  tags: string[];
  description?: string;
}

export interface Evidence {
  evidence_id: string;
  active_ingredient: string;
  paper_title: string;
  source: string;
  year: number;
  short_summary: string;
  strength_label: 'strong' | 'moderate' | 'preliminary';
  pubmed_url?: string;
}

export interface ProductRecommendation {
  product: Product;
  evidence: Evidence[];
  llm_generated_summary?: string;
  relevance_score?: number;
}

export interface AnalysisResult {
  analysis: {
    analysis_id: string;
    timestamp: string;
    skin_tone?: string;
    overall_assessment: string;
  };
  issues: Array<{
    issue: SkinIssue;
    recommendations: ProductRecommendation[];
  }>;
}

