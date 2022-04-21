import { effect, stop } from '../effect'
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

  it('stop', () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    // obj.prop = 3
    obj.prop ++
    expect(dummy).toBe(2)
    // 再次调用runner可以重新启动effect
    runner()
    expect(dummy).toBe(3)
  })

  it('onStop', () => {
    const obj = reactive({
      foo: 1
    })
    const onStop = jest.fn()
    let dummy
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      {
        onStop
      }
    )

    stop(runner)
    expect(onStop).toBeCalledTimes(1)
  })
})
