
export default class History {
    constructor(router) {
        this.router = router;
        this.current = createRoute(null, {
            path: '/'
        });
    }

    transitionTo(location, callback) {
        let r = this.router.match(location);
        console.log(r);
        callback && callback();
    }

    setupListener() {
        window.addEventListener('hashchange', () => {
            this.transitionTo(window.location.hash.slice(1));
        })
    }
}

export function createRoute(record, options) {
    let res = [];
    if (record) {
        while (record) { // /about/a => [/about, /about/a]
            res.unshift();
            record = record.parent;
        }
    }
    return {
        ...options, // location: xxx
        matched: res,
    }
}