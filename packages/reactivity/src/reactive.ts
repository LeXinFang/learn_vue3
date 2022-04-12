import { isObject } from "@vue/shared";
// 1) 将数据转换成响应式的数据  只能做对象的带来
// 2) 处理一个对象被代理多次 增加缓存机制
// 3) 处理proxy对象再次被代理的问题 
const reactiveMap = new WeakMap() // key只能是对象
const enum ReactiveMap {
    IS_REACTIVE = "__v_isReactive"
}
export function reactive(target) {
    if (!isObject(target)) {
        return
    }
    if (target[ReactiveMap.IS_REACTIVE]) {
        return target
    }
    let existingProxy = reactiveMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }
    // 并没有重新定义属性，只是代理 再取值的时候调用get 赋值的时候调用set
    const proxy = new Proxy(target, {
        get(target, key, receiver) {
            // 判断重复代理问题返回值
            if (key === ReactiveMap.IS_REACTIVE) {
                return true
            }
            // 监控用户取值
            return Reflect.get(target, key, receiver)
        },
        set(target, key, value, receiver) {
            // 监控用户设置值
            return Reflect.set(target, key, value, receiver)
        }
    })
    reactiveMap.set(target, proxy);
    return proxy
}