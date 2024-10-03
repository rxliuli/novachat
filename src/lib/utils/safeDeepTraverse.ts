export function safeDeepTraverse<T extends object>(
  obj: T,
  transformFunc: (obj: T) => any,
): any {
  if (Array.isArray(obj)) {
    return transformFunc(
      obj.map((item) => safeDeepTraverse(item, transformFunc)) as any,
    )
  } else if (
    obj !== null &&
    typeof obj === 'object' &&
    obj.constructor === Object
  ) {
    const result: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = safeDeepTraverse((obj as any)[key], transformFunc)
      }
    }
    return transformFunc(result)
  } else {
    return transformFunc(obj)
  }
}
