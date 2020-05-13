<template>
    <li 
      @click="$emit('click')"
      :class="{ done, undone }"
      class='todo'
    >
      <slot></slot>
    </li>
</template>

<script>
export default {
  props: {
    done: {
      type: Boolean, 
      required: true,
    }
  },
  computed: {
    undone() {
      return !this.done;
    }
  }
}
</script>

<style scoped>
.todo {
  background: #aaa;
  padding: 20px;
  margin: 8px 0;
  transition: all .5s;
  box-shadow: 0 0 10px 0 rgba(0,0,0,.2);
  border-radius: 4px;
}

.todo.undone:hover {
  opacity: .8;
}

.todo.done {
  background: #42b983;
}
.todo.undone {
  cursor: pointer;
}

</style>
