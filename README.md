# What
Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态只能通过可预测的方式改变。[查看官网](https://vuex.vuejs.org/#what-is-vuex)

# Why
多组件共享同一个状态时，会依赖同一状态
单一数据流无法满足需求：
- 深度嵌套组件级属性传值，会变得非常麻烦
- 同级（兄弟）组件间传值也行不通
- 通过事件或父子组件直接引用也很繁琐

最终导致代码维护困难。

multiple components that share a common state:
多组件共享状态
如下图：
![vuex](https://vuex.vuejs.org/vuex.png)

- 可追踪状态改变
- 可维护
- 可进行 **time travel**

> Vue.js 官网文档写得很详细，建议初学者一定要把文档至少过一遍。

这里附上文档地址 [Vuex](https://vuex.vuejs.org/installation.html)

# When
- 当构建一个大型的 SPA 时
- 多组件共享一个状态


# Implement
解析源码之前，至少要对 Vuex 非常熟悉，再进一步实现。

## 新建 store 仓库文件
在初始化 store.js 文件时，需要手动注册 **Vuex**，这一步是为了将 **store** 属性注入到每个组件的实例上，可通过 **this.$store.state** 获取共享状态。
```js
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
```
> Tip: 这里 Vue 是在进行订阅，Vuex.install 函数，根组件在实例化时，会自动派发执行 install 方法，并将 Vue 作为参数传入。

导出 Store 实例，传入属性对象，可包含以下属性：
 **state**: 根状态
 **getters**: 依赖状态计算出派生状态
 **mutations**: 通过 **commit** 改变状态的唯一方式，使得状态变化可追踪，传入 payload 作为第二参数
 **actions**: 类似于 **mutation**，内部执行 **commit**，异步请求和操作放这里执行，外部触发调用 **dispatch** 方法，传入 payload 作为第二个参数
 **modules**: 子模块状态
 **namespaced**: 字模块设置命名空间
```js
export default new Vuex.Store({
  state: {
    todos: [
      { id: 0, done: true, text: 'Vue.js' },
      { id: 1, done: false, text: 'Vuex' },
      { id: 2, done: false, text: 'Vue-router' },
      { id: 3, done: false, text: 'Node.js' },
    ],
  },
  getters: {
   doneTodosCount(state) {
    return state.todos.filter(todo => todo.done).length;
   },
  },
  mutations: {
    syncTodoDone(state, id) {
      state.todos.forEach((todo, index) => index===id && (todo.done = true))
    }
  },
  actions: {
    asyncChange({commit}, payload) {
      setTimeout(() => commit('syncChange', payload), 1000);
    }
  },
  modules: {
    a: {
      state: {
        age: '18'
      },
      mutations: {
        syncAgeIncrement(state) {
          state.age += 1; // 这里的 state 为当前子模块状态
        }
      }
    }
  }
})
store.state.a.age // -> "18"
```

## 组件中使用
引入相关映射函数
```js
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
```
组件中使用时，这四种映射函数用法差不多，都是返回一个对象。

方式一：
```js
{
  computed: {
    todos() {
      return this.$store.state.todos;
    },
    age() {
      return this.$store.state.a.age
    },
    // ...
  }
}
```
> Tip: 上述方式在获取多个状态时，代码重复过多且麻烦，**this.$store.state**，可进一步优化为第二种方式

方式二：
```js
{
  computed: mapState({
    todos: state => state.age,
    
    // or
    todos: 'todos', // 属性名为别名

    // or
    todos(state) {
      return state.todos; // 内部可获取 this 获取当前实例数据
    }
  })
}
```
可以看到上述的状态映射，调用时可传入 options  对象，属性值有三种形式：
- 箭头函数（简洁）
- 字符串（别名）
- normal 函数（this 指向向前组件实例）

> Tip: 如果当前实例组件，有自己的私有的计算属性时，可使用 **es6** 语法的 **Object Spread Operator** 对象展开运算符

方式三：
```js
{
  computed: {
    ...mapState([
      'todos',
    ]),
    otherValue: 'other value'
  }
}
```

在子模块状态属性中添加 **namespaced: true**  字段时，**mapMutations**, **mapActions** 需要添加对应的命名空间
方式一：
```js
{
  methods: {
    syncTodoDone(payload) {
      this.$store.commit('syncTodoDone', payload)
    },
    syncAgeIncrement() {
      this.$store.commit('syncAgeIncrement')
    }
  }
}
```

方式二：
```js
{
  methods: {
    ...mapMutations([
      "syncTodoDone",
    ]),
    ...mapMutations('a', [
      "asyncIncrement"
    ]),
  }
}
```

方式三：
借助 **vuex** 内部帮助函数进行包装
```js
import { createNamespacedHelpers } from 'vuex'

const { mapMutations } = createNamespacedHelpers('a')

{
  methods: mapMutations([
    'syncAgeIncrement'
  ])
}
```

除了以上基础用法之外，还有 **plugins**, **registerModule** 属性与 api， 后续的源码分析上会尝试实现。

# Build
接下来开始构建一个简易的 **vuex**

## Application Structure 目录结构

```sh
└── vuex
    └── src
        ├── index.js
        ├── store.js              # core code including install, Store
        └── helpers               # helper functions including mapState, mapGetters, mapMutations, mapActions, createNamespacedHelpers
        └── util.js
        ├── plugins
        │   └── logger.js
        └── module
            ├── module-collection.js
            └── module.js
```

## 核心入口文件
导出包含核心代码的对象
```js
// index.js
import { Store, install } from './store';
import { mapState, mapMutations, mapGetters, mapActions, createNamespacedHelpers } from './helpers';

export default {
  Store,
  install,
  mapState,
  mapGetters,
  mapMutations,
  mapActions,
  createNamespacedHelpers
}

export {
  Store,
  install,
  mapState,
  mapGetters,
  mapMutations,
  mapActions,
  createNamespacedHelpers
}
```

## store.js
### 实现 install 方法
```js
function install(_Vue) {
  Vue = _Vue;
  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        this.$store = this.$options.store;
      } else {
        this.$store = this.$parent && this.$parent.$store;
      }
    },
  })
}
```
> Tip: 内部通过调用 **Vue.mixin()**，为所有组件注入 $store 属性

### 实现 Store 类
### Store 数据结构
```ts
interface StoreOptions<S> {
    state?: S | (() => S);
    getters?: GetterTree<S, S>;
    actions?: ActionTree<S, S>;
    mutations?: MutationTree<S>;
    modules?: ModuleTree<S>;
    plugins?: Plugin<S>[];
    strict?: boolean;
  }

export declare class Store<S> {
  constructor(options: StoreOptions<S>);

  readonly state: S;
  readonly getters: any;

  replaceState(state: S): void;

  dispatch: Dispatch;
  commit: Commit;

  subscribe<P extends MutationPayload>(fn: (mutation: P, state: S) => any): () => void;

  registerModule<T>(path: string, module: Module<T, S>, options?: ModuleOptions): void;
  registerModule<T>(path: string[], module: Module<T, S>, options?: ModuleOptions): void;
  
}
```
> Tip: 以上对源码上有一定出入，简化之后有些属性和方法有所删减和改动

依次执行步骤:
- 脚本引入时，确保 install 方法被调用，先判断是否挂载了全局属性 Vue
  ```js
  constructor(options = {}) {
      if (!Vue && typeof Window !== undefined && Window.Vue) {
        install(Vue);
      }
  }
  ```

#### 构造函数内部先初始化实例属性和方法
  ```js
    this.strict = options.strict || false;
    this._committing = false;
    this.vm = new Vue({
      data: {
        state: options.state,
      },
    });
    this.getters = Object.create(null);
    this.mutations = Object.create(null);
    this.actions = Object.create(null);
    this.subs = [];
  ```
#### getters 
类型为 GetterTree 调用 **Object.create(null)** 创建一个干净的对象，即原型链指向 null，没有原型对象的方法和属性，提高性能
  ```ts
  export interface GetterTree<S, R> {
    [key: string]: Getter<S, R>;
  }
  ```

  - **mutations**: MutationTree
  ```ts
  export interface MutationTree<S> {
    [key: string]: Mutation<S>;
  }
  ```

##### actions
类型为 ActionTree
  ```ts
  export interface ActionTree<S, R> {
    [key: string]: Action<S, R>;
  }
  ```

##### modules
考虑到 state 对象下可能会有多个 modules，创建 **ModuleCollection** 格式化成想要的数据结构
  ```ts
  export interface Module<S, R> {
    namespaced?: boolean;
    state?: S | (() => S);
    getters?: GetterTree<S, R>;
    actions?: ActionTree<S, R>;
    mutations?: MutationTree<S>;
    modules?: ModuleTree<R>;
  }
  
  export interface ModuleTree<R> {
    [key: string]: Module<any, R>;
  }
  ```

##### get state
**core** 这里进行了依赖收集，将用户传入的 state 变为响应式数据，数据变化触发依赖的页面更新
  ```js
  get state() {
    return this.vm.state;
  }
  ```

##### subscribe
订阅的事件在每一次 mutation 时发布
  ```js
    subscribe(fn) {
      this.subs.push(fn);
    }
  ```

  - **replaceState**
  ```js
    replaceState(newState) {
      this._withCommit(() => {
        this.vm.state = newState;
      })
    }
  ```

##### subs
 订阅事件的存储队列

##### plugins
  ```js
  const plugins= options.plugins;
    plugins.forEach(plugin => plugin(this));
  ```
结构为数组，暴露每一次 mutation 的钩子函数。每一个 Vuex 插件仅仅是一个函数，接收 唯一的参数 store，插件功能就是在mutation 调用时增加逻辑，如：
    - **createLogger**  vuex/dist/logger 修改日志（内置）
    - **stateSnapShot** 生成状态快照
    - **persists** 数据持久化
  ```js
  const persists = store => {
    // mock data from server db
    let local = localStorage.getItem('Vuex:state');
    if (local) {
      store.replaceState(JSON.parse(local));
    }
    // mock 每一次数据变了之后就往数据库里存数据
    store.subscribe((mutation, state) =>  localStorage.setItem('Vuex:state', JSON.stringify(state)))
  }
  ```

##### _committing
boolean 监听异步逻辑是否在 dispatch 调用

##### _withCommit
函数接片，劫持mutation（commit） 触发函数。
  ```js
  _withCommit(fn) {
    const committing = this._committing;
    this._committing = true;
    fn();
    this._committing = committing;
  }
  ```

##### strict
源码中，在严格模式下，会深度监听状态异步逻辑的调用机制是否符合规范
```js
if (this.strict) {
      this.vm.$watch(
        () => this.vm.state,
        function() {
          console.assert(this._committing, '不能异步调用')
        },
        {
          deep: true,
          sync: true,
        }
      );
    }
```
> Tip: 生产环境下需要禁用 strict 模式，深度监听会消耗性能，核心是调用 Vue 的监听函数

##### commit
  ```js
  commit = (type, payload) => {
    this._withCommit(() => {
      this.mutations[type].forEach(fn => fn(payload));
    })
  }
  ```

##### dispatch
  ```js
  dispatch = (type, payload) => {
    this.actions[type].forEach(fn => fn(payload));
  }
  ```

##### registerModule** 动态注册状态模块
  ```js
  registerModule(moduleName, module) {
    this._committing = true;
    if (!Array.isArray(moduleName)) {
      moduleName = [moduleName];
    }

    this.modules.register(moduleName, module);
    installModule(this, this.state, moduleName, module.rawModule)
  }
  ```

##### installModule
工具方法，注册格式化后的数据，具体表现为: （注册）
  ```js
  /**
   * 
  * @param {StoreOption} store 状态实例
  * @param {state} rootState 根状态
  * @param {Array<String>} path 父子模块名构成的数组
  * @param {Object} rawModule 当前模块状态对应格式化后的数据：{ state, _raw, _children, state } 其中 _raw 是 options: { namespaced?, state, getter, mutations, actions, modules?, plugins, strict}
  */
  function installModule(store, rootState, path, rawModule) {
    
    let { getters, mutations, actions } = rawModule._raw;
    let root = store.modules.root;
  ```
  - **子模块命名空间处理**
  ```js
    const namespace = path.reduce((str, currentModuleName) => {
      // root._raw 对应的就是 当前模块的 option， 根模块没有 namespaced 属性跳过
      root = root._children[currentModuleName];
      return str + (root._raw.namespaced ? currentModuleName + '/' : '')
    }, '');
  ```
  - **注册 state**
  ```js
      if (path.length > 0) {
        let parentState = path.slice(0, -1).reduce((root, current) => root[current], rootState);
        // CORE：动态给跟状态添加新属性，需调用 Vue.set API，添加依赖
        Vue.set(parentState, path[path.length - 1], rawModule.state);
      }
  ```

 - **注册 getters**
  ```js
    if (getters) {
      foreach(getters, (type, fn) => Object.defineProperty(store.getters, namespace + type, {
        get: () => fn(getState(store, path))
      }))
    }
  ```
  - **注册 mutations**
  ```js
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
  ```
  - **注册 actions**
  ```js
    if (actions) {
      foreach(actions, (type, fn) => {
        let arr = store.actions[namespace + type] || (store.actions[namespace + type] = []);
        arr.push(payload => fn(store, payload));
      })
    }
  ```
  - **递归处理子模块**
  ```js
    foreach(rawModule._children, (moduleName, rawModule) => installModule(store, rootState, path.concat(moduleName), rawModule))
  }
  ```

### ModuleCollection 类结构
#### constructor 构造函数
  ```js
  class ModuleCollection{
    constructor(options) {
      this.register([], options);
    }
  ```
#### register 实例方法
```js
// rootModule: 为当前模块下的 StoreOption
    register(path, rootModuleOption) {
      let rawModule = {
        _raw: rootModuleOption,
        _children: Object.create(null),
        state: rootModuleOption.state
      }
      rootModuleOption.rawModule = rawModule;

      if (!this.root) {
        this.root = rawModule;
      } else {
        // 若 modules: a.modules.b => [a, b] => root._children.a._children.b
        let parentModule = path.slice(0, -1).reduce((root, current) => root._children[current], this.root);
        parentModule._children[path[path.length - 1]] = rawModule
      }

      if (rootModuleOption.modules) {
        foreach(rootModuleOption.modules, (moduleName, moduleOption) => this.register(path.concat(moduleName), moduleOption));
      }
    }
  }
  ```

### helpers.js
帮助文件中的四个函数都是通过接受对应要映射为对象的参数名，直接供组件内部使用。
#### mapState 
  ```js
  export const mapState = (options) => {
    let obj = Object.create(null);
    if (Array.isArray(options)) {
      options.forEach((stateName) => {
        obj[stateName] = function() {
          return this.$store.state[stateName];
        };
      });
    } else {
      Object.entries(options).forEach(([stateName, value]) => {
        obj[stateName] = function() {
          if (typeof value === "string") {
            return this.$store.state[stateName];
          }
          return value(this.$store.state);
        }
      });
    }
    return obj;
  };
  ```

> 参数 **options** 类型可以是: 
      - **Array[string]**, 如：[ 'count', 'list' ] 
      - **Object**, key 值为状态名，value 可以是 **string**, **arrow function**, **normal function**，其中常规函数，可以在内部访问到当前组件实例

#### mapGetters
```js
  export function mapGetters(namespace, options) {
    let obj = Object.create(null);
    if (Array.isArray(namespace)) {
      options = namespace;
      namespace = '';
    } else {
      namespace += '/';
    }
    options.forEach(getterName => {
      console.log(getterName)
      obj[getterName] = function() {
        return this.$store.getters[namespace + getterName];
      }
    })
    return obj;
  }
  ```

#### mapMutations
  ```js
  export function mapMutations(namespace, options) {
    let obj = Object.create(null);
    if (Array.isArray(namespace)) {
      options = namespace;
      namespace = '';
    } else {
      namespace += '/';
    }
    options.forEach(mutationName => {
      obj[mutationName] = function(payload) {
        return this.$store.commit(namespace + mutationName, payload)
      }
    })
    return obj;
  }
  ```
  
#### mapActions
  ```js
  export function mapActions(namespace, options) {
    let obj = Object.create(null);
    if (Array.isArray(namespace)) {
      options = namespace;
      namespace = '';
    } else {
      namespace += '/';
    }
    options.forEach(actionName => {
      obj[actionName] = function(payload) {
        return this.$store.dispatch(namespace + actionName, payload)
      }
    })
    return obj;
  }
  ```
  
  以上后三个方法包含了子模块命名空间，参数解析如下：
> 参数1可选值，为子状态模块的命名空间
    参数2为选项属性，类型同 mapState

### 工具函数
#### foreach 
处理对象键值对迭代函数处理
#### getState
同步用户调用 replaceState 后，状态内部的新状态
  ```js
  const foreach = (obj, callback) => Object.entries(obj).forEach(([key, value]) => callback(key, value));
  const getState = (store, path) => path.reduce((newState, current) => newState[current], store.state);
  ```

至此， vuex 源码的个人分析基本完结，因为是**简版**与源码会有一定的出入。

<span style="color: tomato;">
  <i class="fas fa-smile"></i>
</span>Feel free to tell me if there is any problem.


<head> 
    <script defer src="https://use.fontawesome.com/releases/v5.0.13/js/all.js"></script> 
    <script defer src="https://use.fontawesome.com/releases/v5.0.13/js/v4-shims.js"></script> 
</head> 
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css">