import { reactive, isReactive, isReadonly, readonly } from '../reactive'

describe('reactive', () => {
  it('should', () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    const readonlyObserved = readonly({ foo: 2 })
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)
    expect(isReadonly(readonlyObserved)).toBe(true)
  })
})
