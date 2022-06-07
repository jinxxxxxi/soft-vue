import { ShapeFlags } from '../shared/ShapeFlags'

export function initSlots(instance, children) {
  console.log('ins', instance)
  const { vnode } = instance

  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjSlots(children, instance.slots)
  }
}

function normalizeObjSlots(children, slots) {
  for (const key in children) {
    const value = children[key]
    slots[key] = (props) => normalizeSlotValue(value(props))
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}
