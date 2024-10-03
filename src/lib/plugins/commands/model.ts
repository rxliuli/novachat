import { get } from 'svelte/store'
import {
  type Model,
  type QueryChunkResponse,
  type QueryRequest,
  type QueryResponse,
} from '../client/plugin'
import { pluginStore, type ActivatedModel } from '../store'

interface SystemCommandType {
  'model.getDefault': () => Promise<Model | undefined>
  'model.invoke': (query: QueryRequest) => Promise<QueryResponse>
  'model.stream': (
    query: QueryRequest,
    cb: (chunk: QueryChunkResponse) => Promise<void>,
  ) => Promise<void>
  'model.register': (models: ActivatedModel[]) => void
}

export function createModelCommand() {
  pluginStore.addCommand({
    id: 'model.getDefault',
    type: 'system',
    handler: () => pluginStore.getDefaultModel(),
  })
  pluginStore.addCommand({
    id: 'model.invoke',
    type: 'system',
    handler: async (query: QueryRequest): Promise<QueryResponse> => {
      return requestLLM(query.model, false)(query)
    },
  })
  pluginStore.addCommand({
    id: 'model.stream',
    type: 'system',
    handler: async (
      query: QueryRequest,
      cb: (chunk: QueryChunkResponse) => Promise<void>,
    ): Promise<void> => {
      return requestLLM(query.model, true)(query, cb)
    },
  })
  pluginStore.addCommand({
    id: 'model.register',
    type: 'system',
    handler: (models: ActivatedModel[]) => pluginStore.registerModels(models),
  })
}

function requestLLM(modelName: string, stream?: boolean) {
  const store = get(pluginStore)
  const model = store.models.find((it) => it.id === modelName)
  if (!model) {
    throw new Error(`Model not found: ${modelName}`)
  }
  const command = stream ? model.command.stream : model.command.invoke
  const cmd = store.commands.find((it) => it.id === command)
  if (!cmd) {
    throw new Error(`Command not found: ${command}`)
  }
  return cmd.handler
}
