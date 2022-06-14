import { createRenderer } from '../runtime-core/renderer'

function createElement(type) {
  return document.createElement(type)
}

function patchProp(el, key, prevVal, nextVal) {
  //判断事件名 on+[事件]
  const isOn = (key: string) => /^on[A-Z]/.test(key)
  if (isOn(key)) {
    const event = key.slice(2).toLocaleLowerCase()
    el.addEventListener(event, nextVal)
  } else if (nextVal === undefined || nextVal === null) {
    el.removeAttribute(key)
  } else {
    el.setAttribute(key, nextVal)
  }
}

function insert(el, parent) {
  parent.appendChild(el)
}

const renderer: any = createRenderer({ createElement, patchProp, insert })

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core'
export * from '../reactivity'
