import { h, ref, getCurrentInstance, nextTick } from '../../lib/soft-vue.esm.js'

export default {
  name: 'App',
  setup() {
    const count = ref(1)
    const instance = getCurrentInstance()

    function onClick() {
      for (let i = 0; i < 100; i++) {
        console.log('update')
        // 这些操作会被添加到promsie里面去
        count.value = i
      }
      // 这个也会添加到promise里面去，在上面之后
      nextTick(() => {
        console.log(3, instance)
      })

      // await nextTick()
      // console.log(instance)
    }

    return {
      onClick,
      count
    }
  },
  render() {
    const button = h('button', { onClick: this.onClick }, 'update')
    const p = h('p', {}, 'count:' + this.count)

    return h('div', {}, [button, p])
  }
}
