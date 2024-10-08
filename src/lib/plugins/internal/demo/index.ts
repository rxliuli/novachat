import * as novachat from 'packages/plugin/dist'

export async function activate() {
  console.log(await novachat.setting.get('demo.key'))
  // await novachat.model.registerProvider({
  //   name: 'demo',
  //   models: [{ id: 'demo', name: 'demo' }],
  //   invoke: async () => {
  //     return {
  //       content: 'demo',
  //     }
  //   },
  //   async *stream() {
  //     yield { content: 'demo' }
  //   },
  // })
}
