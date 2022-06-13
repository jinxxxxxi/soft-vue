'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const extend = Object.assign;
const isObject = (value) => {
    return value !== null && typeof value === 'object';
};
const hasChanged = (newVal, oldVal) => {
    return !Object.is(newVal, oldVal);
};
const hasOwn = (val, key) => {
    return Object.prototype.hasOwnProperty.call(val, key);
};
const camelize = (str) => {
    return str.replace(/\-(\w)/g, function (_, c) {
        return c ? c.toUpperCase() : '';
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const PublicInstanceProxy = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        // 这个判断方式很新颖
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

let activeEffect = null;
let targetMaps = new Map();
let shouldTrack = false;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.active = true;
        this.deps = []; // 该effect对应的所有依赖； 每个值都是  target[key] 对应的所有依赖（Set类型）;
        this.scheduler = scheduler;
        this._fn = fn;
    }
    run() {
        if (!this.active) {
            // 执行fn 并且将返回值抛出去
            return this._fn();
        }
        // 应该收集
        shouldTrack = true;
        activeEffect = this;
        let r = this._fn();
        // 重置
        shouldTrack = false;
        return r;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    // 将当前传入的effect依赖， 删除
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
const track = (target, key) => {
    if (!isTracking())
        return;
    // target => key => dep
    // 先取到target 再取key
    let depMaps = targetMaps.get(target); // 该target对应的所有依赖
    if (!depMaps) {
        depMaps = new Map();
        targetMaps.set(target, depMaps);
    }
    let dep = depMaps.get(key); // target[key] 对应的所有依赖
    if (!dep) {
        dep = new Set(); // 依赖不能重复
        depMaps.set(key, dep);
    }
    trackEffects(dep);
};
function isTracking() {
    // 用于判断，activeEffect
    return shouldTrack && activeEffect !== undefined;
}
const triggerEffects = (dep) => {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
};
function trackEffects(dep) {
    // 优化 => 看看 dep 之前有没有添加过，添加过的话 那么就不添加了
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
const trigger = (target, key) => {
    const depsMap = targetMaps.get(target);
    const dep = depsMap.get(key);
    triggerEffects(dep);
};
const effect = (fn, options) => {
    // 一个effect里面可能会有多个ref,会触发多次track
    const scheduler = options === null || options === void 0 ? void 0 : options.scheduler;
    const _effect = new ReactiveEffect(fn, scheduler);
    extend(_effect, options);
    _effect.run();
    //绑定this,以防不测
    const runner = _effect.run.bind(_effect, fn);
    // impt: js里面函数也是对象，可以直接添加属性
    runner.effect = _effect;
    return runner;
};

// 性能优化，避免每次get/ser都执行一遍，先缓存一下；
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        // 如果是浅层的
        if (shallow) {
            return res;
        }
        // 如果当前是对象 就递归判断 ；
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        // 非对象才进行依赖收集
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        // 使用set时给出警告
        console.warn(`key :"${String(key)}" set 失败，因为 target 是 readonly 类型`, target);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

const reactive = (raw) => {
    return createReactiveObject(raw, mutableHandlers);
};
const readonly = (raw) => {
    return createReactiveObject(raw, readonlyHandlers);
};
const shallowReadonly = (raw) => {
    return createReactiveObject(raw, shallowReadonlyHandlers);
};
function createReactiveObject(target, baseHandles) {
    if (!isObject(target)) {
        console.warn(`target ${target} 必须是一个对象`);
        return target;
    }
    return new Proxy(target, baseHandles);
}

function emit(instance, event, ...args) {
    const { props } = instance;
    const toHandlerKey = (str) => {
        return str ? 'on' + capitalize(camelize(str)) : '';
    };
    const handler = props[toHandlerKey(event)];
    handler && handler(...args);
}

function initSlots(instance, children) {
    console.log('ins', instance);
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjSlots(children, instance.slots);
    }
}
function normalizeObjSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

class RefImpl {
    // 如果value是对象， 需要转化成reactive
    constructor(value) {
        this.__v_isRef = true;
        this._value = convert(value);
        this._raw = value;
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(newValue, this._raw)) {
            this._value = newValue;
            this._raw = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
const ref = (value) => {
    // 之前reactive 因为是对象，所以可以proxy来拦截
    // 但是对于普通值类型来说，proxy显然没用，所以我们想到了class的get和set
    // IMPT:这就是为什么要挂载一个value
    return new RefImpl(value);
};
const isRef = (ref) => {
    return !!ref.__v_isRef;
};
const unRef = (ref) => {
    return isRef(ref) ? ref.value : ref;
};
// 让我们调用ref的值时，不需要再加 .value; （在template中使用）
const proxyRefs = (objectWithRefs) => {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
};

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        name: vnode.type.name,
        slots: {},
        // 这块就是原型链的原理，每个都指向自己的父元素，就能一直向上查找了
        provides: parent ? parent.provides : {},
        parent,
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxy);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
let currentInstance = null;
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
function getCurrentInstance() {
    return currentInstance;
}

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlags(type),
        el: null
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function getShapeFlags(type) {
    return typeof type === 'string'
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
}
function createTextVnode(text) {
    return createVNode(Text, {}, text);
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null);
    }
    function patch(n1, n2, container, parentComponent) {
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processElement(n1, n2, container, parentComponent) {
        mountElement(n2, container, parentComponent);
    }
    // 初始化element
    function mountElement(vnode, container, parentComponent) {
        // 这里是element，它只有自己的vode,没有instance;
        // 所以单纯这里赋值 ， 只是给element对应的vnode直接赋值，component并取不到
        // 要在等setupRenderEffect里的patch 全部执行完之后（等element的vnode.el都有值之后）才能给所有的component赋值
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { children, props, shapeFlag } = vnode;
        // handle children
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            // 字符串说明是文本节点
            el.textContent = vnode.children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            mountChildren(vnode, el, parentComponent);
        }
        //hanle props
        for (let key in props) {
            const val = props[key];
            hostPatchProp(el, key, val);
        }
        hostInsert(el, container);
    }
    function mountChildren(vnode, el, parentComponent) {
        vnode.children.forEach((e) => {
            patch(null, e, el, parentComponent);
        });
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(vnode, container, parentComponent) {
        const instance = createComponentInstance(vnode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            effect(() => {
                if (!instance.isMounted) {
                    console.log('init');
                    const { proxy } = instance;
                    // 我们是在这里执行的render，在render里面触发依赖收集
                    const subTree = (instance.subTree = instance.render.call(proxy));
                    patch(null, subTree, container, instance);
                    // 把root元素虚拟节点上的el 赋值给组件的el（这样才能在组件里面用this.$el来获取）
                    initialVNode.el = subTree.el;
                    instance.isMounted = true;
                }
                else {
                    console.log('update');
                    const { proxy } = instance;
                    const subTree = instance.render.call(proxy);
                    const prevSubTree = instance.subTree;
                    instance.subTree = subTree;
                    patch(prevSubTree, subTree, container, instance);
                }
            });
        });
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const text = (n2.el = document.createTextNode(children));
        container.append(text);
    }
    return {
        createApp: createAppAPI(render)
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

const renderSlots = (slots, key, props) => {
    const slot = slots[key];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
};

function provide(key, value) {
    // 存
    const currentInstance = getCurrentInstance();
    let { provides } = currentInstance;
    const parentProvides = currentInstance.parent.provides;
    // 优化：避免每次都重新赋值
    if (provides === parentProvides) {
        provides = currentInstance.provides = Object.create(provides);
    }
    provides[key] = value;
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const { parent } = currentInstance;
        const { provides } = parent;
        if (key in provides) {
            return provides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, val) {
    //判断事件名 on+[事件]
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLocaleLowerCase();
        el.addEventListener(event, val);
    }
    else {
        el.setAttribute(key, val);
    }
}
function insert(el, parent) {
    parent.appendChild(el);
}
const renderer = createRenderer({ createElement, patchProp, insert });
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVnode = createTextVnode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
