const routes = [
  {
    path: '/',
    component: () => import('layouts/DefaultLayout.vue'),
    children: [
      { path: '', redirect: '/matching' },
      { path: 'matching', component: () => import('pages/MatchingPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
    ]
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'login', component: () => import('pages/LoginPage.vue') },
    ]
  },
  {
    path: '/profilevalues',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', component: () => import('pages/ProfileValuesPage.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
