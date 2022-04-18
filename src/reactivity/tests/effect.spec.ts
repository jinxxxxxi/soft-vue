import { effect } from '../effect'
import { reactive } from '../reactive'

describe('effect', () => {
  it('happy path', () => {
    const data = reactive({ num: 1 })
    let nextNum
    effect(() => {
      nextNum = data.num + 1
    })
    expect(nextNum).toBe(2)
    data.num += 1
    expect(nextNum).toBe(3)
  })
})
