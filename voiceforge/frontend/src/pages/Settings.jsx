import { useState } from 'react';
import { useConnectionStore } from '../stores/connectionStore';
import { Save, Link, Database, Key, RefreshCw, Wifi, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { serverUrl, firebaseConfig, apiKey, setFirebaseConfig, connectManually, setApiKey, checkConnection, status } = useConnectionStore();
  const [url, setUrl] = useState(serverUrl || '');
  const [key, setKey] = useState(apiKey || '');
  const [fbConfig, setFbConfig] = useState({
    databaseURL: firebaseConfig?.databaseURL || '',
    apiKey: firebaseConfig?.apiKey || '',
    projectId: firebaseConfig?.projectId || '',
  });

  const handleSaveUrl = () => {
    if (url) {
      connectManually(url);
      toast.success('تم حفظ عنوان الخادم');
    }
  };

  const handleSaveFirebase = () => {
    if (fbConfig.databaseURL) {
      setFirebaseConfig(fbConfig);
      toast.success('تم حفظ إعدادات Firebase');
    }
  };

  const handleSaveKey = () => {
    setApiKey(key);
    toast.success('تم حفظ مفتاح API');
  };

  return (
    <div className="space-y-5 py-4">
      <h2 className="text-xl font-bold">⚙️ الإعدادات</h2>

      {/* Server URL */}
      <div className="bg-surface rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Link size={16} className="text-primary" /> عنوان الخادم
        </h3>
        <p className="text-xs text-text-muted">أدخل عنوان URL الذي يظهر عند تشغيل Notebook في Colab</p>
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-domain.trycloudflare.com" dir="ltr"
          className="w-full bg-surface-light text-text rounded-lg px-3 py-2.5 border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
        <div className="flex gap-2">
          <button onClick={handleSaveUrl} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium flex items-center justify-center gap-1">
            <Save size={14} /> حفظ واتصال
          </button>
          <button onClick={checkConnection} className="py-2.5 px-4 rounded-lg bg-surface-light text-text-muted hover:text-text text-sm">
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-success' : status === 'connecting' ? 'bg-warning animate-pulse' : 'bg-danger'}`} />
          <span className="text-text-muted">{status === 'connected' ? 'متصل' : status === 'connecting' ? 'جاري الاتصال...' : 'غير متصل'}</span>
        </div>
      </div>

      {/* Firebase */}
      <div className="bg-surface rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Database size={16} className="text-warning" /> Firebase (اختياري)
        </h3>
        <p className="text-xs text-text-muted">لجلب عنوان الخادم تلقائياً عند تشغيل Colab</p>
        <div className="space-y-2">
          <input type="url" value={fbConfig.databaseURL} onChange={(e) => setFbConfig(c => ({ ...c, databaseURL: e.target.value }))}
            placeholder="https://project-id.firebaseio.com" dir="ltr"
            className="w-full bg-surface-light text-text rounded-lg px-3 py-2 border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="text" value={fbConfig.apiKey} onChange={(e) => setFbConfig(c => ({ ...c, apiKey: e.target.value }))}
            placeholder="Firebase API Key" dir="ltr"
            className="w-full bg-surface-light text-text rounded-lg px-3 py-2 border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="text" value={fbConfig.projectId} onChange={(e) => setFbConfig(c => ({ ...c, projectId: e.target.value }))}
            placeholder="Project ID" dir="ltr"
            className="w-full bg-surface-light text-text rounded-lg px-3 py-2 border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
        </div>
        <button onClick={handleSaveFirebase} className="w-full py-2.5 rounded-lg bg-warning/20 text-warning text-sm font-medium flex items-center justify-center gap-1">
          <Save size={14} /> حفظ إعدادات Firebase
        </button>
      </div>

      {/* API Key */}
      <div className="bg-surface rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Key size={16} className="text-success" /> مفتاح API (اختياري)
        </h3>
        <p className="text-xs text-text-muted">لتأمين الاتصال بالخادم</p>
        <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="••••••••" dir="ltr"
          className="w-full bg-surface-light text-text rounded-lg px-3 py-2.5 border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
        <button onClick={handleSaveKey} className="w-full py-2.5 rounded-lg bg-success/20 text-success text-sm font-medium flex items-center justify-center gap-1">
          <Save size={14} /> حفظ المفتاح
        </button>
      </div>

      {/* Guide Link */}
      <div className="bg-surface rounded-xl p-4 text-center space-y-2">
        <p className="text-sm text-text-muted">تحتاج مساعدة في الإعداد؟</p>
        <a href="#" className="text-primary text-sm inline-flex items-center gap-1 hover:text-primary-light">
          <ExternalLink size={14} /> دليل الإعداد الكامل
        </a>
      </div>
    </div>
  );
}
