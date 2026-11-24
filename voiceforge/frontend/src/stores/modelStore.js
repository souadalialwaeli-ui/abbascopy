import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useModelStore = create((set, get) => ({
  models: [],
  loading: false,
  selectedModel: null,
  selectedIndex: null,

  fetchModels: async () => {
    set({ loading: true });
    try {
      const data = await api.getModels();
      set({ models: data.models || [] });
    } catch (err) {
      toast.error('فشل تحميل النماذج: ' + err.message);
    } finally {
      set({ loading: false });
    }
  },

  selectModel: (model) => {
    set({
      selectedModel: model?.pth_path || null,
      selectedIndex: model?.index_path || null,
    });
  },

  uploadModel: async (files) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    try {
      const result = await api.uploadModel(formData);
      toast.success('تم رفع النموذج بنجاح');
      await get().fetchModels();
      return result;
    } catch (err) {
      toast.error('فشل رفع النموذج: ' + err.message);
      throw err;
    }
  },

  downloadModel: async (url, name) => {
    try {
      toast.loading('جاري تنزيل النموذج...', { id: 'download-model' });
      const result = await api.downloadModel(url, name);
      toast.success('تم تنزيل النموذج بنجاح', { id: 'download-model' });
      await get().fetchModels();
      return result;
    } catch (err) {
      toast.error('فشل تنزيل النموذج: ' + err.message, { id: 'download-model' });
      throw err;
    }
  },

  deleteModel: async (modelName) => {
    try {
      await api.deleteModel(modelName);
      toast.success('تم حذف النموذج');
      await get().fetchModels();
    } catch (err) {
      toast.error('فشل حذف النموذج: ' + err.message);
    }
  },

  syncToDrive: async (modelName) => {
    try {
      toast.loading('جاري المزامنة مع Drive...', { id: 'sync-drive' });
      await api.syncToDrive(modelName);
      toast.success('تمت المزامنة بنجاح', { id: 'sync-drive' });
    } catch (err) {
      toast.error('فشلت المزامنة: ' + err.message, { id: 'sync-drive' });
    }
  },
}));
