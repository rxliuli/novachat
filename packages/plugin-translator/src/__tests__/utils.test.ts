import { beforeEach, describe, expect, it, Mock, vi } from 'vitest'
import { getMessages, parseEntities, translate } from '../utils'

it('parseEntities', async () => {
  expect(
    parseEntities('original 1: translated 1\noriginal 2: translated 2'),
  ).toEqual([
    ['original 1', 'translated 1'],
    ['original 2', 'translated 2'],
  ])
  expect(parseEntities('Example：示例')).toEqual([['Example', '示例']])
})

describe('getMessages', () => {
  it('getMessages', () => {
    expect(
      getMessages({
        systemPrompt:
          'You are a professional, authentic machine translation engine. Translate the following source text to {{to}}, Output translation directly without any additional text.\nTranslate the following entities: \n{{entities}}',
        entities: [['Example', '示例']],
        content: 'Example',
        toLanguage: 'zh-CN',
      }),
    ).toEqual([
      {
        role: 'system',
        content:
          'You are a professional, authentic machine translation engine. Translate the following source text to zh-CN, Output translation directly without any additional text.\nTranslate the following entities: \nExample: 示例',
      },
      {
        role: 'user',
        content: 'Example',
      },
    ])
  })
  it('getMessages with no match entities', () => {
    expect(
      getMessages({
        systemPrompt:
          'You are a professional, authentic machine translation engine. Translate the following source text to {{to}}, Output translation directly without any additional text.\nTranslate the following entities: \n{{entities}}',
        entities: [['Example', '示例']],
        content: 'Test',
        toLanguage: 'zh-CN',
      }),
    ).toEqual([
      {
        role: 'system',
        content:
          'You are a professional, authentic machine translation engine. Translate the following source text to zh-CN, Output translation directly without any additional text.\nTranslate the following entities: \n',
      },
      {
        role: 'user',
        content: 'Test',
      },
    ])
  })
  it('getMessages with lower case entities', () => {
    expect(
      getMessages({
        systemPrompt:
          'You are a professional, authentic machine translation engine. Translate the following source text to {{to}}, Output translation directly without any additional text.\nTranslate the following entities: \n{{entities}}',
        entities: [['example', '示例']],
        content: 'example',
        toLanguage: 'zh-CN',
      }),
    ).toEqual([
      {
        role: 'system',
        content:
          'You are a professional, authentic machine translation engine. Translate the following source text to zh-CN, Output translation directly without any additional text.\nTranslate the following entities: \nexample: 示例',
      },
      {
        role: 'user',
        content: 'example',
      },
    ])
  })
})

describe('translate', () => {
  let f1: Mock = vi.fn().mockImplementation(async function* (q) {
    yield {
      content: q.messages[1].content,
    }
  })
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('translate stream', async () => {
    const stream = translate({
      systemPrompt:
        'You are a professional, authentic machine translation engine. Translate the following source text to {{to}}, Output translation directly without any additional text.',
      entities: [],
      content: 'Example',
      toLanguage: 'zh-CN',
      model: 'gpt-4o',
      t: f1,
    })
    for await (const it of stream) {
      expect(it.content).eq('Example')
    }
    expect(f1).toHaveBeenCalledTimes(1)
  })
  it('split chunks', async () => {
    const stream = translate({
      systemPrompt:
        'You are a professional, authentic machine translation engine. Translate the following source text to {{to}}, Output translation directly without any additional text.',
      entities: [],
      content: 'Example 1\n\n---\n\nExample 2',
      toLanguage: 'zh-CN',
      model: 'gpt-4o',
      t: f1,
    })
    const r: string[] = []
    for await (const it of stream) {
      r.push(it.content)
    }
    expect(f1).toHaveBeenCalledTimes(2)
    expect(f1.mock.calls[0][0].messages[1].content).eq('Example 1')
    expect(f1.mock.calls[1][0].messages[1].content).eq('Example 2')
    expect(r).toEqual(['Example 1', '\n\n---\n\n', 'Example 2'])
  })
})
