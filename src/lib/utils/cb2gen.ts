export async function* cb2gen<T>(
  handler: (cb: (chunk: T) => void) => Promise<void>,
  abortSignal?: AbortSignal,
): AsyncGenerator<T> {
  const result: T[] = []
  let done = false,
    error: Error | null = null
  handler((chunk) => {
    result.push(chunk)
  })
    .then(() => {
      done = true
    })
    .catch((err) => {
      error = err
    })
  while (true) {
    let temp = result.shift()
    if (abortSignal?.aborted) {
      return
    }
    while (temp) {
      yield temp
      temp = result.shift()
    }
    if (done) {
      break
    }
    if (error) {
      throw error
    }
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}
