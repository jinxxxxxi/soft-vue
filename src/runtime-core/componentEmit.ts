import { capitalize, camelize } from '../shared/index'
export function emit(instance, event, ...args) {
  const { props } = instance

  const toHandlerKey = (str: string) => {
    return str ? 'on' + capitalize(camelize(str)) : ''
  }
  const handler = props[toHandlerKey(event)]

  handler && handler(...args)
}
