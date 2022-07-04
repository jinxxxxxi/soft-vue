import { trackEffects, triggerEffects, isTracking } from './effect'
import { reactive } from './reactive'
import { isObject } from '../shared/index'
const RefFlag = {
  isRef: '__v_isref'
}
class RefImpl {
  private _value: any
  public dep: any = new Set()
  private _raw: any = null
  private _isref = true
  constructor(value) {
    this._raw = value
    this._value = isObject(value) ? reactive(value) : value
  }

  get value() {
    if (isTracking()) {
      trackEffects(this.dep)
    }
    return this._value
  }
  set value(newVal) {
    if (Object.is(newVal, this._raw)) return
    this._value = isObject(newVal) ? reactive(newVal) : newVal
    this._raw = newVal
    triggerEffects(this.dep)
  }
}

export const ref = (value) => {
  return new RefImpl(value)
}

export const isRef = (value) => {
  return !!value?.['_isref']
}
export const unRef = (value) => {
  if (value['_isref']) return value._raw
  return value
}

export const proxyRefs = (value) => {
  return new Proxy(value, {
    get(target, key) {
      const res = Reflect.get(target, key)
      if (isRef(res)) {
        return res.value
      }
      return res
    },
    set(target, key, newVal) {
      if (isRef(target[key]) && isRef(newVal)) {
        return Reflect.set(target, key, newVal)
      } else {
        return (target[key].value = newVal)
      }
    }
  })
}
