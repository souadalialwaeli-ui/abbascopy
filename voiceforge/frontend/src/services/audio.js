class AudioService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
  }

  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
      });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: this.getSupportedMimeType() });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.start(100);
      return true;
    } catch (err) {
      console.error('Recording error:', err);
      throw new Error('لم يتم السماح بالوصول إلى الميكروفون');
    }
  }

  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: this.getSupportedMimeType() });
        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  getSupportedMimeType() {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
  }

  createObjectURL(blob) {
    return URL.createObjectURL(blob);
  }

  revokeObjectURL(url) {
    URL.revokeObjectURL(url);
  }

  blobToFile(blob, filename) {
    return new File([blob], filename, { type: blob.type, lastModified: Date.now() });
  }
}

export const audioService = new AudioService();
export default audioService;
