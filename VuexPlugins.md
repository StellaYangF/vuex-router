## Preface 前言
上篇谈到 [实现简易的 Vuex](https://juejin.im/post/5ebe0700f265da7bb46be0ce)，本篇文章具体来讲 Vuex **plugins** 插件的具体实现及其功能。

阅读官方文档可知，Vuex 提供插件属性，对外暴露出状态在进行 mutation 时可传入的钩子函数，允许用户在每一次状态 mutation 后，增加一定处理逻辑，本质就是重写了 store.commit 提交变化时触发的函数，原理就是 **AOP** 切片

## 首先要知道 AOP 是什么？
在讲解为什么要提出插件概念前，先理解什么是 AOP。

### 举栗说明
下面给一个例子，结合分析理解：
```js
let  sayMorning = who => console.log(`Good morning, ${who}.`);
```
> sayMorning('Stella')，输出结果为 Good morning, Stella.

如果想不改变原函数 **sayMorning** 内部逻辑的情况下，扩展新的回复逻辑 response，**AOP** 能完美解决，如下：
```js
const wrapFunction = fn => who => {
  fn(who);
  console.log('Good morning, stella');
};
sayMorning = wrapFunction(sayMorning);
```
> wrapFunction 包裹函数就是将原函数 **sayMorning** 作为参数，返回一个可接收参数的新函数（高阶函数），在内部管理调用原函数，同时还能增加你想要进行的其他处理逻辑。

以上述就实现了在不改变原函数的基础上，增强原函数的功能，实现代码的可扩展性。

### 使用场景
日常开发中，AOP 的编程思想随处可见，只要你想增加一个函数的额外功能，又不想老是对原函数进行修改，导致代码难以维护、难以扩展，你就能用到这个变成思想。

- Vue-router History 浏览器历史记录就是改写了

## 为什么要提出插件概念？
单纯使用 Vuex，解决了组件间共享数据的的问题，增加代码可维护、可拓展性。

有时候想要在状态改变的前后，追踪监控数据的触发时机与改变方式，就需要 Vuex 内部提供给用户可操作的方式。（下面会具体谈到 Vuex 插件能帮我们处理什么问题）

上一篇 [实现简易的 Vuex](https://juejin.im/post/5ebe0700f265da7bb46be0ce) 文章中分析过 commit 处理的逻辑（可全面了解），这里聚焦到 **plugins** 的功能实现

### plugins 特点
Vuex 仓库接收 `plugins` 选项属性，值为插件构成的数组，每一个插件就是一个函数，接收 `store` 这个唯一的参数。

这里贴上官网的例子：
```js
const myPlugin = store => {
  // called when the store is initialized
  store.subscribe((mutation, state) => {
    // called after every mutation.
    // The mutation comes in the format of `{ type, payload }`.
  })
}
```

```js
// store.js
const store = new Vuex.Store({
  // ...
  plugins: [myPlugin]
})
```

特点：
- store 仓库在初始化（构造函数内）时就会调用 `plugins` 内部所有的插件函数
- 插件内部可以订阅你要实现的某个功能的回调函数 fn
  - 调用 `store.subscribe(fn)`
  - fn 接收两个参数 `mutation`, `state`
  - `mutation` 格式为： { `type`, `payload` }
  - 订阅的 fn 会依次放在 **store.subs** 数组中
- 在每一次 mutation 之后，就会发布 store.subs 中存储的所有 fn

### store.subscribe 做了什么？
首先来回顾下上篇中提到的内容：
```js
class Store {
  constructor(options) {
    // ...
    this.subs = []
  }

  subscribe(fn) {
    this.subs.push(fn);
  }
}
```
可以看出 subscribe 内部是向 this.subs 中添加一个 fn
下面继续来看 传入的 fn 触发时间

### plugins 触发流程
### mutations option
首先，开发者需要在 store 初始化时，传入 `mutations` 的字段 option
```js
new Store({
  state: {
    count: 1,
  },
  mutations: {
    syncCountIncrement(store, payload) {
      store.state.count += payload;
    }
  },
  // ..
})
```
> syncCountIncrement 为数量累加的函数名

### 用户触发增加按钮时提交改变：
```js
store.commit('syncCountIncrement', 1);
```

### 如果不进行 AOP 处理的逻辑
用户在调用 **commit** 函数时，传入的 type 和 payload，直接触发。

```js
class Store {
  constructor(options) {
    this.mutations.syncCountIncrement = function(store, payload) {
      store.state.count += payload;
    }
  }
  commit = (type, payload) => this.mutations[type](this, payload);
}
```
以上能看到，状态在改变的前后，很难扩展状态变化的监控逻辑。

接下来继续来看源码中大致实现的思路

### mutations 属性的初始化
```js
// constructor
// 1. 初始化 mutations 属性
this.mutations = Object.create(null);

// install-module
// 2. 注册 mutations
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
> Tip: 这里对用户传入的 syncCountIncrement(store, payload) 函数进行了 AOP 处理，mutations.syncCountIncrement 数据结构特点：
  - 存储了状态中所有的同名（syncCountIncrement）mutation 函数数组集合
  - push 的每一个元素都是函数，且接收 payload 参数
  - 在这个函数内部有两个操作：
    - 触发用户传入的函数 function(store, payload) { store.state.count += payload; }
    - **发布通过 subscribe 订阅的所有插件逻辑**


### commit 逻辑改写
```js
commit = (type, payload) => {
  this.mutations[type].forEach(fn => fn(payload));
}
```

## 插件能做什么？
### 数据持久化 persists
将客户端中用户改变的状态持久存储在服务器，或者是在浏览器的 **localStorage** 中，以免页面刷新后数据就丢失了。
这里采用第二种 localStorage 方式：
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
> Tip: 每一次页面刷新，从 localStorage 中拉取数据，并实时替换逻辑代码中，初始化的 state 值为上一次 mutation 后的值。注意，localStorage 只能存储字符串

### 日志打印 loggers
追踪记录用户改变 state 的 **type**, **payload** 以及改变前后的 **state**
```js
const logger = store => {
  let previousState = store.state;
  store.subscribe(({ type, payload }, nextState) => {
    console.log(`%cmutation ${type}, prev state: ${JSON.stringify(previousState)}, next state: ${JSON.stringify(nextState)}`, 'font-weight: bold')
  })
}
```

## END
Vuex 插件讲到这基本结束啦

Thanks for your time. Please feel free to tell me if there is any problem.