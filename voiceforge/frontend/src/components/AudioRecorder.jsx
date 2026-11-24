import { useState, useRef } from 'react';
import { Mic, Square, Upload } from 'lucide-react';
import { useAudioStore } from '../stores/audioStore';

export default function AudioRecorder() {
  const { isRecording, startRecording, stopRecording, setInputFile, inputUrl, recordedUrl } = useAudioStore();
  const fileRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);

  const handleRecord = async () => {
    if (isRecording) {
      clearInterval(timerRef.current);
      setDuration(0);
      await stopRecording();
    } else {
      await startRecording();
      const start = Date.now();
      timerRef.current = setInterval(() => setDuration(Math.floor((Date.now() - start) / 1000)), 100);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) setInputFile(file);
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const audioUrl = inputUrl || recordedUrl;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={handleRecord}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
            isRecording
              ? 'bg-danger text-white animate-pulse'
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
        >
          {isRecording ? <Square size={18} /> : <Mic size={18} />}
          {isRecording ? `إيقاف (${formatTime(duration)})` : 'تسجيل'}
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-light text-text hover:bg-surface transition-all"
        >
          <Upload size={18} />
          رفع ملف
        </button>
        <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleFile} />
      </div>

      {audioUrl && (
        <div className="bg-surface rounded-xl p-3">
          <audio src={audioUrl} controls className="w-full h-10" />
        </div>
      )}
    </div>
  );
}
