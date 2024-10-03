import { activate } from './index'
import { defineWorkerProtocol } from '../protocol'

defineWorkerProtocol().onInit(activate)
