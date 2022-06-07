import { h, createTextVnode } from '../../lib/soft-vue.esm.js'
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
    return h('div', {}, [app, foo])

    // 数组 vnode
    // const foo = h(Foo, {}, h("p", {}, "123"));
    // return h("div", {}, [ foo]);
  },

  setup() {
    return {}
  }
}
