<template>
  <ul class='todos'>
     <TodoItem
      v-for='todo in todos'
      :key='todo.text'
      @click='handleTodoDone(todo)'
      :done="todo.done"
     >{{ todo.text }}</TodoItem>
    </ul>
</template>

<script>
import TodoItem from './TodoItem';

export default {
    data() {
    return {
      todos:  this.$store.state.todos,
    };
  },

  methods: {
    handleTodoDone(todo) {
      let { done, id } = todo;
      if (!done) {
        this.$store.commit('syncTodoDone', id);
      }
    }
  },

  components: {
    TodoItem,
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