import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers
} from './baseHandler'
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

export const reactive = (raw) => {
  return createReactiveObject(raw, mutableHandlers)
}

export const readonly = (raw) => {
  return createReactiveObject(raw, readonlyHandlers)
}

export const shallowReadonly = (raw) => {
  return createReactiveObject(raw, shallowReadonlyHandlers)
}

export const isReactive = (value) => {
  // IMPT: 强制类型转换，将undefined转化为false
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export const isReadonly = (value) => {
  return !!value[ReactiveFlags.IS_READONLY]
}
function createReactiveObject(target, baseHandles) {
  return new Proxy(target, baseHandles)
}
