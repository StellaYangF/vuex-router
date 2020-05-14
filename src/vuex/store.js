import ModuleCollection from "./module/module-collection";
import installModule from './module/install-module';

let Vue;
class Store {
  constructor(options = {}) {
    if (!Vue && typeof Window !== undefined && Window.Vue) {
      install(Vue);
    }

    // 初始化属性
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

    // 格式化 vuex 数据： modules: { root: { _rawModule: { rootModule }, _children, state } }
    this.modules = new ModuleCollection(options);
    // 注册 state, getters, mutations, actions
    installModule(this, this.state, [], this.modules.root);

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

    // 插件立即执行
    // 提供给用户 mutation 改变的钩子函数，扩展逻辑
    const plugins= options.plugins;
    plugins.forEach(plugin => plugin(this));

  }
  _withCommit(fn) {
    const committing = this._committing;
    this._committing = true;
    fn();
    this._committing = committing;
  }

  replaceState(newState) {
    this._withCommit(() => {
      this.vm.state = newState;
    })
  }

  subscribe(fn) {
    this.subs.push(fn);
  }

  commit = (type, payload) => {
    this._withCommit(() => {
      this.mutations[type].forEach(fn => fn(payload));
    })
  }

  dispatch = (type, payload) => {
    this.actions[type].forEach(fn => fn(payload));
  }

  get state() {
    return this.vm.state;
  }

  registerModule(moduleName, module) {
    this._committing = true;
    if (!Array.isArray(moduleName)) {
      moduleName = [moduleName];
    }

    this.modules.register(moduleName, module);
    installModule(this, this.state, moduleName, module.rawModule)
  }
}

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

export { Store, install, Vue };
