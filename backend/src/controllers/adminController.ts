import { Request, Response } from 'express';
import { ProductRepository } from '../repositories/productRepository';
import { EvidenceRepository } from '../repositories/evidenceRepository';
import { ProductSchema, EvidenceSchema } from '../types/schema';

const productRepo = new ProductRepository();
const evidenceRepo = new EvidenceRepository();

// Product Management
export async function listProducts(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const products = await productRepo.findAll(limit, offset);
    res.json({ products });
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({ error: 'Failed to list products' });
  }
}

export async function getProduct(req: Request, res: Response) {
  try {
    const { productId } = req.params;
    const product = await productRepo.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get linked evidence
    const evidence = await evidenceRepo.findByProductId(productId);

    res.json({ product, evidence });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const productData = ProductSchema.omit({ product_id: true }).parse(req.body);
    const product = await productRepo.create(productData);

    res.status(201).json({ product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({
      error: 'Failed to create product',
      message: error instanceof Error ? error.message : 'Invalid data'
    });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const { productId } = req.params;
    const updates = req.body;

    const product = await productRepo.update(productId, updates);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({
      error: 'Failed to update product',
      message: error instanceof Error ? error.message : 'Invalid data'
    });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const { productId } = req.params;
    const deleted = await productRepo.delete(productId);

    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

// Evidence Management
export async function listEvidence(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const evidence = await evidenceRepo.findAll(limit, offset);
    res.json({ evidence });
  } catch (error) {
    console.error('Error listing evidence:', error);
    res.status(500).json({ error: 'Failed to list evidence' });
  }
}

export async function getEvidence(req: Request, res: Response) {
  try {
    const { evidenceId } = req.params;
    const evidence = await evidenceRepo.findById(evidenceId);

    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    res.json({ evidence });
  } catch (error) {
    console.error('Error getting evidence:', error);
    res.status(500).json({ error: 'Failed to get evidence' });
  }
}

export async function createEvidence(req: Request, res: Response) {
  try {
    const evidenceData = EvidenceSchema.omit({ evidence_id: true }).parse(req.body);
    const evidence = await evidenceRepo.create(evidenceData);

    res.status(201).json({ evidence });
  } catch (error) {
    console.error('Error creating evidence:', error);
    res.status(400).json({
      error: 'Failed to create evidence',
      message: error instanceof Error ? error.message : 'Invalid data'
    });
  }
}

export async function updateEvidence(req: Request, res: Response) {
  try {
    const { evidenceId } = req.params;
    const updates = req.body;

    const evidence = await evidenceRepo.update(evidenceId, updates);

    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    res.json({ evidence });
  } catch (error) {
    console.error('Error updating evidence:', error);
    res.status(400).json({
      error: 'Failed to update evidence',
      message: error instanceof Error ? error.message : 'Invalid data'
    });
  }
}

export async function deleteEvidence(req: Request, res: Response) {
  try {
    const { evidenceId } = req.params;
    const deleted = await evidenceRepo.delete(evidenceId);

    if (!deleted) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    res.json({ message: 'Evidence deleted successfully' });
  } catch (error) {
    console.error('Error deleting evidence:', error);
    res.status(500).json({ error: 'Failed to delete evidence' });
  }
}

// Link product to evidence
export async function linkProductEvidence(req: Request, res: Response) {
  try {
    const { productId, evidenceId } = req.body;

    await evidenceRepo.linkProductToEvidence(productId, evidenceId);

    res.json({ message: 'Product linked to evidence successfully' });
  } catch (error) {
    console.error('Error linking product to evidence:', error);
    res.status(400).json({ error: 'Failed to link product to evidence' });
  }
}

export async function unlinkProductEvidence(req: Request, res: Response) {
  try {
    const { productId, evidenceId } = req.body;

    await evidenceRepo.unlinkProductFromEvidence(productId, evidenceId);

    res.json({ message: 'Product unlinked from evidence successfully' });
  } catch (error) {
    console.error('Error unlinking product from evidence:', error);
    res.status(400).json({ error: 'Failed to unlink product from evidence' });
  }
}

