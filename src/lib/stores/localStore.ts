import { type Writable, writable } from 'svelte/store'

export function localStore<T>(key: string, initial: T): Writable<T> {
  const toString = (value: T) => JSON.stringify(value, null, 2)
  const toObj = JSON.parse

  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, toString(initial))
  }

  const saved = toObj(localStorage.getItem(key)!)

  const { subscribe, set, update } = writable(saved)

  return {
    subscribe,
    set: (value) => {
      localStorage.setItem(key, toString(value))
      return set(value)
    },
    update,
  }
}
