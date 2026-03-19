const routes = [
  {
    path: '/',
    component: () => import('layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/matching' },
      { path: 'matching', component: () => import('pages/MatchingPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
    ]
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { isGuest: true },
    children: [
      { path: 'login', component: () => import('pages/LoginPage.vue') },
    ]
  },
  {
    path: '/signup',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('pages/SignupPage.vue') },
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
