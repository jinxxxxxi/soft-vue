import { initProps } from './componentProps'
import { PublicInstanceProxy } from './componentPublicInstance'
import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initSlots } from './componentSlots'

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    name: vnode.type.name,
    slots: {},
    emit: () => {}
  }

  component.emit = (emit as any).bind(null, component)

  return component
}

export function setupComponent(instance) {
  // TODO
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxy)

  const { setup } = Component

  if (setup) {
    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })
    setCurrentInstance(null)

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult: any) {
  // function Object
  // TODO function
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

let currentInstance = null
function finishComponentSetup(instance: any) {
  const Component = instance.type

  if (Component.render) {
    instance.render = Component.render
  }
}
function setCurrentInstance(instance) {
  currentInstance = instance
}

export function getCurrentInstance() {
  return currentInstance
}
