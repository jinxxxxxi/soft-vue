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
