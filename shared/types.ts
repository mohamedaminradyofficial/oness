// Shared types for the application
export interface AnalysisRequest {
  url: string;
  aiProvider?: string;
  analyzeImages?: boolean;
  analyzeVideo?: boolean;
}

export interface EvaluationResult {
  overall_rating: number;
  credibility_score: number;
  quality_score: number;
  recency_score: number;
  sources_score: number;
  objectivity_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface RelatedResource {
  title: string;
  url: string;
  type: string;
  description: string;
  relevance: string;
}

export interface AnalysisResult {
  success: boolean;
  analysis_id: number;
  url: string;
  title: string;
  analysis: string;
  code_analysis?: string;
  evaluation: EvaluationResult;
  related_resources: RelatedResource[];
  has_code: boolean;
  timestamp: string;
}

export interface AnalysisRecord {
  id: number;
  url: string;
  title?: string;
  overallRating?: number;
  createdAt: string;
}
