import { effect } from './effect'
export const computed = (fn) => {
  return effect(fn)
}
