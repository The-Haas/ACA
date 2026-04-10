const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue')
  },
  // {
  //   path: '/app',
  //   component: () => import('layouts/MainLayout.vue'),
  //   children: [
  //     { path: 'home', component: () => import('pages/HomePage.vue') },
  //     { path: 'clientes', component: () => import('pages/ClientesPage.vue') },
  //     { path: 'produtos', component: () => import('pages/ProdutosPage.vue') },
  //     { path: 'vendas', component: () => import('pages/VendasPage.vue') }
  //   ]
  // },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes