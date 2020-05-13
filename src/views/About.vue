<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div id='nav'>
      <router-link to='/about/a'>a</router-link> |
      <router-link to='/about/b'>b</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>
