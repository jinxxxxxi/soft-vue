import { h } from '../../lib/soft-vue.esm.js'
export const App = {
  render() {
    // ui
    return h(
      'div',
      { class: ['red', 'green'], id: 'fun' },
      // 'hi, ' + this.msg
      [
        h('div', { class: 'red' }, '111'),
        h('div', { class: 'green' }, [h('b', {}, '333')])
      ]
    )
  },

  setup() {
    return {
      msg: 'soft-vue'
    }
  }
}
