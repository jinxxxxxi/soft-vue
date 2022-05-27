import { h } from '../../lib/soft-vue.esm.js'
import { Foo } from './Foo.js'
window.self = null
export const App = {
  render() {
    window.self = this
    // ui
    return h(
      'div',
      {
        class: ['red', 'green'],
        id: 'fun'
      },
      [
        h('div', {}, 'hi,' + this.msg),
        h(Foo, {
          onAdd(a, b) {
            console.log('onAdd', a, b)
          },
          onAddFoo() {
            console.log('onAddFoo')
          }
        })
      ]
      // [
      //   h('div', { class: 'red' }, '111'),
      //   h('div', { class: 'green' }, [h('b', {}, '333')])
      // ]
    )
  },

  setup() {
    return {
      msg: 'soft-vue'
    }
  }
}
