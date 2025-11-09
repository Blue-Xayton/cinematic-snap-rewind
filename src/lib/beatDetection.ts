export interface BeatDetectionResult {
  beats: number[];
  tempo: number;
  waveformData: number[];
}

export const detectBeats = async (audioFile: File): Promise<BeatDetectionResult> => {
  const audioContext = new AudioContext();
  const arrayBuffer = await audioFile.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Get channel data
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

  // Calculate waveform data for visualization (downsample for performance)
  const waveformSamples = 500;
  const blockSize = Math.floor(channelData.length / waveformSamples);
  const waveformData: number[] = [];

  for (let i = 0; i < waveformSamples; i++) {
    const start = i * blockSize;
    const end = start + blockSize;
    let sum = 0;
    for (let j = start; j < end && j < channelData.length; j++) {
      sum += Math.abs(channelData[j]);
    }
    waveformData.push(sum / blockSize);
  }

  // Simple beat detection using amplitude peaks
  const beats: number[] = [];
  const windowSize = Math.floor(sampleRate * 0.1); // 100ms window
  const threshold = 0.7; // Amplitude threshold

  // Calculate average energy
  let totalEnergy = 0;
  for (let i = 0; i < channelData.length; i++) {
    totalEnergy += Math.abs(channelData[i]);
  }
  const avgEnergy = totalEnergy / channelData.length;

  // Find peaks
  for (let i = windowSize; i < channelData.length - windowSize; i += windowSize) {
    let windowEnergy = 0;
    for (let j = i; j < i + windowSize; j++) {
      windowEnergy += Math.abs(channelData[j]);
    }
    windowEnergy /= windowSize;

    if (windowEnergy > avgEnergy * threshold) {
      const timeInSeconds = i / sampleRate;
      // Avoid beats too close together (minimum 0.3s apart)
      if (beats.length === 0 || timeInSeconds - beats[beats.length - 1] > 0.3) {
        beats.push(timeInSeconds);
      }
    }
  }

  // Calculate tempo (BPM) from beat intervals
  let tempo = 120; // Default
  if (beats.length > 1) {
    const intervals = [];
    for (let i = 1; i < beats.length; i++) {
      intervals.push(beats[i] - beats[i - 1]);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    tempo = Math.round(60 / avgInterval);
  }

  await audioContext.close();

  return {
    beats,
    tempo,
    waveformData,
  };
};

export const analyzeAudioMood = (tempo: number): 'upbeat' | 'emotional' => {
  return tempo > 110 ? 'upbeat' : 'emotional';
};
