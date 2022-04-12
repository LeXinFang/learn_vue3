export let activeEffect = undefined
class ReactiveEffect {
    // 标识在实例上新增active属性
    public active = true; //这个effect默认是激活状态
    public parent = undefined;
    public deps = []; // 多对多的场景
    // 增加public会把fn挂载到 this上
    constructor(public fn) {

    }
    run() { // run就是执行effect
        if (!this.active) { this.fn() }// 如果标识非激活的只需要执行函数 不需要依赖收集
        /****这里来做依赖收集*** */
        // 核心就是将当前的effect和稍后渲染的属性关联到一起;
        try {
            this.parent = activeEffect;
            activeEffect = this;
            return this.fn(); // 稍后调用取值操作就可以调用 全局activeEffect
        } finally {
            activeEffect = this.parent;
            this.parent = null;
        }
    }
    stop() {
        this.active = false;
    }
}
export function effect(fn) {
    // 这里fn可以根据状态变化重新执行,effect可以嵌套写
    const _effect = new ReactiveEffect(fn)
    _effect.run()// 默认先执行一次
}
/**
 * 一个effect 对应多个属性,  一个属性对应多个effect  是多对多的关系
 * 
 */
const targetMap = new WeakMap()
export function track(target, type, key) {
    if (!activeEffect) return // 只收集被模板渲染的
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }
    // dep 代表当前属性对应set 
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = new Set()))
    }
    let shouldTrack = !dep.has(activeEffect)
    if (shouldTrack) {
        dep.add(activeEffect);

        activeEffect.deps.push(dep); // 让effect 记录dep 稍微清理的时候
    }
    // 属性记录了effect  只代表单向记录  现在需要反向记录
    // 让effect记录被那些属性收集了
}
export function trigger(target, type, key, value, oldValue) {
    console.log('value,oldValue: ', value, oldValue);
    let depsMap = targetMap.get(target)
    if (!depsMap) return; // 不在模板中使用
    let effects = depsMap.get(key);
    effects && effects.forEach(effect => {
        // 在执行effect的时候又要执行自己 需要屏蔽掉 不要无限死循环
        if (effect !== activeEffect) {
            effect.run()
        }
    });

}