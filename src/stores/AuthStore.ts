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
            nextStep: 'PROFILE' | 'SURVEY' | 'PHOTO' | 'PREVIEW' | 'DONE';
        } | null,
        matchingCount: 0,
    }),
    getters: {
        isLoggedIn: (state) => !!state.session && !!state.user && !!state.access_token,
        isOnboardingCompleted: (state) => state.onboardingStatus?.nextStep === 'DONE',
    },
    actions: {
        async initAuth() {
            if (this.isInitialized) return;

            // getSession은 로컬 스토리지 데이터만 보지만, 
            // getUser는 서버에 직접 세션의 유효성을 확인합니다. (DB Reset 등 대응 가능)
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            const { data: { session } } = await supabase.auth.getSession();

            if (!userError && user && session) {
                this.session = session;
                this.user = user;
                this.userId = user.id || null;
                this.access_token = session.access_token || null;
                this.refresh_token = session.refresh_token || null;
                
                if (this.access_token) {
                    localStorage.setItem('supabase_access_token', this.access_token);
                }
                
                await this.checkOnboardingStatus();
                await this.fetchMatchingCount();
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
            this.userId = user.id || null;
            this.access_token = session?.access_token || null;
            this.refresh_token = session?.refresh_token || null;
            if (this.access_token) {
                localStorage.setItem('supabase_access_token', this.access_token);
            }
            await this.checkOnboardingStatus();
            await this.fetchMatchingCount();
        },
        async fetchMatchingCount() {
            if (!this.userId) return;
            const { data, error } = await supabase
                .from('tb_user_balance')
                .select('balance_amount')
                .eq('user_id', this.userId)
                .maybeSingle();
            
            if (!error && data) {
                this.matchingCount = data.balance_amount;
            }
        },
        async logout() {
            await supabase.auth.signOut();
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
            this.matchingCount = 0;
            localStorage.removeItem('supabase_access_token');
        }
    },
});
