import type { SettingSchema } from '$lib/types/Settings'

export const settingSchemas: SettingSchema[] = [
  {
    title: 'system',
    properties: {
      theme: {
        type: 'string',
        enum: ['system', 'light', 'dark'],
        enumDescriptions: ['System', 'Light', 'Dark'],
        description: 'System theme',
        default: 'system',
      },
      defaultModel: {
        type: 'string',
        enum: [
          'gpt-4o',
          'gpt-4o-mini',
          'gpt-4',
          'gpt-3.5',
          'claude-3-5-sonnet@20240620',
        ],
        enumDescriptions: [
          'GPT-4o',
          'GPT-4o-mini',
          'GPT-4',
          'GPT-3.5',
          'Claude-3-5-Sonnet',
        ],
        description: 'Default model',
        default: 'gpt-4o',
      },
      apiKey: {
        type: 'string',
        description: 'API key',
        format: 'password',
      },
      baseUrl: {
        type: 'string',
        description: 'OpenAI base URL',
        format: 'url',
        default: 'https://api.openai.com/v1',
      },
    },
  },
]
