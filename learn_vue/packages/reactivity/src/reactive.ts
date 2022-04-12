import { isObject } from "@vue/shared";
import { mutablehandlers, ReactiveFlags } from './baseHandler';
// 1) 将数据转换成响应式的数据  只能做对象的带来
// 2) 处理一个对象被代理多次 增加缓存机制
// 3) 处理proxy对象再次被代理的问题 
const reactiveMap = new WeakMap() // key只能是对象

export function reactive(target) {
    if (!isObject(target)) {
        return
    }
    if (target[ReactiveFlags.IS_REACTIVE]) {
        return target
    }
    let existingProxy = reactiveMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }
    // 并没有重新定义属性，只是代理 再取值的时候调用get 赋值的时候调用set
    const proxy = new Proxy(target, mutablehandlers)
    reactiveMap.set(target, proxy);
    return proxy
}