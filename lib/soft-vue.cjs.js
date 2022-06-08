'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const extend = Object.assign;
const isObject = (value) => {
    return value !== null && typeof value === 'object';
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

let targetMaps = new Map();
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
const trigger = (target, key) => {
    const depsMap = targetMaps.get(target);
    const dep = depsMap.get(key);
    triggerEffects(dep);
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

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        name: vnode.type.name,
        slots: {},
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
        instance.setupState = setupResult;
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

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    const { shapeFlag, type } = vnode;
    switch (type) {
        case Fragment:
            processFragment(vnode, container);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (shapeFlag & 1 /* ELEMENT */) {
                processElement(vnode, container);
            }
            else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                processComponent(vnode, container);
            }
            break;
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
// 初始化element
function mountElement(vnode, container) {
    // 这里是element，它只有自己的vode,没有instance;
    // 所以单纯这里赋值 ， 只是给element对应的vnode直接赋值，component并取不到
    // 要在等setupRenderEffect里的patch 全部执行完之后（等element的vnode.el都有值之后）才能给所有的component赋值
    const el = (vnode.el = document.createElement(vnode.type));
    console.log(vnode);
    const { children, props, shapeFlag } = vnode;
    // handle children
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        // 字符串说明是文本节点
        el.textContent = vnode.children;
    }
    else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    //判断事件名 on+[事件]
    const isOn = (key) => /^on[A-Z]/.test(key);
    //hanle props
    for (let key in props) {
        const val = props[key];
        if (isOn(key)) {
            const event = key.slice(2).toLocaleLowerCase();
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.appendChild(el);
}
function mountChildren(vnode, el) {
    vnode.children.forEach((e) => {
        console.log('child', e);
        patch(e, el);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance;
    // debugger
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    // 把root元素虚拟节点上的el 赋值给组件的el（这样才能在组件里面用this.$el来获取）
    vnode.el = subTree.el;
}
function processFragment(vnode, container) {
    mountChildren(vnode, container);
}
function processText(vnode, container) {
    const { children } = vnode;
    const text = (vnode.el = document.createTextNode(children));
    container.append(text);
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
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

exports.createApp = createApp;
exports.createTextVnode = createTextVnode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.renderSlots = renderSlots;
