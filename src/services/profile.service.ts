import { apiRequest } from './api.client';

export const profileService = {
    async getMe() {
        return apiRequest<any>('/profiles/me');
    },

    async updateMe(data: any) {
        return apiRequest<any>('/profiles/me', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
};
