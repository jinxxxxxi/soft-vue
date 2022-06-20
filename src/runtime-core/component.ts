import { initProps } from './componentProps'
import { PublicInstanceProxy } from './componentPublicInstance'
import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initSlots } from './componentSlots'
import { proxyRefs } from '../reactivity'

export function createComponentInstance(vnode, parent) {
  const component = {
    vnode, // 老的虚拟节点
    type: vnode.type,
    setupState: {},
    props: {},
    next: null, // 新的虚拟节点
    name: vnode.type.name,
    slots: {},
    // 这块就是原型链的原理，每个都指向自己的父元素，就能一直向上查找了
    provides: parent ? parent.provides : {},
    parent,
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
    instance.setupState = proxyRefs(setupResult)
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
