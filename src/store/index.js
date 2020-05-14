import Vue from 'vue'
import Vuex from '../vuex'
import _ from 'lodash'
Vue.use(Vuex);

const persists = store => {
  // mock data from server db
  let local = localStorage.getItem('Vuex:state');
  if (local) {
    store.replaceState(JSON.parse(local));
  }
  // mock 每一次数据变了之后就往数据库里存数据
  store.subscribe((mutation, state) =>  localStorage.setItem('Vuex:state', JSON.stringify(state)))
}

const store =  new Vuex.Store({
  strict: false,
  plugins: [
    persists,
  ],
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
      if (state.todos[id].done) return;
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


store.registerModule('b', {
  state: 'b',
  mutations:{
    syncChangeB(state) {
      state.b = 'bb';
    }
  }
})

export default store;