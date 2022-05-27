export const extend = Object.assign

export const isObject = (value) => {
  return value !== null && typeof value === 'object'
}

export const hasChanged = (newVal, oldVal) => {
  return !Object.is(newVal, oldVal)
}

export const hasOwn = (val, key) => {
  return Object.prototype.hasOwnProperty.call(val, key)
}

export const camelize = (str) => {
  return str.replace(/\-(\w)/g, function (_, c: string) {
    return c ? c.toUpperCase() : ''
  })
}

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
