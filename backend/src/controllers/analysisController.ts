import { Request, Response } from 'express';
import { analyzeImageWithLLM, generateProductSummary } from '../services/llmService';
import { ProductRepository } from '../repositories/productRepository';
import { EvidenceRepository } from '../repositories/evidenceRepository';
import { query } from '../db/database';
import { AnalyzeRequestSchema, FinalResponse, ProductRecommendation } from '../types/schema';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const productRepo = new ProductRepository();
const evidenceRepo = new EvidenceRepository();

export async function analyzeImage(req: Request, res: Response) {
  try {
    // Validate consent
    const requestData = AnalyzeRequestSchema.parse(req.body);
    
    if (!requestData.consent_given) {
      return res.status(400).json({
        error: 'Consent required',
        message: 'User must consent to image processing before analysis can proceed'
      });
    }

    // Get uploaded file
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please upload an image file'
      });
    }

    // Convert image to base64
    const imageBuffer = fs.readFileSync(file.path);
    const imageBase64 = imageBuffer.toString('base64');

    // Call LLM for analysis
    console.log('Analyzing image with LLM...');
    const analysis = await analyzeImageWithLLM(imageBase64);

    // Map each issue to products
    const issuesWithRecommendations = await Promise.all(
      analysis.detected_issues.map(async (issue) => {
        // Find products matching issue tags
        const products = await productRepo.findByTags(issue.tags || []);
        
        // Limit to 2-4 products per issue
        const topProducts = products.slice(0, 4);

        // Get evidence and generate summaries for each product
        const recommendations: ProductRecommendation[] = await Promise.all(
          topProducts.map(async (product) => {
            // Get evidence for product's key actives
            const evidenceList = await Promise.all(
              product.key_actives.slice(0, 2).map(active =>
                evidenceRepo.findByActiveIngredient(active)
              )
            );

            const flattenedEvidence = evidenceList.flat().slice(0, 3);

            // Generate LLM summary
            let llmSummary: string | undefined;
            try {
              llmSummary = await generateProductSummary(
                product.name,
                product.key_actives,
                issue
              );
            } catch (error) {
              console.error('Error generating summary:', error);
              llmSummary = undefined;
            }

            return {
              product,
              evidence: flattenedEvidence,
              llm_generated_summary: llmSummary,
              relevance_score: undefined // Could implement scoring logic
            };
          })
        );

        return {
          issue,
          recommendations
        };
      })
    );

    // Store analysis in database
    const analysisId = analysis.analysis_id;
    await query(
      `INSERT INTO analyses (
        analysis_id, user_id, image_path, skin_tone,
        overall_assessment, detected_issues, consent_given
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        analysisId,
        requestData.user_id || null,
        file.path,
        analysis.skin_tone || null,
        analysis.overall_assessment,
        JSON.stringify(analysis.detected_issues),
        true
      ]
    );

    // Log consent
    if (requestData.user_id) {
      await query(
        `INSERT INTO user_consents (
          user_id, consent_text, consent_version, ip_address
        ) VALUES ($1, $2, $3, $4)`,
        [
          requestData.user_id,
          'I consent to uploading my image for cosmetic skin analysis. I understand this is not medical advice.',
          '1.0',
          req.ip
        ]
      );
    }

    // Build final response
    const finalResponse: FinalResponse = {
      analysis: {
        analysis_id: analysisId,
        timestamp: analysis.timestamp,
        skin_tone: analysis.skin_tone,
        overall_assessment: analysis.overall_assessment
      },
      issues: issuesWithRecommendations
    };

    // Clean up uploaded file (optional - you may want to keep for review)
    // fs.unlinkSync(file.path);

    res.json(finalResponse);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

export async function getAnalysisHistory(req: Request, res: Response) {
  try {
    const userId = req.query.user_id as string;
    
    if (!userId) {
      return res.status(400).json({
        error: 'Missing user_id',
        message: 'user_id query parameter is required'
      });
    }

    const result = await query(
      `SELECT 
        analysis_id, skin_tone, overall_assessment,
        detected_issues, created_at
       FROM analyses
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    res.json({
      analyses: result.rows.map(row => ({
        analysis_id: row.analysis_id,
        skin_tone: row.skin_tone,
        overall_assessment: row.overall_assessment,
        issues_count: row.detected_issues?.length || 0,
        created_at: row.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      error: 'Failed to fetch history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function getAnalysisById(req: Request, res: Response) {
  try {
    const { analysisId } = req.params;

    const result = await query(
      `SELECT * FROM analyses WHERE analysis_id = $1`,
      [analysisId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Analysis not found'
      });
    }

    const analysis = result.rows[0];

    res.json({
      analysis_id: analysis.analysis_id,
      skin_tone: analysis.skin_tone,
      overall_assessment: analysis.overall_assessment,
      detected_issues: analysis.detected_issues,
      created_at: analysis.created_at
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({
      error: 'Failed to fetch analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

