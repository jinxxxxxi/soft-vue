import { track, trigger } from './effect'
export const reactive = (raw) => {
  return new Proxy(raw, {
    get(target, key) {
      const res = Reflect.get(target, key)
      // TODO: 收集依赖
      track(target, key)
      return res
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value)
      trigger(target, key)
      // TODO: 触发依赖
      return res
    }
  })
}
