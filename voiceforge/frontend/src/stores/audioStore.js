import { create } from 'zustand';
import api from '../services/api';
import audioService from '../services/audio';
import toast from 'react-hot-toast';

export const useAudioStore = create((set, get) => ({
  // Recording
  isRecording: false,
  recordedBlob: null,
  recordedUrl: null,

  // Input audio
  inputFile: null,
  inputUrl: null,

  // Output
  outputBlob: null,
  outputUrl: null,

  // Inference params
  pitch: 0,
  f0Method: 'rmvpe',
  indexRate: 0.5,
  filterRadius: 3,
  volumeEnvelope: 0.25,
  protectVoiceless: 0.33,

  // State
  isProcessing: false,
  progress: 0,

  // ─── Recording ───
  startRecording: async () => {
    try {
      await audioService.startRecording();
      set({ isRecording: true, recordedBlob: null, recordedUrl: null });
    } catch (err) {
      toast.error(err.message);
    }
  },

  stopRecording: async () => {
    const blob = await audioService.stopRecording();
    if (blob) {
      const url = audioService.createObjectURL(blob);
      set({
        isRecording: false,
        recordedBlob: blob,
        recordedUrl: url,
        inputFile: audioService.blobToFile(blob, 'recording.webm'),
        inputUrl: url,
      });
    } else {
      set({ isRecording: false });
    }
  },

  // ─── File Input ───
  setInputFile: (file) => {
    const prev = get().inputUrl;
    if (prev) audioService.revokeObjectURL(prev);
    const url = audioService.createObjectURL(file);
    set({ inputFile: file, inputUrl: url, recordedBlob: null, recordedUrl: null });
  },

  clearInput: () => {
    const { inputUrl, recordedUrl } = get();
    if (inputUrl) audioService.revokeObjectURL(inputUrl);
    if (recordedUrl) audioService.revokeObjectURL(recordedUrl);
    set({ inputFile: null, inputUrl: null, recordedBlob: null, recordedUrl: null });
  },

  // ─── Params ───
  setPitch: (v) => set({ pitch: v }),
  setF0Method: (v) => set({ f0Method: v }),
  setIndexRate: (v) => set({ indexRate: v }),
  setFilterRadius: (v) => set({ filterRadius: v }),
  setVolumeEnvelope: (v) => set({ volumeEnvelope: v }),
  setProtectVoiceless: (v) => set({ protectVoiceless: v }),

  // ─── Inference ───
  runInference: async (pthPath, indexPath) => {
    const { inputFile, pitch, f0Method, indexRate, filterRadius, volumeEnvelope, protectVoiceless } = get();
    if (!inputFile) {
      toast.error('الرجاء رفع أو تسجيل ملف صوتي أولاً');
      return;
    }
    if (!pthPath) {
      toast.error('الرجاء اختيار نموذج صوتي');
      return;
    }

    set({ isProcessing: true, progress: 0, outputBlob: null, outputUrl: null });

    try {
      const formData = new FormData();
      formData.append('audio', inputFile);
      formData.append('pth_path', pthPath);
      if (indexPath) formData.append('index_path', indexPath);
      formData.append('pitch', pitch);
      formData.append('f0_method', f0Method);
      formData.append('index_rate', indexRate);
      formData.append('filter_radius', filterRadius);
      formData.append('volume_envelope', volumeEnvelope);
      formData.append('protect_voiceless', protectVoiceless);

      const blob = await api.runInference(formData);
      const url = audioService.createObjectURL(blob);
      set({ outputBlob: blob, outputUrl: url, progress: 100 });
      toast.success('تم تحويل الصوت بنجاح!');
    } catch (err) {
      toast.error('فشل التحويل: ' + err.message);
    } finally {
      set({ isProcessing: false });
    }
  },

  clearOutput: () => {
    const { outputUrl } = get();
    if (outputUrl) audioService.revokeObjectURL(outputUrl);
    set({ outputBlob: null, outputUrl: null, progress: 0 });
  },

  downloadOutput: () => {
    const { outputBlob } = get();
    if (!outputBlob) return;
    const url = audioService.createObjectURL(outputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voiceforge_output_${Date.now()}.wav`;
    a.click();
    audioService.revokeObjectURL(url);
  },
}));
