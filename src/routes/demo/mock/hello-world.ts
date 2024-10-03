import * as novachat from '@novachat/plugin'

export async function activate() {
  console.log('plugin activate')
  // console.log(await novachat.models.getDefault())
  // const res = await models.invoke({
  //   messages: [
  //     {
  //       from: 'user',
  //       content: 'Hello',
  //     },
  //   ],
  //   model: 'gpt-4o',
  // })
  // console.log('plugin invoke system', res)
  // const stream =  novachat.models.stream({
  //   messages: [{ from: 'user', content: 'Hello' }],
  //   model: 'gpt-4o',
  // })
  // for await (const it of stream) {
  //   console.log('chunk', it)
  // }
}
