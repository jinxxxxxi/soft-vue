import { effect } from './effect'

class ComputedImpl {
  private _getter: any
  private _dirty: boolean = true
  private _value: any
  constructor(getter) {
    this._getter = getter
    // effect(getter)
  }

  get value() {
    if (this._dirty) {
      this._value = this._getter()
      this._dirty = false
      return this._value
    }
    return this._value
  }
}
export const computed = (getter) => {
  return new ComputedImpl(getter)
}
