let targetMaps = new Map()
let activeEffect: any = undefined
let shouldTrack = false

class ReactiveEffect {
  private _fn: any
  public deps: any[] = []

  constructor(fn) {
    this._fn = fn
  }
  run() {
    activeEffect = this
    shouldTrack = true
    this._fn()
    shouldTrack = false
  }
}

export const isTracking = () => {
  console.log('zj isTrack', shouldTrack, activeEffect)

  return shouldTrack && activeEffect !== undefined
}
export const effect = (fn) => {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

export const track = (target, key) => {
  if (!isTracking()) return

  let depMaps = targetMaps.get(target)
  if (!depMaps) {
    depMaps = new Map()
    targetMaps.set(target, depMaps)
  }

  let dep = depMaps.get(key)
  if (!dep) {
    dep = new Set()
    depMaps.set(key, dep)
  }
  trackEffects(dep)
}

export const trackEffects = (dep) => {
  if (dep.has(activeEffect)) {
    return
  }
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export const trigger = (target, key) => {
  const depMaps = targetMaps.get(target)
  const dep = depMaps.get(key)
  triggerEffects(dep)
}

export const triggerEffects = (dep) => {
  if (dep) {
    for (const effect of dep) {
      console.log('trigger', effect)
      effect.run()
    }
  }
}
