import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createWebHistory,
} from 'vue-router'
import routes from './routes'

export default defineRouter(function (/* { store, ssrContext } */) {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach((to) => {
    const token = localStorage.getItem('token')

    const needLogin = to.matched.some((route) => route.meta.requiresAuth)

    if (needLogin && !token) {
      return '/login'
    }

    if (to.path === '/login' && token) {
      return '/home'
    }
  })

  return Router
})