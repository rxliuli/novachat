import { Jimp } from 'jimp'

export function calcImageSize(
  realSize: { w: number; h: number },
  maxSize: { w: number; h: number },
) {
  const { w: realW, h: realH } = realSize
  const { w: maxW, h: maxH } = maxSize
  if (realW <= maxW && realH <= maxH) {
    return { w: realW, h: realH }
  }
  const scale = Math.min(maxW / realW, maxH / realH)
  return {
    w: Math.round(realW * scale),
    h: Math.round(realH * scale),
  }
}

export async function optimizeImage(buffer: ArrayBuffer): Promise<string> {
  const image = await Jimp.read(buffer)
  const size = calcImageSize(
    { w: image.bitmap.width, h: image.bitmap.height },
    { w: 2000, h: 768 },
  )
  return await image.resize(size).getBase64('image/jpeg', {
    quality: 70,
  })
}
