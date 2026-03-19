import { defineStore } from 'pinia';
import { authService } from '../services/auth.service';

function getDeviceId() {
    let deviceId = localStorage.getItem('tfor_device_id');
    if (!deviceId) {
        deviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        localStorage.setItem('tfor_device_id', deviceId);
    }
    return deviceId;
}

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
        isLoggedIn: (state) => !!state.userId || !!localStorage.getItem('supabase_access_token'),
    },
    actions: {
        async initAuth() {
            if (this.isInitialized) return;

            const deviceInfo = {
                deviceId: getDeviceId(),
                userAgent: navigator.userAgent,
            };

            const response = await authService.checkLoginStatus(deviceInfo);

            if (!response.error && response.data?.loginStatus === 'Y') {
                this.userId = response.data.userId || null;
                this.access_token = response.data.access_token || null;
                this.refresh_token = response.data.refresh_token || null;
                
                if (this.access_token) {
                    localStorage.setItem('supabase_access_token', this.access_token);
                }
            } else {
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
