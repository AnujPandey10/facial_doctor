import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Package, FileText, Link as LinkIcon } from 'lucide-react';
import { adminApi } from '../api/client';
import { Product, Evidence } from '../types';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'evidence'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const response = await adminApi.listProducts();
        setProducts(response.data.products || []);
      } else {
        const response = await adminApi.listEvidence();
        setEvidence(response.data.evidence || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await adminApi.deleteProduct(productId);
      toast.success('Product deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (!window.confirm('Are you sure you want to delete this evidence?')) return;

    try {
      await adminApi.deleteEvidence(evidenceId);
      toast.success('Evidence deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete evidence');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-2 border-b-2 font-medium transition ${
                  activeTab === 'products'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Products</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('evidence')}
                className={`py-4 px-2 border-b-2 font-medium transition ${
                  activeTab === 'evidence'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Evidence</span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Action Button */}
            <div className="mb-6">
              <button
                onClick={() => activeTab === 'products' ? setShowProductForm(true) : setShowEvidenceForm(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add {activeTab === 'products' ? 'Product' : 'Evidence'}</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : activeTab === 'products' ? (
              <ProductsList products={products} onDelete={handleDeleteProduct} />
            ) : (
              <EvidenceList evidence={evidence} onDelete={handleDeleteEvidence} />
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Admin Panel Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Add and manage products with their ingredients and affiliate links</li>
            <li>• Add scientific evidence for active ingredients</li>
            <li>• Link products to evidence through the product detail view</li>
            <li>• Changes reflect in recommendations within 5 minutes</li>
            <li>• Use clear, consistent ingredient names for better matching</li>
          </ul>
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductFormModal
          onClose={() => {
            setShowProductForm(false);
            loadData();
          }}
        />
      )}

      {/* Evidence Form Modal */}
      {showEvidenceForm && (
        <EvidenceFormModal
          onClose={() => {
            setShowEvidenceForm(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

interface ProductsListProps {
  products: Product[];
  onDelete: (id: string) => void;
}

function ProductsList({ products, onDelete }: ProductsListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        No products yet. Add your first product to get started.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.product_id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.brand}</p>
              {product.price && (
                <p className="text-lg font-bold text-primary-600 mt-1">
                  ${product.price.toFixed(2)}
                </p>
              )}
            </div>
            <button
              onClick={() => onDelete(product.product_id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-600 mb-1">Key Actives:</p>
            <div className="flex flex-wrap gap-1">
              {product.key_actives.map((active, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded"
                >
                  {active}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-600 mb-1">Tags:</p>
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{product.tags.length - 3} more</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface EvidenceListProps {
  evidence: Evidence[];
  onDelete: (id: string) => void;
}

function EvidenceList({ evidence, onDelete }: EvidenceListProps) {
  if (evidence.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        No evidence yet. Add your first evidence entry to get started.
      </div>
    );
  }

  const getStrengthColor = (strength: string) => {
    const colors = {
      strong: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      preliminary: 'bg-blue-100 text-blue-800'
    };
    return colors[strength as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {evidence.map((item) => (
        <div key={item.evidence_id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900">{item.active_ingredient}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStrengthColor(item.strength_label)}`}>
                  {item.strength_label}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-1">{item.paper_title}</p>
              <p className="text-xs text-gray-600">{item.source} ({item.year})</p>
            </div>
            <button
              onClick={() => onDelete(item.evidence_id)}
              className="text-red-600 hover:text-red-700 flex-shrink-0 ml-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-700 mt-2">{item.short_summary}</p>
        </div>
      ))}
    </div>
  );
}

// Simple form modals (you can enhance these)
function ProductFormModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    affiliate_url: '',
    price: '',
    key_actives: '',
    tags: '',
    inci: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createProduct({
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined,
        key_actives: formData.key_actives.split(',').map(s => s.trim()),
        tags: formData.tags.split(',').map(s => s.trim()),
        inci: formData.inci.split(',').map(s => s.trim())
      });
      toast.success('Product created');
      onClose();
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Add Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Product Name *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Brand *"
            required
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="url"
            placeholder="Affiliate URL *"
            required
            value={formData.affiliate_url}
            onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Key Actives (comma-separated) *"
            required
            value={formData.key_actives}
            onChange={(e) => setFormData({ ...formData, key_actives: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Tags (comma-separated) *"
            required
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            placeholder="INCI List (comma-separated) *"
            required
            value={formData.inci}
            onChange={(e) => setFormData({ ...formData, inci: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg"
            >
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EvidenceFormModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    active_ingredient: '',
    paper_title: '',
    source: '',
    year: '',
    short_summary: '',
    strength_label: 'moderate' as 'strong' | 'moderate' | 'preliminary',
    pubmed_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createEvidence({
        ...formData,
        year: parseInt(formData.year)
      });
      toast.success('Evidence created');
      onClose();
    } catch (error) {
      toast.error('Failed to create evidence');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Add Evidence</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Active Ingredient *"
            required
            value={formData.active_ingredient}
            onChange={(e) => setFormData({ ...formData, active_ingredient: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Paper Title *"
            required
            value={formData.paper_title}
            onChange={(e) => setFormData({ ...formData, paper_title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Source (Journal/URL) *"
            required
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Year *"
            required
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <select
            value={formData.strength_label}
            onChange={(e) => setFormData({ ...formData, strength_label: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="strong">Strong Evidence</option>
            <option value="moderate">Moderate Evidence</option>
            <option value="preliminary">Preliminary Evidence</option>
          </select>
          <textarea
            placeholder="Short Summary *"
            required
            value={formData.short_summary}
            onChange={(e) => setFormData({ ...formData, short_summary: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
          />
          <input
            type="url"
            placeholder="PubMed URL (optional)"
            value={formData.pubmed_url}
            onChange={(e) => setFormData({ ...formData, pubmed_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg"
            >
              Create Evidence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

