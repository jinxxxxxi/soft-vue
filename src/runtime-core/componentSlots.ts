export function initSlots(instance, children) {
  let slots = {}
  for (const key in children) {
    const value = children[key]
    slots[key] = (props) => normalizeSlotValue(value(props))
  }

  instance.slots = slots
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}
