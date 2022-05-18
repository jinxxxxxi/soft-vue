import { h } from '../../lib/soft-vue.esm.js'
export const App = {
  render() {
    // ui
    return h('div', 'hi, ' + this.msg)
  },

  setup() {
    return {
      msg: 'soft-vue'
    }
  }
}
