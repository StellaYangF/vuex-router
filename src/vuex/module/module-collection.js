import { foreach } from '../util';

export default class ModuleCollection{
  constructor(options) {
    this.register([], options);
  }
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