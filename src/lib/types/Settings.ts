import { type Schema } from 'jsonschema'

export type SettingSchema = {
  title: string
  properties: Record<
    string,
    Schema & {
      enumDescriptions?: string[]
      default?: string
      format?: 'password' | 'url'
    }
  >
}
