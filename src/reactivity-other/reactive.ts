import { isObject } from '../shared/index'
import { track, trigger } from './effect'
const ReactiveFlags = {
  isReactive: '__v__is_reactive',
  isReadonly: '__v__is_readonly',
  Raw: '__v__toRaw'
}

export const reactive = (target) => {
  return new Proxy(target, {
    get: function (target, key) {
      if (key === ReactiveFlags.isReactive) {
        return true
      }
      if (key === ReactiveFlags.isReadonly) {
        return true
      }
      if (key === ReactiveFlags.Raw) {
        return target
      }
      const res = Reflect.get(target, key)
      if (isObject(res)) {
        return reactive(res)
      }
      track(target, key)
      return res
    },
    set: function (target, key, value) {
      const res = Reflect.set(target, key, value)
      trigger(target, key)
      return res
    }
  })
}

export const isReactive = (obj) => {
  return !!obj[ReactiveFlags.isReactive]
}
export const isReadonly = (obj) => {
  return !!obj[ReactiveFlags.isReadonly]
}

export const toRaw = (obj) => {
  const raw = obj && obj[ReactiveFlags.Raw]
  return raw ? raw : obj
}
