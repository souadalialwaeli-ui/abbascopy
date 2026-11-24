import { useConnectionStore } from '../stores/connectionStore';
import { Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react';

const statusConfig = {
  connected: { icon: Wifi, text: 'متصل', color: 'bg-success', textColor: 'text-success' },
  connecting: { icon: Loader2, text: 'جاري الاتصال...', color: 'bg-warning', textColor: 'text-warning' },
  disconnected: { icon: WifiOff, text: 'غير متصل', color: 'bg-danger', textColor: 'text-danger' },
  'no-gpu': { icon: AlertTriangle, text: 'بدون GPU', color: 'bg-warning', textColor: 'text-warning' },
};

export default function ConnectionStatus() {
  const { status, gpuInfo } = useConnectionStore();
  const config = statusConfig[status] || statusConfig.disconnected;
  const Icon = config.icon;

  return (
    <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-sm border-b border-surface-light">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.color} ${status === 'connecting' ? 'animate-pulse' : ''}`} />
          <span className={`text-sm ${config.textColor}`}>
            <Icon size={14} className={`inline ml-1 ${status === 'connecting' ? 'animate-spin' : ''}`} />
            {config.text}
          </span>
        </div>
        {gpuInfo && status === 'connected' && (
          <span className="text-xs text-text-muted">GPU: {gpuInfo}</span>
        )}
      </div>
    </div>
  );
}
