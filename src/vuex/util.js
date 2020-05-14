export const foreach = (obj, callback) => Object.entries(obj).forEach(([key, value]) => callback(key, value));
export const getState = (store, path) => path.reduce((newState, current) => newState[current], store.state);
 