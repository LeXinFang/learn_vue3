
import {track,trigger } from './effect'
export const enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive"
}
export const mutablehandlers = {
    get(target, key, receiver) {
        // 判断重复代理问题返回值
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true
        }
        // 依赖收集
        track(target,'get',key)
        // 监控用户取值
        return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
        // 监控用户设置值
        let oldValue = target[key];
        let result = Reflect.set(target, key, value, receiver);
        if(oldValue !== value){
            // 更新
            trigger(target,'set',key,value,oldValue)
        }
        // 触发更新
        return result;
    }
}
/***
 * 
 * 
 * 对象-> 属性 -> effect(多个)
 * weakMap -> Map -> Set(去除重复)
 * 
 */