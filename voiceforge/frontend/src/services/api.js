import toast from 'react-hot-toast';

class ApiService {
  constructor() {
    this.baseUrl = '';
    this.apiKey = '';
  }

  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  async request(endpoint, options = {}) {
    if (!this.baseUrl) throw new Error('Server not connected');
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'ngrok-skip-browser-warning': 'true',
      ...(this.apiKey && { 'X-API-Key': this.apiKey }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(err.detail || `HTTP ${response.status}`);
      }
      return response;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Is Colab running?');
      }
      throw err;
    }
  }

  // ─── Status ───
  async getStatus() {
    const res = await this.request('/api/status');
    return res.json();
  }

  async ping() {
    try {
      const res = await this.request('/api/status');
      return res.ok;
    } catch { return false; }
  }

  // ─── Models ───
  async getModels() {
    const res = await this.request('/api/models');
    return res.json();
  }

  async uploadModel(formData, onProgress) {
    const res = await this.request('/api/models/upload', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }

  async deleteModel(modelName) {
    const res = await this.request(`/api/models/${encodeURIComponent(modelName)}`, {
      method: 'DELETE',
    });
    return res.json();
  }

  async downloadModel(url, name) {
    const res = await this.request('/api/models/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, name }),
    });
    return res.json();
  }

  // ─── Inference ───
  async runInference(formData) {
    const res = await this.request('/api/inference', {
      method: 'POST',
      body: formData,
    });
    return res.blob();
  }

  // ─── Training ───
  async uploadDataset(formData) {
    const res = await this.request('/api/training/upload-dataset', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }

  async preprocess(config) {
    const res = await this.request('/api/training/preprocess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  }

  async extractFeatures(config) {
    const res = await this.request('/api/training/extract-features', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  }

  async startTraining(config) {
    const res = await this.request('/api/training/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  }

  async stopTraining() {
    const res = await this.request('/api/training/stop', { method: 'POST' });
    return res.json();
  }

  async getTrainingStatus() {
    const res = await this.request('/api/training/status');
    return res.json();
  }

  // ─── Drive Sync ───
  async syncToDrive(modelName) {
    const res = await this.request('/api/drive/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_name: modelName }),
    });
    return res.json();
  }
}

export const api = new ApiService();
export default api;
