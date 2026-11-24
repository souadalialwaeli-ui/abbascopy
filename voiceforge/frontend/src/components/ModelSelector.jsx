import { useEffect } from 'react';
import { useModelStore } from '../stores/modelStore';
import { RefreshCw, ChevronDown } from 'lucide-react';

export default function ModelSelector() {
  const { models, loading, selectedModel, fetchModels, selectModel } = useModelStore();

  useEffect(() => { fetchModels(); }, []);

  const currentModel = models.find(m => m.pth_path === selectedModel);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-text-muted">النموذج الصوتي</label>
        <button onClick={fetchModels} disabled={loading} className="text-text-muted hover:text-primary transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="relative">
        <select
          value={selectedModel || ''}
          onChange={(e) => {
            const model = models.find(m => m.pth_path === e.target.value);
            selectModel(model || null);
          }}
          className="w-full bg-surface-light text-text border border-surface-light rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">— اختر نموذجاً —</option>
          {models.map((m) => (
            <option key={m.pth_path} value={m.pth_path}>{m.name}</option>
          ))}
        </select>
        <ChevronDown size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>

      {currentModel && currentModel.index_path && (
        <p className="text-xs text-text-muted">ملف الفهرس: {currentModel.index_path.split('/').pop()}</p>
      )}
    </div>
  );
}
