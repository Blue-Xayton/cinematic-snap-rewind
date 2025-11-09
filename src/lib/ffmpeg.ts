import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let isLoaded = false;

export const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpeg && isLoaded) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  isLoaded = true;
  return ffmpeg;
};

export const getFFmpeg = (): FFmpeg | null => ffmpeg;

export interface TrimOptions {
  startTime: number;
  endTime: number;
}

export interface TransitionType {
  type: 'fade' | 'slide' | 'zoom' | 'none';
  duration: number;
}

export const trimVideo = async (
  file: File,
  options: TrimOptions
): Promise<Blob> => {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  await ffmpeg.exec([
    '-i', inputName,
    '-ss', options.startTime.toString(),
    '-to', options.endTime.toString(),
    '-c', 'copy',
    outputName
  ]);

  const data = await ffmpeg.readFile(outputName);
  const uint8Array = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  // Create a new Uint8Array with regular ArrayBuffer for Blob compatibility
  const buffer = new Uint8Array(uint8Array);
  return new Blob([buffer], { type: 'video/mp4' });
};

export const mergeVideos = async (
  files: File[],
  transitions: TransitionType[] = []
): Promise<Blob> => {
  const ffmpeg = await loadFFmpeg();
  
  // Write all input files
  const inputNames: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const name = `input${i}.mp4`;
    inputNames.push(name);
    await ffmpeg.writeFile(name, await fetchFile(files[i]));
  }

  // Create concat file
  const concatContent = inputNames.map(name => `file '${name}'`).join('\n');
  await ffmpeg.writeFile('concat.txt', concatContent);

  const outputName = 'output.mp4';
  
  // Simple concatenation (transitions handled separately via filters)
  await ffmpeg.exec([
    '-f', 'concat',
    '-safe', '0',
    '-i', 'concat.txt',
    '-c', 'copy',
    outputName
  ]);

  const data = await ffmpeg.readFile(outputName);
  const uint8Array = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  // Create a new Uint8Array with regular ArrayBuffer for Blob compatibility
  const buffer = new Uint8Array(uint8Array);
  return new Blob([buffer], { type: 'video/mp4' });
};

export const applyFilters = async (
  file: File,
  filters: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
  }
): Promise<Blob> => {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const filterString = [
    filters.brightness !== undefined ? `eq=brightness=${filters.brightness}` : '',
    filters.contrast !== undefined ? `eq=contrast=${filters.contrast}` : '',
    filters.saturation !== undefined ? `eq=saturation=${filters.saturation}` : '',
  ].filter(Boolean).join(',');

  await ffmpeg.exec([
    '-i', inputName,
    '-vf', filterString || 'null',
    '-c:a', 'copy',
    outputName
  ]);

  const data = await ffmpeg.readFile(outputName);
  const uint8Array = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  // Create a new Uint8Array with regular ArrayBuffer for Blob compatibility
  const buffer = new Uint8Array(uint8Array);
  return new Blob([buffer], { type: 'video/mp4' });
};

export const addAudioToVideo = async (
  videoFile: File,
  audioFile: File,
  audioVolume: number = 0.5
): Promise<Blob> => {
  const ffmpeg = await loadFFmpeg();
  
  await ffmpeg.writeFile('video.mp4', await fetchFile(videoFile));
  await ffmpeg.writeFile('audio.mp3', await fetchFile(audioFile));

  await ffmpeg.exec([
    '-i', 'video.mp4',
    '-i', 'audio.mp3',
    '-c:v', 'copy',
    '-filter:a', `volume=${audioVolume}`,
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-shortest',
    'output.mp4'
  ]);

  const data = await ffmpeg.readFile('output.mp4');
  const uint8Array = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  // Create a new Uint8Array with regular ArrayBuffer for Blob compatibility
  const buffer = new Uint8Array(uint8Array);
  return new Blob([buffer], { type: 'video/mp4' });
};

export const convertToVertical = async (file: File): Promise<Blob> => {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // Convert to 1080x1920 (9:16 aspect ratio)
  await ffmpeg.exec([
    '-i', inputName,
    '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2',
    '-c:a', 'copy',
    outputName
  ]);

  const data = await ffmpeg.readFile(outputName);
  const uint8Array = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  // Create a new Uint8Array with regular ArrayBuffer for Blob compatibility
  const buffer = new Uint8Array(uint8Array);
  return new Blob([buffer], { type: 'video/mp4' });
};
