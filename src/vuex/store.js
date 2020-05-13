import ModuleCollection from "./module/module-collection";

let Vue;
class Store {
  constructor(options = {}) {
    // 如果用户没有没有手动注册 Vue.use， 则自动调用
    if (!Vue && typeof Window !== undefined && Window.Vue) {
      install(Vue);
    }
    const { plugins } = options;
    this.strict = options.strict || false;
    this._committing = false;
    this.vm = new Vue({
      date: {
        state: options.state,
      },
    });
    this.getters = Object.create(null);
    this.mutations = Object.create(null);
    this.actions = Object.create(null);
    this.subs = [];

    this.modules = new ModuleCollection(options);
    installModule(this, this.state, [], this.modules.root);

    plugins.forEach((plugin) => plugin(this));

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

  }
  _widthCommit(fn) {
    const committing = this._committing;
    this._committing = true;
    fn();
    this._committing = committing;
  }

  replaceState(newState) {
    this._widthCommit(() => {
      this.vm.state = newState;
    })
  }

  subscribe(fn) {
    this.subs.push(fn);
  }

  commit = (type, payload) => {
    this._widthCommit(() => {
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

function installModule(store, rootState, path, rawModule) {
  let getters = rawModule._raw.getters;
}

class ModuleCollection{
  constructor(options) {
    this.register([], options);
  }

  register(path, rootModule) {
    
  }
}

export { Store, install };
