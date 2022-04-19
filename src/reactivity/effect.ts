class ReactiveEffect {
  private _fn: any
  public scheduler: Function | undefined
  constructor(fn, scheduler?: Function) {
    this.scheduler = scheduler
    this._fn = fn
  }

  run() {
    activeEffect = this
    // 执行fn 并且将返回值抛出去
    return this._fn()
  }
}
let activeEffect: any = null

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
  dep.add(activeEffect)
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
}

export const effect = (fn, options?: effectOptions) => {
  const scheduler = options?.scheduler
  const _effect = new ReactiveEffect(fn, scheduler)
  _effect.run()
  //绑定this,以防不测
  return _effect.run.bind(_effect, fn)
}
