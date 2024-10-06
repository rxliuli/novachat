import './addInterceptor'
import { activate } from './index'
import {
  defineWorkerProtocol,
  setPluginContext,
} from '@novachat/plugin/internal'

defineWorkerProtocol().onInit((c) => {
  setPluginContext(c)
  activate(c)
})
