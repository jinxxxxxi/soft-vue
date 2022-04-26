import { computed } from '../computed'
import { reactive } from '../reactive'

describe('computed', () => {
  it('happy path', () => {
    const user = reactive({
      age: 1
    })

    const age: any = computed(() => {
      return user.age
    })

    expect(age.value).toBe(1)
  })

  it('should compute lazily', () => {
    const value = reactive({
      foo: 1
    })
    const getter = jest.fn(() => {
      return value.foo
    })
    const cValue = computed(getter)

    // 不会被立即执行
    expect(getter).not.toHaveBeenCalled()

    // 第一次取值value时会执行一次

    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    // 取值时不会调用getter
    cValue.value // get
    expect(getter).toHaveBeenCalledTimes(1)

    // set时也不会调用getter
    // 因为foo是响应式的，set会触发trigger,然后effect执行，然后触发get重新收集依赖
    // 所以需要引入ReactiveEffect来在触发trigger时做一些拦截操作
    value.foo = 2
    expect(getter).toHaveBeenCalledTimes(1)

    // set之后再取值，会重新触发getter
    expect(cValue.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)

    // should not compute again
    cValue.value
    expect(getter).toHaveBeenCalledTimes(2)
  })
})
