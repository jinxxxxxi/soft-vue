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

  it('it should return runner', () => {
    let num = 0
    const runner: any = effect(() => {
      num++
      return num
    })
    expect(num).toBe(1)
    runner()
    expect(num).toBe(2)
    expect(runner()).toBe(3)
  })
})
