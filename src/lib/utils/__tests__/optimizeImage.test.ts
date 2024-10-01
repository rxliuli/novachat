import { expect, it } from 'vitest'
import { calcImageSize } from '../optimizeImage'

it('calcImageSize', () => {
  expect(calcImageSize({ w: 4000, h: 1536 }, { w: 2000, h: 768 })).toEqual({
    w: 2000,
    h: 768,
  })
  expect(calcImageSize({ w: 400, h: 300 }, { w: 2000, h: 768 })).toEqual({
    w: 400,
    h: 300,
  })
})
