export interface ClipAnalysis {
  visualScore: number;
  brightness: number;
  contrast: number;
  colorfulness: number;
  hasMotion: boolean;
}

export const analyzeClip = async (file: File): Promise<ClipAnalysis> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    video.src = URL.createObjectURL(file);
    video.muted = true;

    video.addEventListener('loadedmetadata', () => {
      canvas.width = 320; // Analyze at lower resolution for speed
      canvas.height = 180;
      
      // Seek to middle of video for analysis
      video.currentTime = video.duration / 2;
    });

    video.addEventListener('seeked', () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      let totalBrightness = 0;
      let totalRed = 0;
      let totalGreen = 0;
      let totalBlue = 0;
      const pixelCount = pixels.length / 4;

      // Calculate brightness and color values
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        totalRed += r;
        totalGreen += g;
        totalBlue += b;
        
        // Luminance formula
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
        totalBrightness += brightness;
      }

      const avgBrightness = totalBrightness / pixelCount;
      const avgRed = totalRed / pixelCount;
      const avgGreen = totalGreen / pixelCount;
      const avgBlue = totalBlue / pixelCount;

      // Calculate color variance (colorfulness)
      let colorVariance = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        colorVariance += Math.pow(r - avgRed, 2);
        colorVariance += Math.pow(g - avgGreen, 2);
        colorVariance += Math.pow(b - avgBlue, 2);
      }
      const colorfulness = Math.sqrt(colorVariance / (pixelCount * 3)) / 255;

      // Calculate contrast
      let minBrightness = 255;
      let maxBrightness = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const brightness = (0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]);
        minBrightness = Math.min(minBrightness, brightness);
        maxBrightness = Math.max(maxBrightness, brightness);
      }
      const contrast = (maxBrightness - minBrightness) / 255;

      // Simple motion detection (would need multiple frames for accuracy)
      const hasMotion = video.duration > 1; // Placeholder

      // Calculate overall visual score (0-1)
      const visualScore = (
        (avgBrightness / 255) * 0.3 +
        contrast * 0.3 +
        colorfulness * 0.3 +
        (hasMotion ? 0.1 : 0)
      );

      URL.revokeObjectURL(video.src);

      resolve({
        visualScore,
        brightness: avgBrightness / 255,
        contrast,
        colorfulness,
        hasMotion,
      });
    });
  });
};

export const selectBestClips = async (
  files: File[],
  targetDuration: number = 30
): Promise<File[]> => {
  const analyses = await Promise.all(
    files.map(async (file) => ({
      file,
      analysis: await analyzeClip(file),
    }))
  );

  // Sort by visual score
  analyses.sort((a, b) => b.analysis.visualScore - a.analysis.visualScore);

  // Select clips until we reach target duration
  const selected: File[] = [];
  let totalDuration = 0;

  for (const { file } of analyses) {
    if (totalDuration >= targetDuration) break;
    
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    
    await new Promise((resolve) => {
      video.addEventListener('loadedmetadata', () => {
        totalDuration += video.duration;
        URL.revokeObjectURL(video.src);
        resolve(null);
      });
    });
    
    selected.push(file);
  }

  return selected;
};
