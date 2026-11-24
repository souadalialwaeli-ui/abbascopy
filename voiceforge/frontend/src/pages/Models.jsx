import { useEffect, useState } from 'react';
import { useModelStore } from '../stores/modelStore';
import { Download, Upload, Trash2, Cloud, RefreshCw, Link, Loader2 } from 'lucide-react';

export default function Models() {
  const { models, loading, fetchModels, uploadModel, downloadModel, deleteModel, syncToDrive } = useModelStore();
  const [showDownload, setShowDownload] = useState(false);
  const [dlUrl, setDlUrl] = useState('');
  const [dlName, setDlName] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => { fetchModels(); }, []);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (files?.length) await uploadModel(Array.from(files));
  };

  const handleDownload = async () => {
    if (!dlUrl) return;
    setIsDownloading(true);
    try {
      await downloadModel(dlUrl, dlName || undefined);
      setShowDownload(false);
      setDlUrl('');
      setDlName('');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-5 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">📦 النماذج</h2>
        <button onClick={fetchModels} disabled={loading} className="text-text-muted hover:text-primary transition-colors">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <label className="flex-1 py-3 rounded-xl bg-surface border border-surface-light text-center cursor-pointer hover:border-primary transition-colors">
          <input type="file" accept=".pth,.index,.zip" multiple className="hidden" onChange={handleUpload} />
          <Upload size={16} className="inline ml-1" /> رفع نموذج
        </label>
        <button
          onClick={() => setShowDownload(!showDownload)}
          className="flex-1 py-3 rounded-xl bg-surface border border-surface-light hover:border-primary transition-colors"
        >
          <Download size={16} className="inline ml-1" /> تنزيل نموذج
        </button>
      </div>

      {/* Download Form */}
      {showDownload && (
        <div className="bg-surface rounded-xl p-4 space-y-3 border border-primary/30">
          <div>
            <label className="text-xs text-text-muted">رابط النموذج (مباشر أو Hugging Face)</label>
            <input type="url" value={dlUrl} onChange={(e) => setDlUrl(e.target.value)} placeholder="https://..." dir="ltr"
              className="w-full bg-surface-light text-text rounded-lg px-3 py-2 mt-1 border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="text-xs text-text-muted">اسم النموذج (اختياري)</label>
            <input type="text" value={dlName} onChange={(e) => setDlName(e.target.value)} placeholder="model_name"
              className="w-full bg-surface-light text-text rounded-lg px-3 py-2 mt-1 border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button onClick={handleDownload} disabled={isDownloading || !dlUrl}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            تنزيل
          </button>
        </div>
      )}

      {/* Models List */}
      <div className="space-y-2">
        {loading && models.length === 0 ? (
          <div className="text-center py-10 text-text-muted">
            <Loader2 size={24} className="animate-spin mx-auto mb-2" />
            جاري التحميل...
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-10 text-text-muted">
            <p className="text-lg mb-1">لا توجد نماذج</p>
            <p className="text-sm">ارفع أو نزّل نموذجاً للبدء</p>
          </div>
        ) : (
          models.map((model) => (
            <div key={model.name} className="bg-surface rounded-xl p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{model.name}</h3>
                <div className="flex gap-3 text-xs text-text-muted mt-1">
                  <span>.pth ✓</span>
                  {model.index_path && <span>.index ✓</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => syncToDrive(model.name)} className="p-2 text-text-muted hover:text-primary transition-colors" title="مزامنة مع Drive">
                  <Cloud size={16} />
                </button>
                <button onClick={() => deleteModel(model.name)} className="p-2 text-text-muted hover:text-danger transition-colors" title="حذف">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
