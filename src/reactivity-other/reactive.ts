const ReactiveStatus = {
  isReactive: '__v__is_reactive',
  isReadonly: '__v__is_readonly'
}

export const reactive = (target) => {
  return new Proxy(target, {
    get: function (target, key) {
      if (key === ReactiveStatus.isReactive) {
        return true
      }
      if (key === ReactiveStatus.isReadonly) {
        return true
      }
      return Reflect.get(target, key)
    },
    set: function (target, key, value) {
      return Reflect.set(target, key, value)
    }
  })
}

export const isReactive = (obj) => {
  return !!obj[ReactiveStatus.isReactive]
}
export const isReadonly = (obj) => {
  return !!obj[ReactiveStatus.isReadonly]
}
