import { createVNode } from '../vnode'

export const renderSlots = (slots, key, props) => {
  console.log('zj', slots[key])
  const theSlot = slots[key]

  if (typeof theSlot === 'function') {
    return createVNode('div', {}, theSlot(props))
  }
  if (theSlot) {
    return createVNode('div', {}, theSlot)
  }
}
