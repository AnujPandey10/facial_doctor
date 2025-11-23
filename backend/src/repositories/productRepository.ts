import { query } from '../db/database';
import { Product } from '../types/schema';
import { v4 as uuidv4 } from 'uuid';

export class ProductRepository {
  async findByTags(tags: string[]): Promise<Product[]> {
    if (!tags || tags.length === 0) {
      return [];
    }

    const result = await query(
      `SELECT * FROM products 
       WHERE tags && $1
       ORDER BY (
         SELECT COUNT(*) 
         FROM unnest(tags) tag 
         WHERE tag = ANY($1)
       ) DESC
       LIMIT 10`,
      [tags]
    );

    return result.rows.map(this.mapRowToProduct);
  }

  async findById(productId: string): Promise<Product | null> {
    const result = await query(
      'SELECT * FROM products WHERE product_id = $1',
      [productId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToProduct(result.rows[0]);
  }

  async findAll(limit = 50, offset = 0): Promise<Product[]> {
    const result = await query(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return result.rows.map(this.mapRowToProduct);
  }

  async create(product: Omit<Product, 'product_id'>): Promise<Product> {
    const productId = uuidv4();
    
    const result = await query(
      `INSERT INTO products (
        product_id, name, brand, affiliate_url, price, image_url,
        inci, key_actives, tags, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        productId,
        product.name,
        product.brand,
        product.affiliate_url,
        product.price || null,
        product.image_url || null,
        product.inci,
        product.key_actives,
        product.tags,
        product.description || null
      ]
    );

    return this.mapRowToProduct(result.rows[0]);
  }

  async update(productId: string, updates: Partial<Omit<Product, 'product_id'>>): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.brand !== undefined) {
      fields.push(`brand = $${paramCount++}`);
      values.push(updates.brand);
    }
    if (updates.affiliate_url !== undefined) {
      fields.push(`affiliate_url = $${paramCount++}`);
      values.push(updates.affiliate_url);
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(updates.price);
    }
    if (updates.image_url !== undefined) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(updates.image_url);
    }
    if (updates.inci !== undefined) {
      fields.push(`inci = $${paramCount++}`);
      values.push(updates.inci);
    }
    if (updates.key_actives !== undefined) {
      fields.push(`key_actives = $${paramCount++}`);
      values.push(updates.key_actives);
    }
    if (updates.tags !== undefined) {
      fields.push(`tags = $${paramCount++}`);
      values.push(updates.tags);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }

    if (fields.length === 0) {
      return this.findById(productId);
    }

    fields.push(`updated_at = NOW()`);
    values.push(productId);

    const result = await query(
      `UPDATE products SET ${fields.join(', ')} WHERE product_id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToProduct(result.rows[0]);
  }

  async delete(productId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM products WHERE product_id = $1',
      [productId]
    );

    return (result.rowCount || 0) > 0;
  }

  private mapRowToProduct(row: any): Product {
    return {
      product_id: row.product_id,
      name: row.name,
      brand: row.brand,
      affiliate_url: row.affiliate_url,
      price: row.price ? parseFloat(row.price) : undefined,
      image_url: row.image_url || undefined,
      inci: row.inci || [],
      key_actives: row.key_actives || [],
      tags: row.tags || [],
      description: row.description || undefined
    };
  }
}

