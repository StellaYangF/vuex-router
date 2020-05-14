import { foreach, getState } from '../util';
import { Vue } from '../store'

/**
 * 
 * @param {StoreOption} store 状态实例
 * @param {state} rootState 根状态
 * @param {Array<String>} path 父子模块名构成的数组
 * @param {Object} rawModule 当前模块状态对应格式化后的数据：{ state, _raw, _children, state } 其中 _raw 是 options: { namespaced?, state, getter, mutations, actions, modules?, plugins, strict}
 */
export default function installModule(store, rootState, path, rawModule) {
  let { getters, mutations, actions } = rawModule._raw;
  let root = store.modules.root;
  const namespace = path.reduce((str, currentModuleName) => {
    // root._raw 对应的就是 当前模块的 option， 根模块没有 namespaced 属性跳过
    root = root._children[currentModuleName];
    return str + (root._raw.namespaced ? currentModuleName + '/' : '')
  }, '');

  // 注册 state
  if (path.length > 0) {
    let parentState = path.slice(0, -1).reduce((root, current) => root[current], rootState);
    // CORE：动态给跟状态添加新属性，需调用 Vue.set API，添加依赖
    Vue.set(parentState, path[path.length - 1], rawModule.state);
  }

  // 注册 getters
  if (getters) {
    foreach(getters, (type, fn) => Object.defineProperty(store.getters, namespace + type, {
      get: () => fn(getState(store, path))
    }))
  }

  // 注册 mutations
  if (mutations) {
    foreach(mutations, (type, fn) => {
      let arr = store.mutations[namespace + type] || (store.mutations[namespace + type] = []);
      arr.push(payload => {
        fn(getState(store, path), payload);
        // 发布 subscribe 订阅的回调函数
        store.subs.forEach(sub => sub({
          type: namespace + type,
          payload,
        }, store.state));
      })
    })
  }

  if (actions) {
    foreach(actions, (type, fn) => {
      let arr = store.actions[namespace + type] || (store.actions[namespace + type] = []);
      arr.push(payload => fn(store, payload));
    })
  }

  // 递归
  foreach(rawModule._children, (moduleName, rawModule) => installModule(store, rootState, path.concat(moduleName), rawModule))
}
