import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'
import { Fragment, Text } from './vnode'
import { createAppAPI } from './createApp'
import { effect } from '../reactivity/effect'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options
  function render(vnode, container) {
    patch(null, vnode, container, null, null)
  }

  function patch(n1, n2, container, parentComponent, anchor) {
    const { shapeFlag, type } = n2

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container, anchor)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        break
    }
  }
  function processElement(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    const el = (n2.el = n1.el)
    patchChildren(n1, n2, el, parentComponent, anchor)
    patchProps(n1, n2)
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const { shapeFlag } = n2
    const prevShapeFlag = n1.shapeFlag
    const c1 = n1.children
    const c2 = n2.children
    // 新的是文本节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 老的是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 1.把老的el清空
        unmountChildren(n1.children)
        // 2. 设置text
        hostSetElementText(container, c2)
      } else if (c1 !== c2) {
        // 老的是文本
        hostSetElementText(container, c2)
      }
    } else {
      // 新的是数组
      // 老的是文本节点
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        // 老的是数组
        patchKeyedChildren(c1, c2, container, parentComponent)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent) {
    let i = 0
    const l2 = c2.length
    let e1 = c1.length - 1
    let e2 = l2 - 1
    // 左侧对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameTypeNode(n1, n2)) {
        patch(n1, n2, container, parentComponent, null)
      } else {
        break
      }
      i++
    }
    console.log(i)

    // 右侧对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameTypeNode(n1, n2)) {
        patch(n1, n2, container, parentComponent, null)
      } else {
        break
      }
      e1--
      e2--
    }
    // 新的比老的长，创建
    if (i > e1) {
      if (i <= e2) {
        const nextPos = i + 1
        const anchor = i + 1 < l2 ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
      // 老的比新的长，删除
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    }
    console.log(e1, e2)
  }

  function isSameTypeNode(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key
  }
  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      hostRemove(el)
    }
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
  function mountElement(vnode: any, container: any, parentComponent, anchor) {
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
      mountChildren(vnode.children, el, parentComponent, anchor)
    }

    //hanle props
    for (let key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }
    hostInsert(el, container, anchor)
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((e) => {
      patch(null, e, container, parentComponent, anchor)
    })
  }
  function processComponent(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
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
          patch(null, subTree, container, instance, null)
          // 把root元素虚拟节点上的el 赋值给组件的el（这样才能在组件里面用this.$el来获取）

          initialVNode.el = subTree.el
          instance.isMounted = true
        } else {
          console.log('update')
          const { proxy } = instance
          const subTree = instance.render.call(proxy)
          const prevSubTree = instance.subTree
          instance.subTree = subTree

          patch(prevSubTree, subTree, container, instance, null)
        }
      })
    })
  }
  function processFragment(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor: any
  ) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }
  function processText(n1, n2: any, container: any, anchor: any) {
    const { children } = n2
    const text = (n2.el = document.createTextNode(children))
    container.append(text)
  }

  return {
    createApp: createAppAPI(render)
  }
}
