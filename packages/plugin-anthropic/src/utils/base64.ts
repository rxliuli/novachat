function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export async function getImageAsBase64(imageUrl: string): Promise<{
  media_type: string
  data: string
}> {
  // 检查是否已经是 data URL
  if (imageUrl.startsWith('data:')) {
    const [header, data] = imageUrl.split(',')
    const media_type = header.split(':')[1].split(';')[0]
    return { media_type, data }
  }
  // 如果不是 data URL，则按原方法处理
  const response = await fetch(imageUrl)
  const arrayBuffer = await response.arrayBuffer()
  // 将 ArrayBuffer 转换为 base64
  const base64 = arrayBufferToBase64(arrayBuffer)
  return {
    media_type: response.headers.get('content-type') || 'image/jpeg',
    data: base64,
  }
}
