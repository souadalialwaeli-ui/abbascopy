import { useState, useEffect } from 'react';
import wsService from '../services/websocket';
import { Activity, StopCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function TrainingProgress() {
  const [progress, setProgress] = useState({
    epoch: 0,
    totalEpochs: 0,
    loss_g: 0,
    loss_d: 0,
    status: 'idle', // idle | preprocessing | extracting | training | completed | error
    message: '',
    percentage: 0,
    active: false,
  });

  useEffect(() => {
    let isMounted = true;

    // 1. WebSocket listener
    const unsub = wsService.on('training_progress', (data) => {
      if (!isMounted || !data) return;
      setProgress(prev => {
        const total = data.total_epochs || data.totalEpochs || prev.totalEpochs || 0;
        const epoch = data.epoch ?? prev.epoch ?? 0;
        const pct = data.percentage ?? (total > 0 ? (epoch / total) * 100 : 0);
        return {
          ...prev,
          ...data,
          epoch,
          totalEpochs: total,
          percentage: Math.min(100, Math.max(0, pct)),
          status: data.status || (data.active ? 'training' : prev.status),
          active: data.active ?? prev.active,
        };
      });
    });

    // 2. HTTP Polling fallback (vital for Cloudflare tunnels / mobile networks)
    const pollStatus = async () => {
      try {
        const data = await api.getTrainingStatus();
        if (!isMounted || !data) return;
        const total = data.total_epochs || data.totalEpochs || 100;
        const epoch = data.epoch || 0;
        const pct = data.percentage ?? (total > 0 ? (epoch / total) * 100 : 0);
        const isMsgFailed = data.message && data.message.toLowerCase().includes('failed');
        setProgress(prev => ({
          ...prev,
          ...data,
          epoch,
          totalEpochs: total,
          percentage: Math.min(100, Math.max(0, pct)),
          status: isMsgFailed ? 'error' : (data.status || (data.active ? 'training' : (prev.status === 'training' ? 'completed' : prev.status))),
          active: !!data.active,
        }));
      } catch {
        // quiet ignore on background polling error
      }
    };

    pollStatus();
    const timer = setInterval(pollStatus, 1500);

    return () => {
      isMounted = false;
      clearInterval(timer);
      unsub();
    };
  }, []);

  const handleStop = async () => {
    try {
      await api.stopTraining();
      toast.success('تم إيقاف التدريب');
      setProgress(prev => ({ ...prev, active: false, status: 'idle' }));
    } catch (err) {
      toast.error('فشل إيقاف التدريب: ' + (err.message || ''));
    }
  };

  const statusLabels = {
    idle: 'في الانتظار',
    preprocessing: 'معالجة مسبقة...',
    extracting: 'استخراج الميزات...',
    training: 'جاري التدريب...',
    completed: 'اكتمل التدريب بنجاح ✓',
    error: 'فشل التدريب ✗',
  };

  const isError = progress.status === 'error' || (progress.message && progress.message.toLowerCase().includes('failed'));
  const isTrainingActive = (progress.status === 'training' || progress.active) && !isError;
  const isCompleted = progress.status === 'completed' && !isError;
  const isAnyActive = ['preprocessing', 'extracting', 'training'].includes(progress.status) || (progress.active && !isError);

  return (
    <div className={`rounded-xl p-4 space-y-3 transition-all border ${
      isError
        ? 'bg-danger/10 border-danger/30'
        : isTrainingActive
        ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10'
        : isCompleted
        ? 'bg-success/10 border-success/30'
        : 'bg-surface border-surface-light'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isError ? (
            <AlertCircle size={18} className="text-danger" />
          ) : (
            <Activity
              size={18}
              className={isAnyActive ? 'text-primary animate-pulse' : isCompleted ? 'text-success' : 'text-text-muted'}
            />
          )}
          <h3 className={`text-sm font-semibold ${
            isError ? 'text-danger' : isCompleted ? 'text-success' : ''
          }`}>
            {isError ? 'فشل التدريب ✗' : isCompleted ? 'اكتمل التدريب بنجاح ✓' : (statusLabels[progress.status] || progress.status)}
          </h3>
        </div>
        {isAnyActive && (
          <button
            onClick={handleStop}
            title="إيقاف التدريب"
            className="text-danger hover:text-danger/80 p-1 rounded-lg hover:bg-danger/10 transition-colors flex items-center gap-1 text-xs"
          >
            <StopCircle size={18} />
            <span>إيقاف</span>
          </button>
        )}
      </div>

      {/* Error state */}
      {isError && (
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 text-xs space-y-2">
          <p className="font-mono text-danger font-medium text-[11px]" dir="ltr">
            {progress.message}
          </p>
          <p className="text-text-muted leading-relaxed">
            سبب الفشل: لم يتم تنزيل النماذج المسبقة (Pretrained Base Models مثل f0G40k/f0D40k) داخل بيئة كولاب. قم بتشغيل خلية التحميل في كولاب لحل المشكلة فوراً.
          </p>
        </div>
      )}

      {/* Progress Bar & Details during Training */}
      {isTrainingActive && (
        <div className="space-y-2 pt-1">
          {/* Epoch & Percentage Header */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-text font-medium flex items-center gap-1">
              الحقبة: <span className="text-primary font-bold font-mono">{progress.epoch}</span> / {progress.totalEpochs || 100}
            </span>
            <span className="font-bold text-primary font-mono text-sm">
              {Math.round(progress.percentage || 0)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-surface-light rounded-full overflow-hidden p-0.5 border border-white/5 relative">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
              style={{
                width: `${Math.max(progress.percentage || 0, progress.epoch === 0 ? 5 : 0)}%`
              }}
            />
          </div>

          {/* Losses if available */}
          {(progress.loss_g > 0 || progress.loss_d > 0) && (
            <div className="flex gap-4 text-xs text-text-muted pt-1">
              <span>خسارة G: <span className="text-text font-mono font-medium">{progress.loss_g?.toFixed(4)}</span></span>
              <span>خسارة D: <span className="text-text font-mono font-medium">{progress.loss_d?.toFixed(4)}</span></span>
            </div>
          )}

          {/* Recent Server Log Message */}
          {progress.message && (
            <div className="bg-black/30 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-text-muted truncate max-w-full" dir="ltr">
              {progress.message}
            </div>
          )}
        </div>
      )}

      {/* Idle / general message if not error or active */}
      {!isTrainingActive && !isError && progress.message && (
        <p className="text-xs text-text-muted">{progress.message}</p>
      )}
    </div>
  );
}
