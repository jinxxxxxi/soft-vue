import { trackEffects, triggerEffects, isTracking } from './effect'
import { reactive } from './reactive'
import { hasChanged, isObject } from '../shared/index'
class RefImpl {
  private _value
  private dep
  private _raw
  // 如果value是对象， 需要转化成reactive
  constructor(value) {
    this._value = convert(value)
    this._raw = value
    this.dep = new Set()
  }

  get value() {
    trackRefValue(this)
    return this._value
  }
  set value(newValue) {
    if (hasChanged(newValue, this._raw)) {
      this._value = newValue
      this._raw = convert(newValue)
      triggerEffects(this.dep)
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

export const ref = (value) => {
  // 之前reactive 因为是对象，所以可以proxy来拦截
  // 但是对于普通值类型来说，proxy显然没用，所以我们想到了class的get和set
  // IMPT:这就是为什么要挂载一个value

  return new RefImpl(value)
}
