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

  function decodeJWT (token) {
    try {
      const payload = token.split('.')[1]
      return JSON.parse(atob(payload))
    } catch {
      return null
    }
  }

  Router.beforeEach((to) => {
    const token = localStorage.getItem('token')

    const needLogin = to.matched.some((route) => route.meta.requiresAuth)

    if (needLogin && !token) {
      return '/login'
    }

    if (!token) {
      return
    }

    const tipo = decodeJWT(token)?.tipo
    const telaDoTipo = tipo === 'prestador' ? '/prestador' : '/home'

    // já logado tentando ver a tela de login -> manda para a tela certa
    if (to.path === '/login') {
      return telaDoTipo
    }

    // prestador não acessa a área do cliente, e vice-versa
    if (tipo === 'prestador' && to.path.startsWith('/home')) {
      return '/prestador'
    }

    if (tipo === 'cliente' && to.path.startsWith('/prestador')) {
      return '/home'
    }
  })

  return Router
})