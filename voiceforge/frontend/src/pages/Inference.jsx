import { useAudioStore } from '../stores/audioStore';
import { useModelStore } from '../stores/modelStore';
import AudioRecorder from '../components/AudioRecorder';
import ModelSelector from '../components/ModelSelector';
import ParameterSliders from '../components/ParameterSliders';
import { Wand2, Download, Loader2, Trash2 } from 'lucide-react';

export default function Inference() {
  const { outputUrl, outputBlob, isProcessing, runInference, clearOutput, downloadOutput } = useAudioStore();
  const { selectedModel, selectedIndex } = useModelStore();

  const handleConvert = () => runInference(selectedModel, selectedIndex);

  return (
    <div className="space-y-5 py-4">
      <h2 className="text-xl font-bold">🎤 تحويل الصوت</h2>

      {/* Model Selection */}
      <ModelSelector />

      {/* Audio Input */}
      <div className="space-y-2">
        <label className="text-sm text-text-muted">الصوت المصدر</label>
        <AudioRecorder />
      </div>

      {/* Parameters */}
      <ParameterSliders />

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={isProcessing}
        className="w-full py-4 rounded-xl bg-primary text-white font-semibold text-lg flex items-center justify-center gap-2 hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 size={22} className="animate-spin" /> جاري التحويل...
          </>
        ) : (
          <>
            <Wand2 size={22} /> تحويل الصوت
          </>
        )}
      </button>

      {/* Output */}
      {outputUrl && (
        <div className="bg-surface rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-success">✓ الصوت المُحوَّل</h3>
            <button onClick={clearOutput} className="text-text-muted hover:text-danger transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
          <audio src={outputUrl} controls className="w-full h-10" />
          <button
            onClick={downloadOutput}
            className="w-full py-2.5 rounded-lg bg-surface-light text-text flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
          >
            <Download size={16} /> تنزيل الملف
          </button>
        </div>
      )}
    </div>
  );
}
