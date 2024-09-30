import { Jimp } from 'jimp'

function getImageSize(
  realSize: { w: number; h: number },
  maxSize: { w: number; h: number },
) {
  const { w: realW, h: realH } = realSize
  const { w: maxW, h: maxH } = maxSize
  const scale = Math.max(realW / maxW, realH / maxH)
  return {
    w: realW / scale,
    h: realH / scale,
  }
}

export async function optimizeImage(buffer: ArrayBuffer): Promise<string> {
  const image = await Jimp.read(buffer)
  const size = getImageSize(
    { w: image.bitmap.width, h: image.bitmap.height },
    { w: 2000, h: 768 },
  )
  return await image.resize(size).getBase64('image/jpeg', {
    quality: 70,
  })
}
