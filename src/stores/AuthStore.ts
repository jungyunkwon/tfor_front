import { defineStore } from 'pinia';
import { supabase } from '../utils/supabase';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as any,
        session: null as any,
        userId: null as string | null,
        access_token: null as string | null,
        refresh_token: null as string | null,
        isInitialized: false,
    }),
    getters: {
        isLoggedIn: (state) => !!state.session || !!localStorage.getItem('supabase_access_token'),
    },
    actions: {
        async initAuth() {
            if (this.isInitialized) return;

            const { data: { session }, error } = await supabase.auth.getSession();

            if (!error && session) {
                this.session = session;
                this.user = session.user;
                this.userId = session.user.id || null;
                this.access_token = session.access_token || null;
                this.refresh_token = session.refresh_token || null;
                
                if (this.access_token) {
                    localStorage.setItem('supabase_access_token', this.access_token);
                }
            } else {
                this.user = null;
                this.session = null;
                this.userId = null;
                this.access_token = null;
                this.refresh_token = null;
                localStorage.removeItem('supabase_access_token');
            }

            this.isInitialized = true;
        },
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
            this.userId = null;
            this.access_token = null;
            this.refresh_token = null;
            localStorage.removeItem('supabase_access_token');
            this.isInitialized = false;
        },
    },
});
