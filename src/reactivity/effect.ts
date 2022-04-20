import { extend } from '../shared/index'
class ReactiveEffect {
  private _fn: any
  private active = true
  public deps: any[] = [] // 该effect对应的所有依赖； 每个值都是  target[key] 对应的所有依赖（Set类型）;
  public scheduler: Function | undefined
  public onStop: Function | undefined
  constructor(fn, scheduler?: Function) {
    this.scheduler = scheduler
    this._fn = fn
  }

  run() {
    activeEffect = this
    // 执行fn 并且将返回值抛出去
    return this._fn()
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}
let activeEffect: any = null
function cleanupEffect(effect) {
  // 将当前传入的effect依赖， 删除
  effect.deps.forEach((dep) => {
    dep.delete(effect)
  })
}
let targetMaps = new Map()
export const track = (target, key) => {
  // target => key => dep
  // 先取到target 再取key
  let depMaps = targetMaps.get(target) // 该target对应的所有依赖
  if (!depMaps) {
    depMaps = new Map()
    targetMaps.set(target, depMaps)
  }
  let dep = depMaps.get(key) // target[key] 对应的所有依赖
  if (!dep) {
    dep = new Set() // 依赖不能重复
    depMaps.set(key, dep)
  }
  if (!activeEffect) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}
export const trigger = (target, key) => {
  const depsMap = targetMaps.get(target)
  const dep = depsMap.get(key)
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

type effectOptions = {
  scheduler?: Function
  onStop?: Function
}

export const effect = (fn, options?: effectOptions) => {
  // 一个effect里面可能会有多个ref,会触发多次track
  const scheduler = options?.scheduler
  const _effect = new ReactiveEffect(fn, scheduler)
  extend(_effect, options)
  _effect.run()
  //绑定this,以防不测
  const runner: any = _effect.run.bind(_effect, fn)
  // impt: js里面函数也是对象，可以直接添加属性
  runner.effect = _effect
  return runner
}

export const stop = (runner) => {
  runner.effect.stop()
}
