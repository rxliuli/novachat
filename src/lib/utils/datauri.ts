export async function dataURItoBlob(dataURI: string) {
  const response = await fetch(dataURI)
  const blob = await response.blob()
  return blob
}

export function blobToDataURI(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = (e) => {
      reject(e)
    }
    reader.readAsDataURL(blob)
  })
}
