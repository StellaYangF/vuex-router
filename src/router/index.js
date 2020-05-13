import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
    children: [
      {
        path: "a",
        name: "A",
        component: () => import(
          /* webpackChunkName: "a"*/
          "../views/A.vue"
        ),
      },
      {
        path: "b",
        name: "B",
        component: () => import(/* webpackChunkName: "b" */"../views/B.vue"),
      },
    ],
  },
  {
    path: '/todos',
    component: () => import(/* webpackChunkName: "todos" */"@/views/Todos.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
