<template>
<div>
  <ul class='todos'>
     <TodoItem
      v-for='todo in todos'
      :key='todo.text'
      @click='syncTodoDone(todo.id)'
      :done="todo.done"
     >{{ todo.text }}</TodoItem>
    </ul>
    <p>age is {{  age}}.</p>
    <p>myAge is {{  myAge}}.</p>
    <button @click='asyncIncrement(1)'>syncIncrement</button>
    <!-- <p>myAge is {{  myAge}}.</p>
    <p>lilyAge is {{  lilyAge}}.</p> -->
    </div>
</template>

<script>
import TodoItem from './TodoItem';
import { mapState, mapMutations, mapActions, mapGetters } from '../vuex';

export default {
  data() {
    return {
      tomAge: 1,
    }
  },
  computed: {
    ...mapState({
      todos: "todos",
      age: state => state.a.age
    }),
    ...mapGetters('a', ['myAge'])
  },
  // {
  //   ...mapState({
  //     todos: state => state.todos,
  //     age: state => state.a.age
  //   })
  // },
  // 传数组
  // mapState([
  //   "todos",
  // ]),
  
  // two 传对象
  // mapState({
  //   todos: state => state.todos, // 箭头函数
  //   myAge: 'age', // 字符串别名
  //   lilyAge(state) { // normal function
  //     return state.age + this.tomAge
  //   }
  // }),
  // three
  // {
    // todos() {
    //   return this.$store.state.todos
    // },
    // age() {
    //   return this.$store.state.age
    // },
  // },

  methods: {
    ...mapMutations([
      "syncTodoDone",
    ]),
    ...mapActions('a', [
      "asyncIncrement"
    ]),
    // aysncIncrement(payload) {
    //   this.$store.dispatch('a/asyncIncrement', payload)
    // }
  },

  components: {
    TodoItem,
  },

  mounted() {
    console.log(this);
  }
}
</script>

<style scoped>
.todos {
  padding: 10px;
  width: 80%;
  margin: 10px auto;
}
</style>