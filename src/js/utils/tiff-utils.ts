type TiffDataArray = Uint8Array | Uint16Array | Float32Array | Float64Array;

export function tiffIfdToRgba(
  src: TiffDataArray,
  width: number,
  height: number,
  channels: number,
  photometricType: number
): Uint8ClampedArray {
  const totalPixels = width * height;
  const dst = new Uint8ClampedArray(totalPixels * 4);
  const isWhiteIsZero = photometricType === 0;

  let maxVal = 255;
  if (src instanceof Uint16Array) maxVal = 65535;
  else if (src instanceof Float32Array || src instanceof Float64Array)
    maxVal = 1;

  const norm = (v: number) => {
    if (maxVal === 255) return v;
    if (maxVal === 1) return Math.round(Math.min(1, Math.max(0, v)) * 255);
    return v >> 8;
  };

  for (let p = 0; p < totalPixels; p++) {
    const si = p * channels;
    const di = p * 4;

    if (channels >= 3) {
      dst[di] = norm(src[si]);
      dst[di + 1] = norm(src[si + 1]);
      dst[di + 2] = norm(src[si + 2]);
      dst[di + 3] = channels >= 4 ? norm(src[si + 3]) : 255;
    } else {
      let gray = norm(src[si]);
      if (isWhiteIsZero) gray = 255 - gray;
      dst[di] = gray;
      dst[di + 1] = gray;
      dst[di + 2] = gray;
      dst[di + 3] = channels === 2 ? norm(src[si + 1]) : 255;
    }
  }

  return dst;
}
