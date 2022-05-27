import { h } from '../../lib/soft-vue.esm.js'

export const Foo = {
  setup(props) {
    // props.count
    console.log('zj', props)
    // 3.
    // shallow readonly
    props.count++
    console.log(props)
  },
  render() {
    return h('div', { class: this.class }, 'foo: ' + this.count)
  }
}
