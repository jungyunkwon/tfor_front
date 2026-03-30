import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/AuthStore'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isInitialized) {
      await authStore.initAuth();
    }

    const isLoggedIn = authStore.isLoggedIn;
    const isOnboardingCompleted = authStore.isOnboardingCompleted;

    // 1. 비로그인 사용자가 인증이 필요한 페이지에 접근할 때
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!isLoggedIn) {
        return next('/auth/login');
      }

      // 로그인되었으나 온보딩이 안 된 경우 (온보딩 페이지(/signup)가 아닌 경우에만 리다이렉트)
      if (!isOnboardingCompleted && to.path !== '/signup') {
        return next('/signup');
      }

      // 온보딩이 완료되었으나 온보딩 페이지(/signup)에 머물려 할 때
      if (isOnboardingCompleted && to.path === '/signup') {
        return next('/matching');
      }
    }

    // 2. 이미 로그인한 사용자가 로그인 페이지 등(isGuest)에 접근할 때
    if (to.matched.some(record => record.meta.isGuest)) {
      if (isLoggedIn) {
        // 온보딩 여부에 따라 메인 또는 온보딩 페이지로
        return isOnboardingCompleted ? next('/matching') : next('/signup');
      }
    }

    // 그 외는 그냥 통과
    next();
  });

  return Router
})
