import * as novachat from '@novachat/plugin'

export async function activate(context: novachat.PluginContext) {
  await novachat.model.registerProvider({
    name: 'OpenAI',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
      },
    ],
    async invoke(
      query: novachat.QueryRequest,
    ): Promise<novachat.QueryResponse> {
      throw new Error('Not implemented')
    },
    async *stream(
      query: novachat.QueryRequest,
    ): AsyncGenerator<novachat.QueryChunkResponse> {
      throw new Error('Not implemented')
    },
  })
}
