// @vitest-environment happy-dom
import 'fake-indexeddb/auto'
import { expect, it } from 'vitest'
import {
  indexedDBAdapter,
  localStorageAdapter,
  localStore,
} from '../localStore'
import { get } from 'svelte/store'
import { get as idbGet } from 'idb-keyval'

it('indexedDBAdapter', async () => {
  const store = localStore('settings', { theme: 'system' }, indexedDBAdapter())
  expect(get(store)).toEqual({ theme: 'system' })
  store.set({ theme: 'dark' })
  expect(get(store)).toEqual({ theme: 'dark' })
  await new Promise((resolve) => setTimeout(resolve, 0))
  expect(await idbGet('settings')).toEqual({ theme: 'dark' })
  const store2 = localStore('settings', { theme: 'light' }, indexedDBAdapter())
  expect(get(store2)).toEqual({ theme: 'light' })
  await new Promise((resolve) => setTimeout(resolve, 100))
  expect(get(store2)).toEqual({ theme: 'dark' })
})

it('localStorageAdapter', async () => {
  const store = localStore(
    'settings',
    { theme: 'system' },
    localStorageAdapter(),
  )
  expect(get(store)).toEqual({ theme: 'system' })
  store.set({ theme: 'dark' })
  expect(get(store)).toEqual({ theme: 'dark' })
  await new Promise((resolve) => setTimeout(resolve, 0))
  expect(localStorage.getItem('settings')).toEqual(
    JSON.stringify({ theme: 'dark' }),
  )
})

it('update', async () => {
  const store = localStore('settings', { theme: 'system' }, indexedDBAdapter())
  store.update((draft) => {
    draft.theme = 'dark'
    return draft
  })
  expect(get(store)).toEqual({ theme: 'dark' })
  await new Promise((resolve) => setTimeout(resolve, 0))
  expect(await idbGet('settings')).toEqual({ theme: 'dark' })
})
