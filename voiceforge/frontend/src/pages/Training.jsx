import { useState, useRef } from 'react';
import { Upload, Play, Loader2, FolderOpen } from 'lucide-react';
import TrainingProgress from '../components/TrainingProgress';
import api from '../services/api';
import toast from 'react-hot-toast';

const sampleRates = ['32000', '40000', '48000'];
const f0Methods = ['rmvpe', 'fcpe', 'crepe'];

export default function Training() {
  const fileRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [config, setConfig] = useState({
    model_name: '',
    sample_rate: '40000',
    f0_method: 'rmvpe',
    epochs: 100,
    batch_size: 8,
    save_frequency: 25,
  });
  const [step, setStep] = useState('upload'); // upload | preprocess | extract | train
  const [isLoading, setIsLoading] = useState(false);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selected]);
  };

  const handleUpload = async () => {
    if (!config.model_name) return toast.error('أدخل اسم النموذج');
    if (files.length === 0) return toast.error('أضف ملفات صوتية');

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('model_name', config.model_name);
      files.forEach(f => formData.append('files', f));
      await api.uploadDataset(formData);
      toast.success(`تم رفع ${files.length} ملف`);
      setStep('preprocess');
    } catch (err) {
      toast.error('فشل الرفع: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreprocess = async () => {
    setIsLoading(true);
    try {
      await api.preprocess({ model_name: config.model_name, sample_rate: parseInt(config.sample_rate) });
      toast.success('تمت المعالجة المسبقة');
      setStep('extract');
    } catch (err) {
      toast.error('فشلت المعالجة: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtract = async () => {
    setIsLoading(true);
    try {
      await api.extractFeatures({
        model_name: config.model_name,
        f0_method: config.f0_method,
        sample_rate: parseInt(config.sample_rate) || 40000
      });
      toast.success('تم استخراج الميزات');
      setStep('train');
    } catch (err) {
      toast.error('فشل الاستخراج: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrain = async () => {
    setIsLoading(true);
    try {
      await api.startTraining(config);
      toast.success('بدأ التدريب!');
    } catch (err) {
      toast.error('فشل بدء التدريب: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 py-4">
      <h2 className="text-xl font-bold">🧠 تدريب نموذج جديد</h2>

      {/* Model Name */}
      <div className="space-y-2">
        <label className="text-sm text-text-muted">اسم النموذج</label>
        <input
          type="text"
          value={config.model_name}
          onChange={(e) => setConfig(c => ({ ...c, model_name: e.target.value }))}
          placeholder="مثال: my_voice_model"
          className="w-full bg-surface-light text-text rounded-xl px-4 py-3 border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Step 1: Upload */}
      <div className={`bg-surface rounded-xl p-4 space-y-3 ${step !== 'upload' && step !== 'preprocess' ? 'opacity-50' : ''}`}>
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</span>
          رفع ملفات الصوت
        </h3>
        <button onClick={() => fileRef.current?.click()} className="w-full py-3 border-2 border-dashed border-surface-light rounded-xl text-text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
          <FolderOpen size={18} />
          اختر ملفات صوتية (WAV, MP3, FLAC)
        </button>
        <input ref={fileRef} type="file" accept="audio/*" multiple className="hidden" onChange={handleFiles} />
        {files.length > 0 && (
          <div className="text-xs text-text-muted">
            {files.length} ملف محدد • {(files.reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(1)} MB
          </div>
        )}
        {step === 'upload' && (
          <button onClick={handleUpload} disabled={isLoading} className="w-full py-3 rounded-xl bg-primary text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            رفع البيانات
          </button>
        )}
      </div>

      {/* Step 2: Preprocess */}
      <div className={`bg-surface rounded-xl p-4 space-y-3 ${step !== 'preprocess' ? 'opacity-50' : ''}`}>
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</span>
          معالجة مسبقة
        </h3>
        <div className="space-y-2">
          <label className="text-xs text-text-muted">معدل العيّنة</label>
          <div className="flex gap-2">
            {sampleRates.map(sr => (
              <button key={sr} onClick={() => setConfig(c => ({ ...c, sample_rate: sr }))}
                className={`flex-1 py-2 text-sm rounded-lg ${config.sample_rate === sr ? 'bg-primary text-white' : 'bg-surface-light text-text-muted'}`}>
                {parseInt(sr) / 1000}k
              </button>
            ))}
          </div>
        </div>
        {step === 'preprocess' && (
          <button onClick={handlePreprocess} disabled={isLoading} className="w-full py-3 rounded-xl bg-primary text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            بدء المعالجة
          </button>
        )}
      </div>

      {/* Step 3: Extract */}
      <div className={`bg-surface rounded-xl p-4 space-y-3 ${step !== 'extract' ? 'opacity-50' : ''}`}>
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">3</span>
          استخراج الميزات
        </h3>
        <div className="space-y-2">
          <label className="text-xs text-text-muted">خوارزمية F0</label>
          <div className="flex gap-2">
            {f0Methods.map(m => (
              <button key={m} onClick={() => setConfig(c => ({ ...c, f0_method: m }))}
                className={`flex-1 py-2 text-sm rounded-lg ${config.f0_method === m ? 'bg-primary text-white' : 'bg-surface-light text-text-muted'}`}>
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {step === 'extract' && (
          <button onClick={handleExtract} disabled={isLoading} className="w-full py-3 rounded-xl bg-primary text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            استخراج الميزات
          </button>
        )}
      </div>

      {/* Step 4: Train */}
      <div className={`bg-surface rounded-xl p-4 space-y-3 ${step !== 'train' ? 'opacity-50' : ''}`}>
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">4</span>
          التدريب
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted">عدد الحقب</label>
            <input type="number" value={config.epochs} onChange={(e) => setConfig(c => ({ ...c, epochs: parseInt(e.target.value) || 0 }))}
              className="w-full bg-surface-light text-text rounded-lg px-3 py-2 border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="text-xs text-text-muted">حجم الدفعة</label>
            <input type="number" value={config.batch_size} onChange={(e) => setConfig(c => ({ ...c, batch_size: parseInt(e.target.value) || 0 }))}
              className="w-full bg-surface-light text-text rounded-lg px-3 py-2 border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
        <div>
          <label className="text-xs text-text-muted">تردد الحفظ (كل X حقبة)</label>
          <input type="number" value={config.save_frequency} onChange={(e) => setConfig(c => ({ ...c, save_frequency: parseInt(e.target.value) || 0 }))}
            className="w-full bg-surface-light text-text rounded-lg px-3 py-2 border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        {step === 'train' && (
          <button onClick={handleTrain} disabled={isLoading} className="w-full py-3 rounded-xl bg-success text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            🚀 بدء التدريب
          </button>
        )}
      </div>

      {/* Training Progress */}
      <TrainingProgress />
    </div>
  );
}
