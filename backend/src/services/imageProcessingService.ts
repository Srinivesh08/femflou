import Jimp from 'jimp';

export interface QualityScores {
  brightnessScore: number;
  focusScore: number;
}

export async function computeQualityScores(buffer: Buffer): Promise<QualityScores> {
  const image = await Jimp.read(buffer);
  
  // Downscale slightly if huge to speed up computation
  if (image.bitmap.width > 800) {
    image.resize(800, Jimp.AUTO);
  }

  let totalLuminance = 0;
  
  // 1. Brightness: Average relative luminance
  // 2. Focus: Laplacian variance approximation on grayscale pixels
  // We'll gather grayscale values into a 2D array for the Laplacian filter
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const pixels: number[][] = Array.from({ length: height }, () => new Array(width).fill(0));

  image.scan(0, 0, width, height, function (x, y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    // Relative luminance
    const luminance = (0.299 * r) + (0.587 * g) + (0.114 * b);
    totalLuminance += luminance;
    pixels[y][x] = luminance;
  });

  const avgLuminance = totalLuminance / (width * height);
  const brightnessScore = Math.min(100, Math.max(0, (avgLuminance / 255) * 100));

  // Focus: Laplacian variance (3x3 kernel: [-1,-1,-1], [-1,8,-1], [-1,-1,-1])
  let laplacianSum = 0;
  let laplacianSqSum = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const v = 
        -pixels[y-1][x-1] - pixels[y-1][x] - pixels[y-1][x+1]
        -pixels[y][x-1]   + 8 * pixels[y][x] - pixels[y][x+1]
        -pixels[y+1][x-1] - pixels[y+1][x] - pixels[y+1][x+1];
      
      laplacianSum += v;
      laplacianSqSum += v * v;
      count++;
    }
  }

  const mean = laplacianSum / count;
  const variance = (laplacianSqSum / count) - (mean * mean);

  // Normalize variance to 0-100 (cap at e.g., 3000 which is typically "very sharp")
  const maxExpectedVariance = 3000;
  const focusScore = Math.min(100, Math.max(0, (variance / maxExpectedVariance) * 100));

  return {
    brightnessScore: parseFloat(brightnessScore.toFixed(2)),
    focusScore: parseFloat(focusScore.toFixed(2))
  };
}
