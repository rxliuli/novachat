import { describe, it, expect } from 'vitest'
import { updateText } from '../lib'
import path from 'path'
import { initTempPath } from '@liuli-util/test'
import { readFile, writeFile } from 'fs/promises'

const tempPath = initTempPath(__filename)

it('updateText', async () => {
  await writeFile(
    path.resolve(tempPath, 'package.json'),
    JSON.stringify({
      name: 'novachat.template',
    }),
  )
  await updateText({
    rootPath: tempPath,
    rules: [
      {
        path: 'package.json',
        replaces: [['novachat.template', 'novachat-plugin-test']],
      },
    ],
  })
  expect(
    JSON.parse(await readFile(path.resolve(tempPath, 'package.json'), 'utf-8')),
  ).toEqual({
    name: 'novachat-plugin-test',
  })
})

it("don't exist file", async () => {
  await expect(
    updateText({
      rootPath: tempPath,
      rules: [
        {
          path: 'not-exist-file',
          replaces: [['novachat.template', 'novachat-plugin-test']],
        },
      ],
    }),
  ).rejects.toThrow()
})
