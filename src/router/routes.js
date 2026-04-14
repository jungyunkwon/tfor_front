const routes = [
  {
    path: '/',
    component: () => import('layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/matching' },
      { path: 'matching', component: () => import('pages/matching/MatchingPage.vue') },
      { path: 'evaluation', component: () => import('pages/matching/ReviewEdit.vue') },
      { path: 'profile', component: () => import('pages/profile/ProfilePage.vue') },
      { path: 'profile/basic', component: () => import('pages/profile/ProfileBasicEdit.vue') },
      { path: 'profile/values', component: () => import('pages/profile/ProfileValuesEdit.vue') },
      { path: 'profile/customer-center', component: () => import('pages/profile/CustomerCenterPage.vue') },
      { path: 'profile/alarm', component: () => import('pages/profile/AlarmPage.vue') },
      { path: 'profile/block-contacts', component: () => import('pages/profile/ProfileBlockContactsEdit.vue') },
      { path: 'target/edit', component: () => import('pages/target/TargetEdit.vue') },
      { path: 'payment', component: () => import('pages/payment/PaymentPage.vue') },
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
    meta: { requiresAuth: true }, // 또는 비회원 가입 플로우인 경우 false
    children: [
      { path: '', component: () => import('pages/SignupProfilePage.vue') },
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
