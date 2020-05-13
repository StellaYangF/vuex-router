import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

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
      namespaced: true,
      state: {
        age: 18,
      },
      mutations: {
        aysncIncrement(state, payload) {
          state.age += payload;
        }
      }
    }
  }
})
