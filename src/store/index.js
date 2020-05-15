import Vue from 'vue'
import Vuex from '../vuex'
import _ from 'lodash'
import createLogger from 'vuex/dist/logger'
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

const logger = store => {
  let previousState = store.state;
  store.subscribe(({ type, payload }, nextState) => {
    console.log(`%cmutation ${type}, prev state: ${JSON.stringify(previousState)}, next state: ${JSON.stringify(nextState)}`, 'font-weight: bold')
  })
}

const store =  new Vuex.Store({
  strict: false,
  plugins: [
    persists,
    logger,
    createLogger(),
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
    
  },
  modules: {
    a: {
      namespaced: true,
      state: {
        age: 18,
      },
      getters: {
        myAge(state) {
          return state.age + 1
        }
      },
      mutations: {
        syncIncrement(state, payload) {
          state.age += payload;
        }
      },
      actions: {
        asyncIncrement({commit}, payload) {
          setTimeout(() => commit('a/syncIncrement', payload), 1000);
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