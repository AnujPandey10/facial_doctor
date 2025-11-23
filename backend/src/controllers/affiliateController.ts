import { Request, Response } from 'express';
import { query } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export async function trackAffiliateClick(req: Request, res: Response) {
  try {
    const { productId } = req.params;
    const { analysisId, userId, utmSource, utmMedium, utmCampaign } = req.query;

    // Get product affiliate URL
    const productResult = await query(
      'SELECT affiliate_url FROM products WHERE product_id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    const affiliateUrl = productResult.rows[0].affiliate_url;

    // Track the click
    await query(
      `INSERT INTO affiliate_clicks (
        click_id, product_id, analysis_id, user_id,
        utm_source, utm_medium, utm_campaign, referrer
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        uuidv4(),
        productId,
        analysisId || null,
        userId || null,
        utmSource || 'skincare_app',
        utmMedium || 'recommendation',
        utmCampaign || 'skin_analysis',
        req.get('referer') || null
      ]
    );

    // Build final URL with UTM parameters
    const url = new URL(affiliateUrl);
    url.searchParams.set('utm_source', utmSource as string || 'skincare_app');
    url.searchParams.set('utm_medium', utmMedium as string || 'recommendation');
    url.searchParams.set('utm_campaign', utmCampaign as string || 'skin_analysis');

    // Redirect to affiliate link
    res.redirect(url.toString());
  } catch (error) {
    console.error('Affiliate tracking error:', error);
    res.status(500).json({
      error: 'Failed to process affiliate link'
    });
  }
}

export async function getAffiliateStats(req: Request, res: Response) {
  try {
    const { productId, startDate, endDate } = req.query;

    let queryText = `
      SELECT 
        p.product_id,
        p.name as product_name,
        COUNT(ac.click_id) as total_clicks,
        COUNT(DISTINCT ac.user_id) as unique_users,
        COUNT(DISTINCT ac.analysis_id) as unique_analyses
      FROM products p
      LEFT JOIN affiliate_clicks ac ON p.product_id = ac.product_id
    `;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (productId) {
      conditions.push(`p.product_id = $${paramCount++}`);
      params.push(productId);
    }

    if (startDate) {
      conditions.push(`ac.clicked_at >= $${paramCount++}`);
      params.push(startDate);
    }

    if (endDate) {
      conditions.push(`ac.clicked_at <= $${paramCount++}`);
      params.push(endDate);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' GROUP BY p.product_id, p.name ORDER BY total_clicks DESC';

    const result = await query(queryText, params);

    res.json({
      stats: result.rows
    });
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    res.status(500).json({
      error: 'Failed to fetch stats'
    });
  }
}

