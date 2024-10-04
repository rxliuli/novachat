import { defineMessaging } from '../messging'

// 只负责定义通信协议部分，具体由协议注册或调用命令则不关心
export interface PluginContext {
  pluginId: string
}

export type PluginExportType = {
  activate: (context: PluginContext) => void
}
export type PluginImportType = {
  register: (options: { id: string; cb: (...args: any[]) => any }) => void
  unregister: (options: { id: string }) => void
  execute: (options: { id: string; args?: any[] }) => any
}

export function defineWorkerProtocol() {
  return {
    onInit(activate: (c: PluginContext) => void) {
      defineMessaging<PluginExportType>().onMessage(self, 'activate', activate)
    },
    sendMessage<T extends keyof PluginImportType>(
      k: T,
      ...args: Parameters<PluginImportType[T]>
    ) {
      return defineMessaging<PluginImportType>().sendMessage(self, k, ...args)
    },
  }
}

let pluginContext: PluginContext = {} as any

function setPluginContext(context: PluginContext) {
  Object.assign(pluginContext, context)
}

export { defineMessaging, pluginContext, setPluginContext }
