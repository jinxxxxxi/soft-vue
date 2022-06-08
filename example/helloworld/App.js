import {
  h,
  createTextVnode,
  getCurrentInstance
} from '../../lib/soft-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: 'App',
  render() {
    const app = h('div', {}, 'App')
    // object key
    const foo = h(
      Foo,
      {},
      {
        header: ({ age }) => {
          return [h('p', {}, 'header' + age), createTextVnode('你好')]
        },
        footer: () => h('p', {}, 'footer')
      }
      // h('p', {}, '123')
    )
    // return h('div', {}, [createTextVnode('aaa'), 'bbb'])

    // 数组 vnode
    return h('div', {}, [foo])
  },

  setup() {
    const instance = getCurrentInstance()
    console.log('instance', instance)
    return {}
  }
}
