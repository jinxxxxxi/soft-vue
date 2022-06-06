import { hasOwn } from '../shared/index'
const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots
}
export const PublicInstanceProxy = {
  get({ _: instance }, key) {
    const { setupState, props } = instance
    // 这个判断方式很新颖
    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (hasOwn(props, key)) {
      return props[key]
    }
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}
