import { h } from '../../lib/soft-vue.esm.js'
window.self = null
export const App = {
  render() {
    window.self = this
    // ui
    return h(
      'div',
      {
        class: ['red', 'green'],
        id: 'fun',
        onClick: () => {
          console.log('zhangjing')
        }
      },
      'hi, ' + this.msg
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
