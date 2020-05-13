# Vuex | Analysis

## What
Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态只能通过可预测的方式改变。[查看官网](https://vuex.vuejs.org/#what-is-vuex)

## Why
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







## Implement
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

**组件中使用**
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
可以看到上述的状体映射，调用时可传入 options  对象，属性值有三种形式：
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

## Build
本文主要讲解作者在阅读源码时的心得，以此实现一个简版的 **vuex**

### 开始构建
