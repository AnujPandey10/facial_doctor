import axios from 'axios';
import { AnalysisResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const analyzeImage = async (
  imageFile: File,
  consentGiven: boolean,
  userId?: string,
  metadata?: any
): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('consent_given', String(consentGiven));
  
  if (userId) {
    formData.append('user_id', userId);
  }
  
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }

  const response = await apiClient.post<AnalysisResult>('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const getAnalysisHistory = async (userId: string) => {
  const response = await apiClient.get(`/analysis/history?user_id=${userId}`);
  return response.data;
};

export const getAnalysisById = async (analysisId: string) => {
  const response = await apiClient.get(`/analysis/${analysisId}`);
  return response.data;
};

export const trackAffiliateClick = (
  productId: string,
  analysisId?: string,
  userId?: string
) => {
  const params = new URLSearchParams();
  if (analysisId) params.append('analysisId', analysisId);
  if (userId) params.append('userId', userId);
  
  return `${API_BASE_URL}/affiliate/${productId}?${params.toString()}`;
};

// Admin API
export const adminApi = {
  // Products
  listProducts: () => apiClient.get('/admin/products'),
  getProduct: (productId: string) => apiClient.get(`/admin/products/${productId}`),
  createProduct: (data: any) => apiClient.post('/admin/products', data),
  updateProduct: (productId: string, data: any) => 
    apiClient.put(`/admin/products/${productId}`, data),
  deleteProduct: (productId: string) => apiClient.delete(`/admin/products/${productId}`),

  // Evidence
  listEvidence: () => apiClient.get('/admin/evidence'),
  getEvidence: (evidenceId: string) => apiClient.get(`/admin/evidence/${evidenceId}`),
  createEvidence: (data: any) => apiClient.post('/admin/evidence', data),
  updateEvidence: (evidenceId: string, data: any) => 
    apiClient.put(`/admin/evidence/${evidenceId}`, data),
  deleteEvidence: (evidenceId: string) => apiClient.delete(`/admin/evidence/${evidenceId}`),

  // Linking
  linkProductEvidence: (productId: string, evidenceId: string) =>
    apiClient.post('/admin/link-product-evidence', { productId, evidenceId }),
  unlinkProductEvidence: (productId: string, evidenceId: string) =>
    apiClient.delete('/admin/unlink-product-evidence', { data: { productId, evidenceId } })
};

export default apiClient;

