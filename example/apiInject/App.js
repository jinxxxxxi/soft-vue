// 组件 provide 和 inject 功能
import { h, provide, inject } from '../../lib/soft-vue.esm.js'

const Provider = {
  name: 'Provider',
  setup() {
    provide('foo', 'fooVal')
    provide('bar', 'barVal')
  },
  render() {
    return h('div', {}, [h('p', {}, 'Provider'), h(ProviderTwo)])
  }
}

const ProviderTwo = {
  name: 'ProviderTwo',
  setup() {
    provide('foo', 'fooTwo')
    const foo = inject('foo')

    return {
      foo
    }
  },
  render() {
    return h('div', {}, [
      h('p', {}, `ProviderTwo foo:${this.foo}`),
      h(Consumer)
    ])
  }
}

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    // const baz = inject("baz", "bazDefault");
    // const baz = inject('baz', () => 'bazDefault')

    return {
      foo,
      bar
    }
  },
  render() {
    return h('div', {}, [, h('p', {}, `Consumer:${this.foo}`), h(Inner)])
  }
}

const Inner = {
  name: 'Inner',
  setup() {
    const innerVal = inject('innerVal', () => 'innerVal')
    // const baz = inject("baz", "bazDefault");
    // const baz = inject('baz', () => 'bazDefault')

    return {
      innerVal
    }
  },

  render() {
    return h('div', {}, `Inner: - ${this.innerVal} - ${this.innerVal}`)
  }
}

export default {
  name: 'App',
  setup() {},
  render() {
    return h('div', {}, [h('p', {}, 'apiInject'), h(Provider)])
  }
}
