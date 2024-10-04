import { activate } from './index'
import { defineWorkerProtocol, setPluginContext } from './protocol'

defineWorkerProtocol().onInit((c) => {
  setPluginContext(c)
  activate(c)
})
