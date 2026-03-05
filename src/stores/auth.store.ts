import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as any,
        session: null as any,
    }),
    getters: {
        isLoggedIn: (state) => !!state.user,
    },
    actions: {
        setUser(user: any, session: any) {
            this.user = user;
            this.session = session;
            if (session?.access_token) {
                localStorage.setItem('supabase_access_token', session.access_token);
            }
        },
        logout() {
            this.user = null;
            this.session = null;
            localStorage.removeItem('supabase_access_token');
        },
    },
});
