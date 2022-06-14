import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'
import { Fragment, Text } from './vnode'
import { createAppAPI } from './createApp'
import { effect } from '../reactivity/effect'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert
  } = options
  function render(vnode, container) {
    patch(null, vnode, container, null)
  }

  function patch(n1, n2, container, parentComponent) {
    const { shapeFlag, type } = n2

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        }
        break
    }
  }
  function processElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }

  function patchElement(n1, n2, container) {
    // console.log('n1', n1)
    // console.log('n2', n2)
    patchProps(n1, n2)
  }

  function patchProps(n1, n2) {
    const newProps = n2.props || {}
    const oldProps = n1.props || {}
    if (oldProps !== newProps) {
      const el = (n2.el = n1.el)
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }

      // 不在新的props的值  直接删掉
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null)
        }
      }
    }
  }
  // 初始化element
  function mountElement(vnode: any, container: any, parentComponent) {
    // 这里是element，它只有自己的vode,没有instance;
    // 所以单纯这里赋值 ， 只是给element对应的vnode直接赋值，component并取不到
    // 要在等setupRenderEffect里的patch 全部执行完之后（等element的vnode.el都有值之后）才能给所有的component赋值
    const el = (vnode.el = hostCreateElement(vnode.type))

    const { children, props, shapeFlag } = vnode
    // handle children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 字符串说明是文本节点
      el.textContent = vnode.children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent)
    }

    //hanle props
    for (let key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }
    hostInsert(el, container)
  }

  function mountChildren(vnode, el, parentComponent) {
    vnode.children.forEach((e) => {
      patch(null, e, el, parentComponent)
    })
  }
  function processComponent(n1, n2: any, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }

  function mountComponent(vnode: any, container, parentComponent: any) {
    const instance = createComponentInstance(vnode, parentComponent)

    setupComponent(instance)
    setupRenderEffect(instance, vnode, container)
  }

  function setupRenderEffect(instance: any, initialVNode: any, container) {
    effect(() => {
      effect(() => {
        if (!instance.isMounted) {
          console.log('init')
          const { proxy } = instance
          // 我们是在这里执行的render，在render里面触发依赖收集

          const subTree = (instance.subTree = instance.render.call(proxy))
          patch(null, subTree, container, instance)
          // 把root元素虚拟节点上的el 赋值给组件的el（这样才能在组件里面用this.$el来获取）

          initialVNode.el = subTree.el
          instance.isMounted = true
        } else {
          console.log('update')
          const { proxy } = instance
          const subTree = instance.render.call(proxy)
          const prevSubTree = instance.subTree
          instance.subTree = subTree

          patch(prevSubTree, subTree, container, instance)
        }
      })
    })
  }
  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n2, container, parentComponent)
  }
  function processText(n1, n2: any, container: any) {
    const { children } = n2
    const text = (n2.el = document.createTextNode(children))
    container.append(text)
  }

  return {
    createApp: createAppAPI(render)
  }
}
