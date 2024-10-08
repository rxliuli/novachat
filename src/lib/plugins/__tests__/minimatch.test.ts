import { it, expect } from 'vitest'
import { minimatch } from 'minimatch'

it('minimatch', () => {
  expect(minimatch('foo.txt', '*.txt')).true
  expect(minimatch('foo.bar.txt', '*.txt')).true
  expect(minimatch('foo.bar', '*.txt')).false
  expect(minimatch('foo.bar', 'foo.bar')).true
})

