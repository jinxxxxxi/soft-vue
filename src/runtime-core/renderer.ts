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
  // 这里是element，它只有自己的vode,没有instance;
  // 所以单纯这里赋值 ， 只是给element对应的vnode直接赋值，component并取不到
  // 要在等setupRenderEffect里的patch 全部执行完之后（等element的vnode.el都有值之后）才能给所有的component赋值
  const el = (vnode.el = document.createElement(vnode.type))
  console.log(vnode)

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
  setupRenderEffect(instance, vnode, container)
}

function setupRenderEffect(instance: any, vnode: any, container) {
  const { proxy } = instance
  // debugger
  const subTree = instance.render.call(proxy)

  patch(subTree, container)
  // 把root元素虚拟节点上的el 赋值给组件的el（这样才能在组件里面用this.$el来获取）
  vnode.el = subTree.el
}
