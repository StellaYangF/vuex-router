# Vuex | Analysis

## What
Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态只能通过可预测的方式改变。[查看官网](https://vuex.vuejs.org/#what-is-vuex)

## why
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

- 维护视图和状态之间的独立性