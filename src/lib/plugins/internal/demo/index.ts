import * as novachat from '@novachat/plugin'

export async function activate() {
  await novachat.model.registerProvider({
    name: 'demo',
    models: [{ id: 'demo', name: 'demo' }],
    invoke: async () => {
      throw new Error('not implemented')
    },
    async *stream() {
      throw new Error('not implemented')
    },
  })
}
