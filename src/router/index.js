import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth.store'

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

    const isLoggedIn = !!authStore.access_token || !!localStorage.getItem('supabase_access_token');
    const hasUserId = !!authStore.userId;

    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!isLoggedIn) {
        next('/auth/login');
      } else if (!hasUserId && to.path !== '/signup') {
        next('/signup'); // 회원가입(프로필 작성)이 안된 경우 강제 이동
      } else if (hasUserId && to.path === '/signup') {
        next('/'); // 이미 프로필 작성이 완료된 유저가 signup 접근 시 막음
      } else {
        next();
      }
    } else if (to.matched.some(record => record.meta.isGuest)) {
      if (isLoggedIn) {
        if (!hasUserId) {
          next('/signup');
        } else {
          next('/');
        }
      } else {
        next();
      }
    } else {
      next();
    }
  });

  return Router
})
