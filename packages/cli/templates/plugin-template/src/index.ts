import * as novachat from '@novachat/plugin'

export async function activate() {
  console.log('Default model:', await novachat.model.getDefault())
}
