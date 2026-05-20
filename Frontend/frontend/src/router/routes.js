const routes = [
  {
    path: '/',
    redirect: '/login'
  },

  {
    path: '/login',
    component: () => import('pages/LoginPage.vue')
  },

  {
    path: '/cadastro-cliente',
    component: () => import('pages/CadastroClientePage.vue')
  },

  {
    path: '/cadastro-prestador',
    component: () => import('pages/CadastroPrestadorPage.vue')
  },

  {
    path: '/home',
    component: () => import('pages/IndexPage.vue')
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes 