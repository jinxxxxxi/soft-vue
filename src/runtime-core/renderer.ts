import { isObject } from '../shared/index'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  if (typeof vnode.type === 'string') {
    processElement(vnode, container)
  } else if (isObject(vnode)) {
    processComponent(vnode, container)
  }
}
function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}

// 初始化element
function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type)
  const { children, props } = vnode
  // handle children
  if (typeof children === 'string') {
    // 字符串说明是文本节点
    el.textContent = vnode.children
  } else if (Array.isArray(children)) {
    mountChildren(children, el)
  }
  //hanle props
  for (let key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }
  container.appendChild(el)
}

function mountChildren(children, el) {
  children.forEach((e) => {
    patch(e, el)
  })
}
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(vnode: any, container) {
  const instance = createComponentInstance(vnode)

  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance: any, container) {
  const subTree = instance.render()

  patch(subTree, container)
}
