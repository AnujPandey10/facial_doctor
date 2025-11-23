import { query } from '../db/database';
import { Evidence } from '../types/schema';
import { v4 as uuidv4 } from 'uuid';

export class EvidenceRepository {
  async findByActiveIngredient(activeIngredient: string): Promise<Evidence[]> {
    const result = await query(
      `SELECT * FROM evidence 
       WHERE LOWER(active_ingredient) = LOWER($1)
       ORDER BY 
         CASE strength_label
           WHEN 'strong' THEN 1
           WHEN 'moderate' THEN 2
           WHEN 'preliminary' THEN 3
         END,
         year DESC
       LIMIT 5`,
      [activeIngredient]
    );

    return result.rows.map(this.mapRowToEvidence);
  }

  async findByProductId(productId: string): Promise<Evidence[]> {
    const result = await query(
      `SELECT e.* FROM evidence e
       JOIN product_evidence pe ON e.evidence_id = pe.evidence_id
       WHERE pe.product_id = $1
       ORDER BY 
         CASE e.strength_label
           WHEN 'strong' THEN 1
           WHEN 'moderate' THEN 2
           WHEN 'preliminary' THEN 3
         END,
         e.year DESC`,
      [productId]
    );

    return result.rows.map(this.mapRowToEvidence);
  }

  async findById(evidenceId: string): Promise<Evidence | null> {
    const result = await query(
      'SELECT * FROM evidence WHERE evidence_id = $1',
      [evidenceId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEvidence(result.rows[0]);
  }

  async findAll(limit = 50, offset = 0): Promise<Evidence[]> {
    const result = await query(
      'SELECT * FROM evidence ORDER BY year DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return result.rows.map(this.mapRowToEvidence);
  }

  async create(evidence: Omit<Evidence, 'evidence_id'>): Promise<Evidence> {
    const evidenceId = uuidv4();
    
    const result = await query(
      `INSERT INTO evidence (
        evidence_id, active_ingredient, paper_title, source,
        year, short_summary, strength_label, pubmed_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        evidenceId,
        evidence.active_ingredient,
        evidence.paper_title,
        evidence.source,
        evidence.year,
        evidence.short_summary,
        evidence.strength_label,
        evidence.pubmed_url || null
      ]
    );

    return this.mapRowToEvidence(result.rows[0]);
  }

  async update(evidenceId: string, updates: Partial<Omit<Evidence, 'evidence_id'>>): Promise<Evidence | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.active_ingredient !== undefined) {
      fields.push(`active_ingredient = $${paramCount++}`);
      values.push(updates.active_ingredient);
    }
    if (updates.paper_title !== undefined) {
      fields.push(`paper_title = $${paramCount++}`);
      values.push(updates.paper_title);
    }
    if (updates.source !== undefined) {
      fields.push(`source = $${paramCount++}`);
      values.push(updates.source);
    }
    if (updates.year !== undefined) {
      fields.push(`year = $${paramCount++}`);
      values.push(updates.year);
    }
    if (updates.short_summary !== undefined) {
      fields.push(`short_summary = $${paramCount++}`);
      values.push(updates.short_summary);
    }
    if (updates.strength_label !== undefined) {
      fields.push(`strength_label = $${paramCount++}`);
      values.push(updates.strength_label);
    }
    if (updates.pubmed_url !== undefined) {
      fields.push(`pubmed_url = $${paramCount++}`);
      values.push(updates.pubmed_url);
    }

    if (fields.length === 0) {
      return this.findById(evidenceId);
    }

    fields.push(`updated_at = NOW()`);
    values.push(evidenceId);

    const result = await query(
      `UPDATE evidence SET ${fields.join(', ')} WHERE evidence_id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEvidence(result.rows[0]);
  }

  async delete(evidenceId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM evidence WHERE evidence_id = $1',
      [evidenceId]
    );

    return (result.rowCount || 0) > 0;
  }

  async linkProductToEvidence(productId: string, evidenceId: string): Promise<void> {
    await query(
      'INSERT INTO product_evidence (product_id, evidence_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [productId, evidenceId]
    );
  }

  async unlinkProductFromEvidence(productId: string, evidenceId: string): Promise<void> {
    await query(
      'DELETE FROM product_evidence WHERE product_id = $1 AND evidence_id = $2',
      [productId, evidenceId]
    );
  }

  private mapRowToEvidence(row: any): Evidence {
    return {
      evidence_id: row.evidence_id,
      active_ingredient: row.active_ingredient,
      paper_title: row.paper_title,
      source: row.source,
      year: row.year,
      short_summary: row.short_summary,
      strength_label: row.strength_label,
      pubmed_url: row.pubmed_url || undefined
    };
  }
}

