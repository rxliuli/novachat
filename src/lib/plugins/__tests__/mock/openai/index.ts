import * as novachat from 'packages/plugin/dist'

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
      return {
        content: 'hello world',
      }
    },
    async *stream(
      query: novachat.QueryRequest,
    ): AsyncGenerator<novachat.QueryChunkResponse> {
      yield { content: 'hello' }
      yield { content: ' world' }
    },
  })
}
