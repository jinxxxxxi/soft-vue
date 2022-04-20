import { mutableHandlers, readonlyHandlers } from './baseHandler'

export const reactive = (raw) => {
  return createReactiveObject(raw, mutableHandlers)
}

export const readonly = (raw) => {
  return createReactiveObject(raw, readonlyHandlers)
}
function createReactiveObject(target, baseHandles) {
  return new Proxy(target, baseHandles)
}
