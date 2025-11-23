import { ProductRepository } from '../repositories/productRepository';
import { EvidenceRepository } from '../repositories/evidenceRepository';

const productRepo = new ProductRepository();
const evidenceRepo = new EvidenceRepository();

async function seed() {
  try {
    console.log('🌱 Seeding database with products and evidence...');

    // Create evidence entries
    const evidenceData = [
      {
        active_ingredient: 'Niacinamide',
        paper_title: 'Nicotinamide improves the appearance of aged skin',
        source: 'International Journal of Cosmetic Science',
        year: 2010,
        short_summary: 'Clinical studies show niacinamide improves skin texture, reduces hyperpigmentation, and minimizes pore appearance.',
        strength_label: 'strong' as const,
        pubmed_url: 'https://pubmed.ncbi.nlm.nih.gov/20653858/'
      },
      {
        active_ingredient: 'Retinol',
        paper_title: 'Retinoids in the treatment of skin aging',
        source: 'Clinical Interventions in Aging',
        year: 2006,
        short_summary: 'Retinol stimulates collagen production, reduces fine lines, and improves skin texture through increased cell turnover.',
        strength_label: 'strong' as const,
        pubmed_url: 'https://pubmed.ncbi.nlm.nih.gov/18044138/'
      },
      {
        active_ingredient: 'Vitamin C',
        paper_title: 'Vitamin C in dermatology',
        source: 'Indian Dermatology Online Journal',
        year: 2013,
        short_summary: 'Vitamin C brightens skin, reduces hyperpigmentation, and provides antioxidant protection against environmental damage.',
        strength_label: 'strong' as const,
        pubmed_url: 'https://pubmed.ncbi.nlm.nih.gov/23741666/'
      },
      {
        active_ingredient: 'Salicylic Acid',
        paper_title: 'Salicylic acid as a peeling agent',
        source: 'Dermatologic Surgery',
        year: 2008,
        short_summary: 'Salicylic acid penetrates pores, reduces acne formation, and exfoliates dead skin cells effectively.',
        strength_label: 'strong' as const,
        pubmed_url: 'https://pubmed.ncbi.nlm.nih.gov/18076607/'
      },
      {
        active_ingredient: 'Hyaluronic Acid',
        paper_title: 'Hyaluronic acid: A key molecule in skin aging',
        source: 'Dermato-Endocrinology',
        year: 2012,
        short_summary: 'Hyaluronic acid provides intense hydration, plumps skin, and reduces the appearance of fine lines.',
        strength_label: 'strong' as const,
        pubmed_url: 'https://pubmed.ncbi.nlm.nih.gov/22837749/'
      },
      {
        active_ingredient: 'Azelaic Acid',
        paper_title: 'Azelaic acid in dermatology',
        source: 'Journal of Clinical and Aesthetic Dermatology',
        year: 2017,
        short_summary: 'Azelaic acid reduces hyperpigmentation, treats acne, and has anti-inflammatory properties for rosacea.',
        strength_label: 'strong' as const,
        pubmed_url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5574737/'
      },
      {
        active_ingredient: 'Peptides',
        paper_title: 'Peptides in skin aging',
        source: 'Journal of Cosmetic Dermatology',
        year: 2015,
        short_summary: 'Peptides stimulate collagen synthesis, improve skin firmness, and reduce the appearance of wrinkles.',
        strength_label: 'moderate' as const
      },
      {
        active_ingredient: 'Ceramides',
        paper_title: 'Ceramides in the skin barrier',
        source: 'American Journal of Clinical Dermatology',
        year: 2003,
        short_summary: 'Ceramides strengthen skin barrier, prevent moisture loss, and improve overall skin hydration.',
        strength_label: 'strong' as const,
        pubmed_url: 'https://pubmed.ncbi.nlm.nih.gov/12553851/'
      },
      {
        active_ingredient: 'Alpha Arbutin',
        paper_title: 'Arbutin in skin lightening',
        source: 'Journal of Drugs in Dermatology',
        year: 2013,
        short_summary: 'Alpha arbutin inhibits melanin production and effectively reduces dark spots and hyperpigmentation.',
        strength_label: 'moderate' as const
      },
      {
        active_ingredient: 'Tranexamic Acid',
        paper_title: 'Tranexamic acid for melasma',
        source: 'Dermatologic Surgery',
        year: 2016,
        short_summary: 'Tranexamic acid reduces melanin production and is effective for treating stubborn hyperpigmentation.',
        strength_label: 'moderate' as const,
        pubmed_url: 'https://pubmed.ncbi.nlm.nih.gov/27537949/'
      }
    ];

    const createdEvidence = [];
    for (const evidence of evidenceData) {
      const created = await evidenceRepo.create(evidence);
      createdEvidence.push(created);
      console.log(`✓ Created evidence: ${evidence.active_ingredient}`);
    }

    // Create products
    const productsData = [
      {
        name: 'CeraVe Renewing SA Cleanser',
        brand: 'CeraVe',
        affiliate_url: 'https://www.amazon.com/CeraVe-Renewing-Cleanser-Salicylic-Exfoliates/dp/B00U1YCRD8?tag=example-20',
        price: 14.99,
        image_url: 'https://example.com/images/cerave-sa-cleanser.jpg',
        inci: ['Water', 'Sodium Lauroyl Sarcosinate', 'Cocamidopropyl Hydroxysultaine', 'Glycerin', 'Niacinamide', 'Salicylic Acid', 'Ceramide NP', 'Ceramide AP', 'Ceramide EOP', 'Hyaluronic Acid'],
        key_actives: ['Salicylic Acid', 'Niacinamide', 'Ceramides', 'Hyaluronic Acid'],
        tags: ['acne', 'oily_skin', 'enlarged_pores', 'exfoliation', 'rough_texture'],
        description: 'Gentle cleanser with salicylic acid to exfoliate and smooth skin while maintaining barrier function.'
      },
      {
        name: 'The Ordinary Niacinamide 10% + Zinc 1%',
        brand: 'The Ordinary',
        affiliate_url: 'https://www.sephora.com/product/the-ordinary-niacinamide-10-zinc-1-P427417?tag=example-20',
        price: 5.90,
        image_url: 'https://example.com/images/ordinary-niacinamide.jpg',
        inci: ['Water', 'Niacinamide', 'Pentylene Glycol', 'Zinc PCA', 'Tamarindus Indica Seed Gum', 'Xanthan Gum', 'Isoceteth-20'],
        key_actives: ['Niacinamide'],
        tags: ['enlarged_pores', 'oily_skin', 'acne', 'uneven_tone', 'hyperpigmentation'],
        description: 'High-strength niacinamide serum to reduce pore appearance and balance oil production.'
      },
      {
        name: 'Paula\'s Choice 2% BHA Liquid Exfoliant',
        brand: 'Paula\'s Choice',
        affiliate_url: 'https://www.paulaschoice.com/skin-perfecting-2pct-bha-liquid-exfoliant/201.html?tag=example-20',
        price: 32.00,
        image_url: 'https://example.com/images/paulas-choice-bha.jpg',
        inci: ['Water', 'Methylpropanediol', 'Butylene Glycol', 'Salicylic Acid', 'Polysorbate 20', 'Camellia Oleifera Leaf Extract', 'Green Tea Extract'],
        key_actives: ['Salicylic Acid'],
        tags: ['acne', 'blackheads', 'enlarged_pores', 'oily_skin', 'rough_texture'],
        description: 'Gentle BHA exfoliant that unclogs pores and smooths skin texture.'
      },
      {
        name: 'Skinceuticals C E Ferulic',
        brand: 'SkinCeuticals',
        affiliate_url: 'https://www.skinceuticals.com/c-e-ferulic-635494263008.html?tag=example-20',
        price: 169.00,
        image_url: 'https://example.com/images/skinceuticals-ce-ferulic.jpg',
        inci: ['Water', 'Ethoxydiglycol', 'L-Ascorbic Acid', 'Alpha Tocopherol', 'Ferulic Acid', 'Panthenol'],
        key_actives: ['Vitamin C', 'Vitamin E'],
        tags: ['hyperpigmentation', 'dark_spots', 'dullness', 'antioxidant', 'brightening', 'fine_lines'],
        description: 'Gold-standard vitamin C serum for brightening and antioxidant protection.'
      },
      {
        name: 'Neutrogena Hydro Boost Water Gel',
        brand: 'Neutrogena',
        affiliate_url: 'https://www.amazon.com/Neutrogena-Hydro-Boost-Hyaluronic-Moisturizer/dp/B00NR1YQHM?tag=example-20',
        price: 18.97,
        image_url: 'https://example.com/images/neutrogena-hydro-boost.jpg',
        inci: ['Water', 'Dimethicone', 'Glycerin', 'Cetearyl Olivate', 'Sodium Hyaluronate', 'Hyaluronic Acid', 'Olive Extract'],
        key_actives: ['Hyaluronic Acid'],
        tags: ['dryness', 'dehydration', 'dullness', 'sensitive_skin'],
        description: 'Lightweight water-gel moisturizer with hyaluronic acid for intense hydration.'
      },
      {
        name: 'La Roche-Posay Retinol B3 Serum',
        brand: 'La Roche-Posay',
        affiliate_url: 'https://www.laroche-posay.us/retinol-b3-serum-3337875597036.html?tag=example-20',
        price: 49.99,
        image_url: 'https://example.com/images/lrp-retinol-b3.jpg',
        inci: ['Water', 'Glycerin', 'Caprylic/Capric Triglyceride', 'Retinol', 'Niacinamide', 'Pentylene Glycol', 'Adenosine'],
        key_actives: ['Retinol', 'Niacinamide'],
        tags: ['fine_lines', 'wrinkles', 'aging', 'uneven_texture', 'dark_spots'],
        description: 'Pure retinol combined with niacinamide to reduce signs of aging with minimal irritation.'
      },
      {
        name: 'The Inkey List Azelaic Acid Serum',
        brand: 'The INKEY List',
        affiliate_url: 'https://www.sephora.com/product/the-inkey-list-azelaic-acid-serum-P455087?tag=example-20',
        price: 10.99,
        image_url: 'https://example.com/images/inkey-azelaic.jpg',
        inci: ['Water', 'Azelaic Acid', 'Glycerin', 'Sodium Hyaluronate', 'Allantoin'],
        key_actives: ['Azelaic Acid', 'Hyaluronic Acid'],
        tags: ['hyperpigmentation', 'acne', 'redness', 'rosacea', 'uneven_tone', 'dark_spots'],
        description: 'Multi-tasking azelaic acid serum to address redness, hyperpigmentation, and breakouts.'
      },
      {
        name: 'Olay Regenerist Micro-Sculpting Cream',
        brand: 'Olay',
        affiliate_url: 'https://www.amazon.com/Olay-Regenerist-Micro-Sculpting-Moisturizer-Fragrance/dp/B004D2C23Y?tag=example-20',
        price: 28.99,
        image_url: 'https://example.com/images/olay-regenerist.jpg',
        inci: ['Water', 'Glycerin', 'Niacinamide', 'Dimethicone', 'Peptides', 'Hyaluronic Acid', 'Vitamin E'],
        key_actives: ['Niacinamide', 'Peptides', 'Hyaluronic Acid'],
        tags: ['fine_lines', 'wrinkles', 'aging', 'firmness', 'dryness'],
        description: 'Advanced anti-aging cream with peptides and niacinamide to improve skin firmness.'
      },
      {
        name: 'CeraVe PM Facial Moisturizing Lotion',
        brand: 'CeraVe',
        affiliate_url: 'https://www.amazon.com/CeraVe-Facial-Moisturizing-Lotion-Lightweight/dp/B00365DABC?tag=example-20',
        price: 16.08,
        image_url: 'https://example.com/images/cerave-pm.jpg',
        inci: ['Water', 'Glycerin', 'Caprylic/Capric Triglyceride', 'Niacinamide', 'Ceramide NP', 'Ceramide AP', 'Ceramide EOP', 'Hyaluronic Acid'],
        key_actives: ['Niacinamide', 'Ceramides', 'Hyaluronic Acid'],
        tags: ['dryness', 'sensitive_skin', 'barrier_repair', 'uneven_tone'],
        description: 'Lightweight night moisturizer with ceramides to restore skin barrier.'
      },
      {
        name: 'Cos De BAHA Tranexamic Acid Serum',
        brand: 'Cos De BAHA',
        affiliate_url: 'https://www.amazon.com/Cos-Baha-Tranexamic-Niacinamide-Hyperpigmentation/dp/B08QV8XQYX?tag=example-20',
        price: 17.99,
        image_url: 'https://example.com/images/cosdebaha-tranexamic.jpg',
        inci: ['Water', 'Tranexamic Acid', 'Niacinamide', 'Alpha Arbutin', 'Glycerin', 'Hyaluronic Acid'],
        key_actives: ['Tranexamic Acid', 'Niacinamide', 'Alpha Arbutin'],
        tags: ['hyperpigmentation', 'dark_spots', 'melasma', 'brightening', 'uneven_tone'],
        description: 'Powerful brightening serum with tranexamic acid to fade stubborn dark spots.'
      },
      {
        name: 'First Aid Beauty Ultra Repair Cream',
        brand: 'First Aid Beauty',
        affiliate_url: 'https://www.sephora.com/product/ultra-repair-cream-P248407?tag=example-20',
        price: 36.00,
        image_url: 'https://example.com/images/fab-ultra-repair.jpg',
        inci: ['Water', 'Colloidal Oatmeal', 'Glycerin', 'Ceramides', 'Shea Butter', 'Allantoin'],
        key_actives: ['Ceramides', 'Colloidal Oatmeal'],
        tags: ['dryness', 'sensitive_skin', 'redness', 'barrier_repair', 'eczema'],
        description: 'Intensive repair cream for dry, sensitive, and eczema-prone skin.'
      },
      {
        name: 'Good Molecules Discoloration Correcting Serum',
        brand: 'Good Molecules',
        affiliate_url: 'https://www.beautylish.com/s/good-molecules-discoloration-correcting-serum?tag=example-20',
        price: 12.00,
        image_url: 'https://example.com/images/goodmolecules-discoloration.jpg',
        inci: ['Water', 'Tranexamic Acid', 'Niacinamide', 'Kojic Acid', 'Licorice Root Extract'],
        key_actives: ['Tranexamic Acid', 'Niacinamide'],
        tags: ['hyperpigmentation', 'dark_spots', 'post_inflammatory', 'brightening'],
        description: 'Multi-ingredient serum targeting discoloration and uneven skin tone.'
      }
    ];

    const createdProducts = [];
    for (const productData of productsData) {
      const product = await productRepo.create(productData);
      createdProducts.push(product);
      console.log(`✓ Created product: ${productData.name}`);

      // Link product to relevant evidence
      for (const active of productData.key_actives) {
        const relevantEvidence = createdEvidence.filter(e => 
          e.active_ingredient.toLowerCase() === active.toLowerCase()
        );
        
        for (const evidence of relevantEvidence) {
          await evidenceRepo.linkProductToEvidence(product.product_id, evidence.evidence_id);
        }
      }
    }

    console.log(`\n✅ Seed completed successfully!`);
    console.log(`   - Created ${createdEvidence.length} evidence entries`);
    console.log(`   - Created ${createdProducts.length} products`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();

