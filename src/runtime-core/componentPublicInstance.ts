const publicPropertiesMap = {
  $el: (i) => i.vnode.el
}
export const PublicInstanceProxy = {
  get({ _: instance }, key) {
    const { setupState } = instance
    // 这个判断方式很新颖
    if (key in setupState) {
      console.log('key', key)

      return setupState[key]
    }
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}
