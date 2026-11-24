import { useConnectionStore } from '../stores/connectionStore';
import { Link } from 'react-router-dom';
import { Mic, Brain, Package, Wifi, WifiOff, ExternalLink, Zap } from 'lucide-react';

export default function Home() {
  const { status, gpuInfo, serverUrl, connectManually } = useConnectionStore();
  const isConnected = status === 'connected';

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-l from-primary to-primary-light bg-clip-text text-transparent">
          VoiceForge
        </h1>
        <p className="text-text-muted text-sm">استنساخ وتحويل الأصوات بالذكاء الاصطناعي</p>
      </div>

      {/* Connection Card */}
      <div className={`rounded-2xl p-5 border ${
        isConnected ? 'bg-success/10 border-success/30' : 'bg-surface border-surface-light'
      }`}>
        <div className="flex items-center gap-3 mb-3">
          {isConnected ? <Wifi className="text-success" size={24} /> : <WifiOff className="text-text-muted" size={24} />}
          <div>
            <h2 className="font-semibold">{isConnected ? 'متصل بـ Colab' : 'غير متصل'}</h2>
            {isConnected && <p className="text-xs text-text-muted">GPU: {gpuInfo}</p>}
          </div>
        </div>

        {!isConnected && (
          <div className="space-y-3">
            <p className="text-sm text-text-muted">
              لبدء الاستخدام، افتح Notebook في Google Colab وشغّل الخادم
            </p>
            <a
              href="https://colab.research.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-light"
            >
              <ExternalLink size={14} /> فتح Google Colab
            </a>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3">
        <Link
          to="/inference"
          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
            isConnected
              ? 'bg-surface border-surface-light hover:border-primary/50 active:scale-[0.98]'
              : 'bg-surface/50 border-surface-light/50 opacity-60 pointer-events-none'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Mic className="text-primary" size={22} />
          </div>
          <div>
            <h3 className="font-semibold">تحويل الصوت</h3>
            <p className="text-xs text-text-muted">حوّل صوتك أو أي ملف صوتي بنموذج AI</p>
          </div>
        </Link>

        <Link
          to="/training"
          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
            isConnected
              ? 'bg-surface border-surface-light hover:border-primary/50 active:scale-[0.98]'
              : 'bg-surface/50 border-surface-light/50 opacity-60 pointer-events-none'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
            <Brain className="text-warning" size={22} />
          </div>
          <div>
            <h3 className="font-semibold">تدريب نموذج</h3>
            <p className="text-xs text-text-muted">درّب نموذج صوتي جديد من تسجيلاتك</p>
          </div>
        </Link>

        <Link
          to="/models"
          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
            isConnected
              ? 'bg-surface border-surface-light hover:border-primary/50 active:scale-[0.98]'
              : 'bg-surface/50 border-surface-light/50 opacity-60 pointer-events-none'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
            <Package className="text-success" size={22} />
          </div>
          <div>
            <h3 className="font-semibold">إدارة النماذج</h3>
            <p className="text-xs text-text-muted">تنزيل، رفع، وإدارة نماذج الأصوات</p>
          </div>
        </Link>
      </div>

      {/* Features */}
      <div className="bg-surface rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Zap size={16} className="text-primary" /> المميزات
        </h3>
        <ul className="space-y-2 text-sm text-text-muted">
          <li className="flex items-center gap-2">✦ تحويل الصوت بتقنية RVC v2</li>
          <li className="flex items-center gap-2">✦ تدريب نماذج مخصصة عبر GPU Colab</li>
          <li className="flex items-center gap-2">✦ خوارزميات متعددة (RMVPE, FCPE, Crepe)</li>
          <li className="flex items-center gap-2">✦ حفظ تلقائي في Google Drive</li>
          <li className="flex items-center gap-2">✦ يعمل كتطبيق موبايل (PWA)</li>
        </ul>
      </div>
    </div>
  );
}
