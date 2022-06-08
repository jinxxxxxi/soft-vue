import { getCurrentInstance } from './component'

export function provide(key, value) {
  // 存
  const currentInstance: any = getCurrentInstance()
  let { provides } = currentInstance
  const parentProvides = currentInstance.parent.provides
  // 优化：避免每次都重新赋值
  if (provides === parentProvides) {
    provides = currentInstance.provides = Object.create(provides)
  }
  provides[key] = value
}

export function inject(key, defaultValue?: any) {
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    const { parent } = currentInstance
    const { provides } = parent
    if (key in provides) {
      return provides[key]
    } else if (defaultValue) {
      if (typeof defaultValue === 'function') {
        return defaultValue()
      }
      return defaultValue
    }
  }
}
