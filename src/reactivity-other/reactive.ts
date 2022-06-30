export const reactive = (target) => {
  return new Proxy(target, {
    get: function (target, key) {
      return Reflect.get(target, key)
    },
    set: function (target, key, value) {
      return Reflect.set(target, key, value)
    }
  })
}
