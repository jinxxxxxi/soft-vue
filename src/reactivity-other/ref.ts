import { trackEffects, triggerEffects, isTracking } from './effect'
import { reactive } from './reactive'
import { isObject } from '../shared/index'
class RefImpl {
  private _value: any
  public dep: any = new Set()
  private _raw: any = null
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
