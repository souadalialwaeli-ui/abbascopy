import { useAudioStore } from '../stores/audioStore';

function Slider({ label, value, onChange, min, max, step, unit = '' }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm text-text-muted">{label}</label>
        <span className="text-sm text-primary font-mono">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

const f0Methods = [
  { value: 'rmvpe', label: 'RMVPE' },
  { value: 'fcpe', label: 'FCPE' },
  { value: 'crepe', label: 'Crepe' },
  { value: 'pm', label: 'PM' },
];

export default function ParameterSliders() {
  const {
    pitch, f0Method, indexRate, filterRadius, volumeEnvelope, protectVoiceless,
    setPitch, setF0Method, setIndexRate, setFilterRadius, setVolumeEnvelope, setProtectVoiceless,
  } = useAudioStore();

  return (
    <div className="space-y-4 bg-surface rounded-xl p-4">
      <h3 className="text-sm font-semibold text-text">معاملات التحويل</h3>

      <Slider label="تغيير النغمة (Pitch)" value={pitch} onChange={setPitch} min={-24} max={24} step={1} unit=" نصف نغمة" />

      <div className="space-y-1">
        <label className="text-sm text-text-muted">خوارزمية F0</label>
        <div className="flex gap-2">
          {f0Methods.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setF0Method(value)}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                f0Method === value
                  ? 'bg-primary text-white'
                  : 'bg-surface-light text-text-muted hover:text-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Slider label="معدل الفهرس (Index Rate)" value={indexRate} onChange={setIndexRate} min={0} max={1} step={0.05} />
      <Slider label="نصف قطر الفلتر" value={filterRadius} onChange={setFilterRadius} min={0} max={7} step={1} />
      <Slider label="غلاف الصوت" value={volumeEnvelope} onChange={setVolumeEnvelope} min={0} max={1} step={0.05} />
      <Slider label="حماية الحروف الساكنة" value={protectVoiceless} onChange={setProtectVoiceless} min={0} max={0.5} step={0.01} />
    </div>
  );
}
