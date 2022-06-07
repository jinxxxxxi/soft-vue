import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'
import { Fragment, Text } from './vnode'

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  const { shapeFlag, type } = vnode

  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
      }
      break
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

  const { children, props, shapeFlag } = vnode
  // handle children
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 字符串说明是文本节点
    el.textContent = vnode.children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el)
  }
  //判断事件名 on+[事件]
  const isOn = (key: string) => /^on[A-Z]/.test(key)
  //hanle props
  for (let key in props) {
    const val = props[key]
    if (isOn(key)) {
      const event = key.slice(2).toLocaleLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val)
    }
  }
  container.appendChild(el)
}

function mountChildren(vnode, el) {
  vnode.children.forEach((e) => {
    console.log('child', e)

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
function processFragment(vnode: any, container: any) {
  mountChildren(vnode, container)
}
function processText(vnode: any, container: any) {
  const { children } = vnode
  const text = (vnode.el = document.createTextNode(children))
  container.append(text)
}
