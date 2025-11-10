import mongoose, { Document, Schema, Model } from 'mongoose';

const DATABASE_URL = process.env.DATABASE_URL;

let databaseAvailable = false;

if (DATABASE_URL) {
  try {
    await mongoose.connect(DATABASE_URL);
    databaseAvailable = true;
  } catch (error) {
    console.error('Database connection failed:', error);
    databaseAvailable = false;
  }
}

export interface IAnalysisHistory extends Document {
  url: string;
  title?: string;
  contentPreview?: string;
  analysisResult: string;
  codeAnalysis?: string;
  overallRating?: number;
  credibilityScore?: number;
  qualityScore?: number;
  evaluationSummary?: string;
  relatedResources?: string;
  aiProvider?: string;
  createdAt: Date;
}

const AnalysisHistorySchema = new Schema<IAnalysisHistory>({
  url: { type: String, required: true },
  title: { type: String },
  contentPreview: { type: String },
  analysisResult: { type: String, required: true },
  codeAnalysis: { type: String },
  overallRating: { type: Number },
  credibilityScore: { type: Number },
  qualityScore: { type: Number },
  evaluationSummary: { type: String },
  relatedResources: { type: String },
  aiProvider: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const AnalysisHistory: Model<IAnalysisHistory> = mongoose.model<IAnalysisHistory>('AnalysisHistory', AnalysisHistorySchema);

export async function initDb(): Promise<boolean> {
  /**
   * Initialize database connection
   */
  if (!databaseAvailable) {
    return false;
  }
  try {
    // Ensure indexes are created
    await AnalysisHistory.createIndexes();
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

export { databaseAvailable };

export async function saveAnalysis(data: {
  url: string;
  title: string;
  contentPreview: string;
  analysisResult: string;
  codeAnalysis?: string;
  overallRating?: number;
  credibilityScore?: number;
  qualityScore?: number;
  evaluationSummary?: string;
  relatedResources?: string;
  aiProvider?: string;
}): Promise<number> {
  /**
   * Save new analysis to database
   */
  if (!databaseAvailable) {
    throw new Error("قاعدة البيانات غير متاحة");
  }

  try {
    const newAnalysis = new AnalysisHistory({
      url: data.url,
      title: data.title,
      contentPreview: data.contentPreview?.slice(0, 500),
      analysisResult: data.analysisResult,
      codeAnalysis: data.codeAnalysis,
      overallRating: data.overallRating,
      credibilityScore: data.credibilityScore,
      qualityScore: data.qualityScore,
      evaluationSummary: data.evaluationSummary,
      relatedResources: data.relatedResources,
      aiProvider: data.aiProvider
    });

    const saved = await newAnalysis.save();
    return saved._id.toString() as any; // Return as number for compatibility
  } catch (error) {
    throw error;
  }
}

export async function getRecentAnalyses(limit: number = 10): Promise<IAnalysisHistory[]> {
  /**
   * Get recent analyses
   */
  if (!databaseAvailable) {
    return [];
  }

  try {
    const analyses = await AnalysisHistory.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    return analyses;
  } catch (error) {
    console.error('Error fetching recent analyses:', error);
    return [];
  }
}

export async function getAnalysisById(analysisId: string | number): Promise<IAnalysisHistory | null> {
  /**
   * Get specific analysis by ID
   */
  if (!databaseAvailable) {
    return null;
  }

  try {
    const analysis = await AnalysisHistory.findById(analysisId);
    return analysis;
  } catch (error) {
    console.error('Error fetching analysis by ID:', error);
    return null;
  }
}

export async function deleteAnalysis(analysisId: string | number): Promise<boolean> {
  /**
   * Delete specific analysis
   */
  if (!databaseAvailable) {
    return false;
  }

  try {
    const result = await AnalysisHistory.findByIdAndDelete(analysisId);
    return !!result;
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return false;
  }
}
