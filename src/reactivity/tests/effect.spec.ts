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
  it('scheduler', () => {
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // // should not run yet
    expect(dummy).toBe(1)
    // // manually run
    run()
    // // should have run
    expect(dummy).toBe(2)
  })
})
