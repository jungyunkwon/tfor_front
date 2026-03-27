import { apiRequest } from './api.client';

export const authService = {
    checkLoginStatus: async (deviceInfo: any) => {
        // 백엔드 요청대로 /api/login/status 엔드포인트 호출
        return apiRequest<{
            loginStatus: 'Y' | 'N';
            access_token?: string;
            refresh_token?: string;
            userId?: string;
        }>('/api/login/status', {
            method: 'POST',
            body: JSON.stringify(deviceInfo),
        });
    },
};
