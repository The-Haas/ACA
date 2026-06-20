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
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue')
      },
      {
        path: 'localizacao',
        component: () => import('pages/LocalizacaoPage.vue')
      },
      {
        path: 'tipo-localizacao',
        component: () => import('pages/TipoLocalizacaoPage.vue')
      },
      {
        path: 'descricao-problema',
        component: () => import('pages/DescricaoProblemaPage.vue')
      },
      {
        path: 'resumo-chamado',
        component: () => import('pages/ResumoChamadoPage.vue')
      },
      {
        path: 'orcamentos',
        component: () => import('pages/OrcamentosPage.vue')
      },
      {
        path: 'acompanhamento',
        component: () => import('pages/AcompanhamentoPage.vue')
      }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes