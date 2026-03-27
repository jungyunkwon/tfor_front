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

    // 비로그인 사용자가 인증이 필요한 페이지에 접근할 때
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!isLoggedIn) {
        return next('/auth/login');
      }
    }

    // 이미 로그인한 사용자가 로그인 페이지 등(isGuest)에 접근할 때
    if (to.matched.some(record => record.meta.isGuest)) {
      if (isLoggedIn) {
        return next('/');
      }
    }

    // 그 외는 그냥 통과 (추후 온보딩 상태 API 연동 시 필요한 가드를 여기에 추가)
    next();
  });

  return Router
})
