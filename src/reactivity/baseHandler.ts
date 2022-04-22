import { track, trigger } from './effect'
import { ReactiveFlags, reactive, readonly } from './reactive'
import {isObject} from '../shared/index'

// 性能优化，避免每次get/ser都执行一遍，先缓存一下；
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    console.log('zj target',target,key);
    
    const res = Reflect.get(target, key)
    // 如果当前是对象 就递归判断 ；
    if (isObject(res)) {
      return  isReadonly? readonly(res): reactive(res)
    }
    // 非对象才进行依赖收集
    if (!isReadonly) {
      track(target, key)
    }
    return res
  }
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}

export const mutableHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    // 使用set时给出警告
    console.warn(
      `key :"${String(key)}" set 失败，因为 target 是 readonly 类型`,
      target
    )
    return true
  }
}
