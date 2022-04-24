import { effect } from '../effect'
import { ref } from '../ref'
describe('ref', () => {
  it('happy path', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
  })

  it('should be reactive', () => {
    const a = ref(1)
    let dummy
    let calls = 0
    effect(() => {
      calls++
      dummy = a.value
    })
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
    // 相同的值不会二次出发trigger
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
  })

  it('should make nested properties reactive', () => {
    let b = { count: 1 }
    const a = ref(b)
    let dummy
    let count = 0
    effect(() => {
      dummy = a.value.count
      count++
    })
    expect(dummy).toBe(1)
    expect(count).toBe(1)
    a.value.count = 2
    expect(dummy).toBe(2)
    expect(count).toBe(2)
    a.value = b
    expect(dummy).toBe(2)
    expect(count).toBe(2)
  })
})
