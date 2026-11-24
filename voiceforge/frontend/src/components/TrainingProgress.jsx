import { useState, useEffect } from 'react';
import wsService from '../services/websocket';
import { Activity, StopCircle } from 'lucide-react';
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
  });

  useEffect(() => {
    const unsub = wsService.on('training_progress', (data) => {
      setProgress(prev => ({ ...prev, ...data }));
    });
    return unsub;
  }, []);

  const handleStop = async () => {
    try {
      await api.stopTraining();
      toast.success('تم إيقاف التدريب');
    } catch (err) {
      toast.error('فشل إيقاف التدريب');
    }
  };

  const statusLabels = {
    idle: 'في الانتظار',
    preprocessing: 'معالجة مسبقة...',
    extracting: 'استخراج الميزات...',
    training: 'جاري التدريب...',
    completed: 'مكتمل ✓',
    error: 'خطأ ✗',
  };

  const isActive = ['preprocessing', 'extracting', 'training'].includes(progress.status);

  return (
    <div className="bg-surface rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={18} className={isActive ? 'text-primary animate-pulse' : 'text-text-muted'} />
          <h3 className="text-sm font-semibold">{statusLabels[progress.status] || progress.status}</h3>
        </div>
        {isActive && (
          <button onClick={handleStop} className="text-danger hover:text-danger/80 transition-colors">
            <StopCircle size={20} />
          </button>
        )}
      </div>

      {progress.message && (
        <p className="text-xs text-text-muted">{progress.message}</p>
      )}

      {progress.status === 'training' && (
        <>
          <div className="flex justify-between text-xs text-text-muted">
            <span>الحقبة {progress.epoch} / {progress.totalEpochs}</span>
            <span>{Math.round(progress.percentage)}%</span>
          </div>
          <div className="h-2 bg-surface-light rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="flex gap-4 text-xs text-text-muted">
            <span>خسارة G: <span className="text-text font-mono">{progress.loss_g?.toFixed(4)}</span></span>
            <span>خسارة D: <span className="text-text font-mono">{progress.loss_d?.toFixed(4)}</span></span>
          </div>
        </>
      )}
    </div>
  );
}
