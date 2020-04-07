export let _Vue;

export function install(Vue) {
    if (install.installed && _Vue === Vue) return;
    install.installed = true;

    _Vue = Vue;

    Vue.mixin({
        beforeCreate() {
            if (this.$options.router) {
                this._routerRoot = this;
                this._router = this.$options.router;
                this._router.init(this);
                Vue.util.defineReactive(this, '_route', this._routerRoot.history.current);
            } else {
                this._routerRoot = this.$parent && this.$parent._routerRoot;
            }
        },
    })
}

Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
})

Object.defineProperty(Vue.prototype, '$route', {
    get () {  return this._routerRoot._route }
})