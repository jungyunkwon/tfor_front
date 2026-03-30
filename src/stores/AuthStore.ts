import { defineStore } from 'pinia';
import { supabase } from '../utils/supabase';
import { signupService } from '../services/signupService';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as any,
        session: null as any,
        userId: null as string | null,
        access_token: null as string | null,
        refresh_token: null as string | null,
        isInitialized: false,
        onboardingStatus: null as {
            profileCompletedYn: string;
            surveyCompletedYn: string;
            photoCompletedYn: string;
            previewCompletedYn: string;
        } | null,
    }),
    getters: {
        isLoggedIn: (state) => !!state.session || !!localStorage.getItem('supabase_access_token'),
        isOnboardingCompleted: (state) => state.onboardingStatus?.profileCompletedYn === 'Y',
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
                
                await this.checkOnboardingStatus();
            } else {
                this.resetAuth();
            }

            this.isInitialized = true;
        },
        async checkOnboardingStatus() {
            const { data } = await signupService.getOnboardingStatus();
            if (data) {
                this.onboardingStatus = data;
            }
        },
        async setUser(user: any, session: any) {
            this.user = user;
            this.session = session;
            if (session?.access_token) {
                localStorage.setItem('supabase_access_token', session.access_token);
            }
            await this.checkOnboardingStatus();
        },
        logout() {
            this.resetAuth();
            this.isInitialized = false;
        },
        resetAuth() {
            this.user = null;
            this.session = null;
            this.userId = null;
            this.access_token = null;
            this.refresh_token = null;
            this.onboardingStatus = null;
            localStorage.removeItem('supabase_access_token');
        }
    },
});
