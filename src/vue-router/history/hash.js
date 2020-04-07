import History from './base';

function ensureSlash() {
    if (window.location.href) {
        return;
    }
    window.location.hash = '/';
}

export default class HashHistory extends History {
    constructor(router) {
        super(router);
        this.router = router;

        ensureSlash();
    }

    getCurrentLocation() {
        return window.location.hash.slice(1);
    }
}